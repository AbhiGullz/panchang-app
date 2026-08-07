from __future__ import annotations

import json
import logging
from datetime import date
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import os
from redis.asyncio import Redis
from redis.exceptions import RedisError

from engine.core import AYANAMSA, ENGINE_VERSION, compute_daily_panchang
from engine.festivals import compute_festivals_for_year
from engine.i18n.names import LANGUAGES, get_lang_names
from engine.models import MuhurtaWindowModel, PanchangResponseModel
from engine.muhurta import CATEGORY_RULES, compute_category_windows

logger = logging.getLogger(__name__)
app = FastAPI(title="Panchang API", version="0.3.0")
VALID_CALENDARS = {
    "purnimanta",
    "amanta",
    "gujarati",
    "marathi",
    "nanakshahi",
    "tamil",
    "malayalam",
    "bengali",
}

_CACHE_TTL_SECONDS = 60 * 60 * 24
_redis_client: Redis | None = None
_warned_redis_unavailable = False


class MuhurtaResponseModel(BaseModel):
    date: str
    category: str
    location: dict[str, Any]
    windows: list[MuhurtaWindowModel]
    guidance: str
    source: str = "swiss-ephemeris"


class FestivalsResponseModel(BaseModel):
    year: int
    calendar: str
    lang: str
    festivals: list[dict[str, Any]]
    source: str = "swiss-ephemeris"


async def get_redis_client() -> Redis | None:
    global _redis_client, _warned_redis_unavailable
    if _redis_client is not None:
        return _redis_client
    if os.environ.get("PANCHANG_DISABLE_CACHE", "").lower() in {"1", "true", "yes"}:
        return None
    try:
        client = Redis(
            host=os.environ.get("PANCHANG_REDIS_HOST", "localhost"),
            port=int(os.environ.get("PANCHANG_REDIS_PORT", "6379")),
            decode_responses=True,
        )
        await client.ping()
        _redis_client = client
        return client
    except RedisError as exc:
        if not _warned_redis_unavailable:
            logger.warning("Redis unavailable, continuing without cache: %s", exc)
            _warned_redis_unavailable = True
        return None


async def get_cached_panchang(cache_key: str) -> dict[str, Any] | None:
    client = await get_redis_client()
    if client is None:
        return None
    try:
        cached = await client.get(cache_key)
    except RedisError as exc:
        logger.warning("Redis get failed for %s: %s", cache_key, exc)
        return None
    if not cached:
        return None
    return json.loads(cached)


async def set_cached_panchang(cache_key: str, payload: dict[str, Any]) -> None:
    client = await get_redis_client()
    if client is None:
        return
    try:
        await client.set(cache_key, json.dumps(payload), ex=_CACHE_TTL_SECONDS)
    except RedisError as exc:
        logger.warning("Redis set failed for %s: %s", cache_key, exc)


def _cache_key(target_date: date, lat: float, lng: float, tz: str, calendar: str, lang: str) -> str:
    return (
        f"panchang:{target_date.isoformat()}:{lat:.2f}:{lng:.2f}:{tz}:"
        f"{calendar}:{lang}:{AYANAMSA}:{ENGINE_VERSION}"
    )


def _location_name(lat: float, lng: float) -> str:
    return f"{lat:.4f},{lng:.4f}"


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "0.3.0"}


@app.get("/api/v1/panchang", response_model=PanchangResponseModel)
async def get_panchang(
    date_value: date = Query(..., alias="date"),
    lat: float = Query(...),
    lng: float = Query(...),
    tz: str = Query(...),
    calendar: str = Query("purnimanta"),
    lang: str = Query("en"),
) -> PanchangResponseModel:
    if calendar not in VALID_CALENDARS:
        raise HTTPException(status_code=400, detail=f"Unsupported calendar: {calendar}")
    if lang not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
    cache_key = _cache_key(date_value, lat, lng, tz, calendar, lang)
    cached = await get_cached_panchang(cache_key)
    if cached is not None:
        return PanchangResponseModel.model_validate(cached)

    try:
        payload = compute_daily_panchang(
            date_iso=date_value.isoformat(),
            latitude=lat,
            longitude=lng,
            timezone_name=tz,
            location_name=_location_name(lat, lng),
            calendar_school=calendar,
            lang=lang,
        )
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    payload["lang_names"] = get_lang_names(payload, lang)
    await set_cached_panchang(cache_key, payload)
    return PanchangResponseModel.model_validate(payload)


@app.get("/api/v1/muhurta", response_model=MuhurtaResponseModel)
async def get_muhurta(
    date_value: date = Query(..., alias="date"),
    lat: float = Query(...),
    lng: float = Query(...),
    tz: str = Query(...),
    category: str = Query("travel"),
    calendar: str = Query("purnimanta"),
) -> MuhurtaResponseModel:
    if calendar not in VALID_CALENDARS:
        raise HTTPException(status_code=400, detail=f"Unsupported calendar: {calendar}")
    panchang = compute_daily_panchang(
        date_iso=date_value.isoformat(),
        latitude=lat,
        longitude=lng,
        timezone_name=tz,
        location_name=_location_name(lat, lng),
        calendar_school=calendar,
        lang="en",
    )
    normalized_category = category if category in CATEGORY_RULES else "travel"
    windows = compute_category_windows(panchang, normalized_category)
    return MuhurtaResponseModel(
        date=date_value.isoformat(),
        category=normalized_category,
        location={"lat": lat, "lng": lng, "tz": tz, "calendar": calendar},
        windows=[MuhurtaWindowModel.model_validate(window) for window in windows],
        guidance="Calculated timing reference only; not a claim of religious authority.",
    )


@app.get("/api/v1/festivals", response_model=FestivalsResponseModel)
async def get_festivals(
    year: int = Query(...),
    calendar: str = Query("amanta"),
    lang: str = Query("en"),
) -> FestivalsResponseModel:
    if calendar not in VALID_CALENDARS:
        raise HTTPException(status_code=400, detail=f"Unsupported calendar: {calendar}")
    return FestivalsResponseModel(
        year=year,
        calendar=calendar,
        lang=lang,
        festivals=compute_festivals_for_year(year, calendar=calendar, lang=lang),
    )
