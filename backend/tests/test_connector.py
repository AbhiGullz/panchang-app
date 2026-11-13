from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def rpc(method, params=None):
    return client.post("/api/v1/mcp", json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}})


def test_handshake_and_read_only_catalog():
    assert rpc("initialize", {"protocolVersion": "2025-06-18"}).json()["result"]["protocolVersion"] == "2025-06-18"
    tools = rpc("tools/list").json()["result"]["tools"]
    assert {tool["name"] for tool in tools} == {"find_city", "daily_panchang", "festival_dates", "puja_window"}
    assert all(tool["annotations"]["readOnlyHint"] for tool in tools)


def test_local_puja_matches_website_api():
    args = {"year": 2026, "lat": 40.51, "lng": -74.86, "tz": "America/New_York"}
    expected = client.get("/api/v1/festivals", params={**args, "calendar": "purnimanta"}).json()["festivals"]
    result = rpc("tools/call", {"name": "puja_window", "arguments": {**args, "festival": "diwali"}}).json()["result"]
    assert result["structuredContent"]["festivals"] == [row for row in expected if row.get("id") == "diwali"]


def test_daily_tool_and_input_validation():
    args = {"date": "2026-11-06", "lat": 40.51, "lng": -74.86, "tz": "America/New_York"}
    assert rpc("tools/call", {"name": "daily_panchang", "arguments": args}).json()["result"]["structuredContent"]["date"] == args["date"]
    assert rpc("tools/call", {"name": "daily_panchang", "arguments": {**args, "date": "9999-01-01"}}).json()["result"]["isError"]
    assert rpc("tools/call", {"name": "delete_tithi"}).json()["error"]["code"] == -32602


def test_transport_limits():
    assert client.get("/api/v1/mcp").status_code == 405
    assert client.post("/api/v1/mcp", headers={"Origin": "https://example.org"}, json={}).status_code == 403
    assert client.post("/api/v1/mcp", json={"large": "x" * 17000}).status_code == 413
    assert client.post("/api/v1/mcp", json={"jsonrpc": "2.0", "method": "notifications/initialized"}).status_code == 202
