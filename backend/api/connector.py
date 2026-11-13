"""Stateless, read-only MCP over Streamable HTTP."""
import json
from collections import deque
from datetime import date as Date
from time import monotonic
from typing import Literal

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, ValidationError

router = APIRouter()
VERSIONS = ("2025-11-25", "2025-06-18", "2025-03-26")
SITE = "https://gajaapanchang.org"
_calls = deque()


class Place(BaseModel):
    model_config = ConfigDict(extra="forbid")
    city: str = Field(min_length=2, max_length=100, description="City or town only; no street address")
    lang: Literal["en", "hi", "mr", "ta", "te", "kn", "ml", "gu", "bn", "pa"] = "en"


class Location(BaseModel):
    model_config = ConfigDict(extra="forbid")
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    tz: str = Field(min_length=1, max_length=64, description="IANA time zone from find_city")
    calendar: Literal["amanta", "purnimanta", "gujarati", "marathi", "nanakshahi", "tamil", "malayalam", "bengali"] = "purnimanta"
    lang: Literal["en", "hi", "mr", "ta", "te", "kn", "ml", "gu", "bn", "pa"] = "en"


class Daily(Location):
    date: Date = Field(ge=Date(1900, 1, 1), le=Date(2100, 12, 31))


class Festivals(Location):
    year: int = Field(ge=1900, le=2100)


class Puja(Festivals):
    festival: Literal["dhanteras", "naraka", "diwali", "govardhan", "bhai-dooj"]


TOOLS = {
    "find_city": (Place, "Resolve a city to candidate coordinates and time zones. Ask the user if ambiguous."),
    "daily_panchang": (Daily, "Calculate the local Panchang for a date. Resolve the city first; do not guess coordinates or time zone."),
    "festival_dates": (Festivals, "List public festival dates for the selected city and year."),
    "puja_window": (Puja, "Get a general local ritual window for Dhanteras, Roop/Narak Chaturdashi, Diwali, Govardhan Puja or Bhai Dooj. Not a personalized or lagna-based timing."),
}


async def run_tool(name, raw, request):
    from .main import geocode, get_festivals, get_panchang

    model, _ = TOOLS[name]
    args = model.model_validate(raw).model_dump()
    if name == "find_city":
        cities = await geocode(request, q=args["city"], lang=args["lang"], limit=5)
        return {"candidates": [city.model_dump() for city in cities]}
    if name == "daily_panchang":
        args["date_value"] = args.pop("date")
        result = await get_panchang(**args)
        return result.model_dump(mode="json")
    festival = args.pop("festival", None)
    result = await get_festivals(**args)
    rows = [row for row in result.festivals if festival is None or row.get("id") == festival]
    return {"year": args["year"], "location": {key: args[key] for key in ("lat", "lng", "tz")},
            "calendar": args["calendar"], "festivals": rows}


@router.get("/api/v1/mcp", include_in_schema=False)
async def no_event_stream():
    return Response(status_code=405, headers={"Allow": "POST"})


@router.post("/api/v1/mcp", include_in_schema=False)
async def mcp(request: Request):
    if request.headers.get("origin") not in (None, SITE):
        raise HTTPException(403, "Origin not allowed")
    if request.headers.get("mcp-protocol-version", VERSIONS[-1]) not in VERSIONS:
        raise HTTPException(400, "Unsupported MCP protocol version")
    if request.headers.get("content-type", "").split(";")[0].strip().lower() != "application/json":
        raise HTTPException(415, "Expected JSON")
    body = bytearray()
    async for chunk in request.stream():
        if len(body) + len(chunk) > 16384:
            raise HTTPException(413, "Request too large")
        body.extend(chunk)
    try:
        message = json.loads(body)
    except (ValueError, UnicodeError, RecursionError):
        message = None
    rpc_id = message.get("id") if isinstance(message, dict) else None

    def reply(*, result=None, error=None):
        return JSONResponse({"jsonrpc": "2.0", "id": rpc_id,
                             **({"result": result} if error is None else {"error": error})},
                            headers={"Cache-Control": "no-store"})

    def fail(code, description):
        return reply(error={"code": code, "message": description})

    if not isinstance(message, dict) or message.get("jsonrpc") != "2.0" or not isinstance(message.get("method"), str):
        return fail(-32600, "Invalid request")
    if "id" in message and type(rpc_id) not in (str, int):
        rpc_id = None
        return fail(-32600, "Invalid request ID")
    method = message["method"]
    params = message.get("params", {})
    if "id" not in message:
        return Response(status_code=202)
    if not isinstance(params, dict):
        return fail(-32602, "Invalid parameters")
    if method == "initialize":
        version = params.get("protocolVersion")
        return reply(result={"protocolVersion": version if version in VERSIONS else VERSIONS[0],
                             "capabilities": {"tools": {}}, "serverInfo": {"name": "gajaa-panchang", "version": "1.0.0"},
                             "instructions": "Read-only public calendar data. Use city names only. Report the local date and timezone; never invent missing times."})
    if method == "ping":
        return reply(result={})
    if method == "tools/list":
        return reply(result={"tools": [
            {"name": name, "description": description, "inputSchema": model.model_json_schema(),
             "annotations": {"readOnlyHint": True, "destructiveHint": False, "openWorldHint": name == "find_city"}}
            for name, (model, description) in TOOLS.items()]})
    if method != "tools/call":
        return fail(-32601, "Method not found")
    name = params.get("name")
    if not isinstance(name, str) or name not in TOOLS or not isinstance(params.get("arguments", {}), dict):
        return fail(-32602, "Unknown tool or invalid arguments")
    now = monotonic()
    while _calls and now - _calls[0] >= 60:
        _calls.popleft()
    if len(_calls) >= 60:
        raise HTTPException(429, "Connector busy; try again shortly", headers={"Retry-After": "60"})
    _calls.append(now)
    try:
        data = await run_tool(name, params.get("arguments", {}), request)
    except (ValidationError, HTTPException, ValueError):
        return reply(result={"isError": True, "content": [{"type": "text", "text": "Invalid calendar inputs or lookup unavailable. Check the date, city and time zone."}]})
    data["source_url"] = SITE + "/"
    return reply(result={"structuredContent": data, "content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False)}]})
