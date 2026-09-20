from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from timezonefinder import TimezoneFinder
from redis.asyncio import Redis
from redis.exceptions import RedisError

from engine.core import AYANAMSA, ENGINE_VERSION, _window_with_iso, compute_daily_panchang
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
_GEOCODE_CACHE_TTL_SECONDS = 60 * 5
_GEOCODE_MIN_INTERVAL_SECONDS = 1.0
_GEOCODE_RATE_LIMIT_WINDOW_SECONDS = 60.0
_GEOCODE_RATE_LIMIT_REQUESTS = 30
_GEOCODE_USER_AGENT = os.environ.get(
    "PANCHANG_GEOCODER_USER_AGENT",
    "PanchangApp/0.1 (https://github.com/AbhiGullz/panchang-app)",
)
_geocode_cache: dict[tuple[str, ...], tuple[float, Any]] = {}
_geocode_requests: dict[str, list[float]] = {}
_last_geocode_request = 0.0
_geocode_lock = asyncio.Lock()
_timezone_finder = TimezoneFinder()
_redis_client: Redis | None = None
_warned_redis_unavailable = False
_frontend_dist = Path(os.environ["PANCHANG_FRONTEND_DIST"]).resolve() if os.environ.get("PANCHANG_FRONTEND_DIST") else None


class GeocodeResultModel(BaseModel):
    display_name: str = Field(min_length=1)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    tz: str = Field(min_length=1)

    @classmethod
    def from_nominatim(cls, item: dict[str, Any], lang: str = "en") -> "GeocodeResultModel | None":
        try:
            lat = float(item["lat"])
            lng = float(item["lon"])
            timezone_name = _timezone_for_coordinates(lat, lng)
            if timezone_name is None:
                return None
            address = item.get("address") if isinstance(item.get("address"), dict) else {}
            city = next((str(address[key]).strip() for key in ("city", "town", "municipality", "village", "county") if address.get(key)), "")
            city = _localized_place_name(city, item.get("namedetails"), lang)
            state = _localized_place_name(str(address.get("state") or address.get("state_district") or "").strip(), None, lang)
            country = str(address.get("country") or "").strip()
            location_parts = [part for part in (city, state, country) if part]
            display_name = ", ".join(dict.fromkeys(location_parts)) or str(item["display_name"]).strip()
            return cls(display_name=display_name, lat=lat, lng=lng, tz=timezone_name)
        except (KeyError, TypeError, ValueError):
            return None


_PLACE_NAME_OVERRIDES = {
    "flemington": {
        "hi": "फ्लेमिंग्टन", "mr": "फ्लेमिंग्टन", "ta": "ஃப்ளெமிங்டன்", "te": "ఫ్లెమింగ్టన్",
        "kn": "ಫ್ಲೆಮಿಂಗ್ಟನ್", "ml": "ഫ്ലെമിങ്ടൺ", "gu": "ફ્લેમિંગ્ટન", "bn": "ফ্লেমিংটন", "pa": "ਫਲੇਮਿੰਗਟਨ",
    },
    "new jersey": {
        "hi": "न्यू जर्सी", "mr": "न्यू जर्सी", "ta": "நியூ ஜெர்சி", "te": "న్యూ జెర్సీ",
        "kn": "ನ್ಯೂ ಜೆರ್ಸಿ", "ml": "ന്യൂ ജേഴ്സി", "gu": "ન્યૂ જર્સી", "bn": "নিউ জার্সি", "pa": "ਨਿਊ ਜਰਸੀ",
    },
}


def _localized_place_name(city: str, namedetails: Any, lang: str) -> str:
    """Prefer an OSM native city name; transliterate Latin names for Devanagari UI.

    Nominatim localizes regions and countries but most US city records have no
    Hindi/Marathi name.  A readable phonetic fallback is less jarring than
    mixing Latin city text into an otherwise Devanagari location label.
    """
    if not city:
        return city
    override = _PLACE_NAME_OVERRIDES.get(city.casefold(), {}).get(lang)
    if override:
        return override
    if isinstance(namedetails, dict):
        localized = namedetails.get(f"name:{lang}") or namedetails.get(f"official_name:{lang}")
        if isinstance(localized, str) and localized.strip():
            return localized.strip()
    if lang in {"hi", "mr"} and city.isascii() and any(character.isalpha() for character in city):
        return _latin_to_devanagari(city)
    return city


def _latin_to_devanagari(value: str) -> str:
    """Small phonetic fallback for Latin place names in Hindi and Marathi.

    This deliberately leaves punctuation and digits intact and is only used
    when OpenStreetMap has no native-language place name.
    """
    consonants = {
        "ch": "च", "sh": "श", "th": "थ", "dh": "ध", "ph": "फ", "bh": "भ", "kh": "ख", "gh": "घ",
        "j": "ज", "k": "क", "q": "क", "c": "क", "g": "ग", "t": "ट", "d": "ड", "n": "न",
        "p": "प", "b": "ब", "m": "म", "y": "य", "r": "र", "l": "ल", "v": "व", "w": "व",
        "f": "फ", "s": "स", "h": "ह", "z": "ज़", "x": "क्स",
    }
    vowels = {"a": "ा", "e": "े", "i": "ि", "o": "ो", "u": "ु"}
    independent_vowels = {"a": "अ", "e": "ए", "i": "इ", "o": "ओ", "u": "उ"}
    result: list[str] = []
    previous_was_consonant = False
    index = 0
    lowered = value.lower()
    while index < len(value):
        char = lowered[index]
        if not char.isalpha():
            result.append(value[index])
            previous_was_consonant = False
            index += 1
            continue
        if lowered[index:index + 2] == "ng":
            if previous_was_consonant:
                result.append("्")
            result.append("ंग")
            previous_was_consonant = True
            index += 2
            continue
        pair = lowered[index:index + 2]
        consonant = consonants.get(pair) if pair in consonants else consonants.get(char)
        if consonant:
            if previous_was_consonant:
                result.append("्")
            result.append(consonant)
            previous_was_consonant = True
            index += len(pair) if pair in consonants else 1
            continue
        if char in vowels:
            result.append(vowels[char] if previous_was_consonant else independent_vowels[char])
            previous_was_consonant = False
            index += 1
            continue
        result.append(value[index])
        previous_was_consonant = False
        index += 1
    transliterated = "".join(result)
    # In the common English place-name ending "-ton", the written "o" is
    # normally not pronounced as a full vowel (Flemington → फ्लेमिंग्टन).
    if lowered.endswith("ton") and transliterated.endswith("टोन"):
        return f"{transliterated[:-3]}टन"
    return transliterated


def _timezone_for_coordinates(lat: float, lng: float) -> str | None:
    timezone_name = _timezone_finder.timezone_at(lat=lat, lng=lng)
    if not timezone_name:
        return None
    try:
        ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError:
        return None
    return timezone_name


def _nominatim_language(lang: str) -> str:
    """Return a safe, supported language tag for Nominatim display names."""
    return lang if lang in LANGUAGES else "en"


def _validate_timezone(timezone_name: str) -> str:
    """Validate an IANA timezone before it can reach cache or calculation code."""
    try:
        ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError as exc:
        raise HTTPException(status_code=422, detail="tz must be a valid IANA timezone name.") from exc
    return timezone_name


def _check_geocode_rate_limit(request: Request) -> None:
    """Apply an in-process per-client guard; the reverse proxy remains the primary limit."""
    client_key = request.client.host if request.client else "unknown"
    now = time.monotonic()
    requests = [entry for entry in _geocode_requests.get(client_key, []) if now - entry < _GEOCODE_RATE_LIMIT_WINDOW_SECONDS]
    if len(requests) >= _GEOCODE_RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many location searches. Please try again shortly.")
    requests.append(now)
    _geocode_requests[client_key] = requests


def _geocode_cache_get(cache_key: tuple[str, ...]) -> Any | None:
    cached = _geocode_cache.get(cache_key)
    if cached and time.monotonic() - cached[0] < _GEOCODE_CACHE_TTL_SECONDS:
        return cached[1]
    _geocode_cache.pop(cache_key, None)
    return None


def _geocode_cache_set(cache_key: tuple[str, ...], value: Any) -> None:
    # Keep the local cache bounded even when the provider is unavailable.
    if len(_geocode_cache) >= 256:
        oldest_key = min(_geocode_cache, key=lambda key: _geocode_cache[key][0])
        _geocode_cache.pop(oldest_key, None)
    _geocode_cache[cache_key] = (time.monotonic(), value)


async def _search_nominatim(query: str, limit: int, lang: str = "en") -> list[dict[str, Any]]:
    global _last_geocode_request
    cache_key = ("search", _nominatim_language(lang), query.casefold(), str(limit))
    cached = _geocode_cache_get(cache_key)
    if cached is not None:
        return cached
    async with _geocode_lock:
        wait = _GEOCODE_MIN_INTERVAL_SECONDS - (time.monotonic() - _last_geocode_request)
        if wait > 0:
            await asyncio.sleep(wait)
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "jsonv2",
                    "limit": limit,
                    "addressdetails": 1,
                    "namedetails": 1,
                    "accept-language": _nominatim_language(lang),
                },
                headers={"User-Agent": _GEOCODE_USER_AGENT, "Accept": "application/json"},
            )
        _last_geocode_request = time.monotonic()
        response.raise_for_status()
        result = response.json()
        if not isinstance(result, list):
            raise ValueError("Unexpected geocoder response")
        _geocode_cache_set(cache_key, result)
        return result


async def _reverse_nominatim(lat: float, lng: float, lang: str = "en") -> dict[str, Any]:
    global _last_geocode_request
    cache_key = ("reverse", _nominatim_language(lang), f"{lat:.4f}", f"{lng:.4f}")
    cached = _geocode_cache_get(cache_key)
    if cached is not None:
        return cached
    async with _geocode_lock:
        wait = _GEOCODE_MIN_INTERVAL_SECONDS - (time.monotonic() - _last_geocode_request)
        if wait > 0:
            await asyncio.sleep(wait)
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": lat,
                    "lon": lng,
                    "format": "jsonv2",
                    "addressdetails": 1,
                    "namedetails": 1,
                    "accept-language": _nominatim_language(lang),
                },
                headers={"User-Agent": _GEOCODE_USER_AGENT, "Accept": "application/json"},
            )
        _last_geocode_request = time.monotonic()
        response.raise_for_status()
        result = response.json()
        if not isinstance(result, dict):
            raise ValueError("Unexpected reverse geocoder response")
        _geocode_cache_set(cache_key, result)
        return result


@app.get("/api/v1/reverse-geocode", response_model=GeocodeResultModel)
async def reverse_geocode(
    request: Request,
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    lang: str = Query("en"),
) -> GeocodeResultModel:
    if lang not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
    _check_geocode_rate_limit(request)
    try:
        result = GeocodeResultModel.from_nominatim(await _reverse_nominatim(lat, lng, lang), lang)
    except Exception as exc:
        logger.warning("Reverse geocoder request failed: %s", exc)
        raise HTTPException(status_code=502, detail="Location lookup is temporarily unavailable.") from exc
    if result is None:
        raise HTTPException(status_code=422, detail="A timezone could not be resolved for this location.")
    return result


@app.get("/api/v1/geocode", response_model=list[GeocodeResultModel])
async def geocode(
    request: Request,
    q: str = Query(..., min_length=2, max_length=120),
    limit: int = Query(8, ge=1, le=8),
    lang: str = Query("en"),
) -> list[GeocodeResultModel]:
    if lang not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
    query = q.strip()
    if len(query) < 2:
        raise HTTPException(status_code=422, detail="Search query must contain at least 2 characters.")
    _check_geocode_rate_limit(request)
    try:
        raw_results = await _search_nominatim(query, limit, lang)
    except Exception as exc:
        logger.warning("Geocoder request failed: %s", exc)
        raise HTTPException(status_code=502, detail="Location search is temporarily unavailable.") from exc
    return [result for item in raw_results if (result := GeocodeResultModel.from_nominatim(item, lang)) is not None]


class MuhurtaResponseModel(BaseModel):
    date: str
    category: str
    location: dict[str, Any]
    windows: list[MuhurtaWindowModel]
    horizon_exhausted: bool = False
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
    try:
        return json.loads(cached)
    except (TypeError, json.JSONDecodeError) as exc:
        logger.warning("Invalid cached payload for %s: %s", cache_key, exc)
        return None


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
        f"panchang:{target_date.isoformat()}:{lat:.6f}:{lng:.6f}:{tz}:"
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
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    tz: str = Query(...),
    calendar: str = Query("purnimanta"),
    lang: str = Query("en"),
) -> PanchangResponseModel:
    if calendar not in VALID_CALENDARS:
        raise HTTPException(status_code=400, detail=f"Unsupported calendar: {calendar}")
    if lang not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
    _validate_timezone(tz)
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
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    tz: str = Query(...),
    category: str = Query("travel"),
    calendar: str = Query("purnimanta"),
) -> MuhurtaResponseModel:
    if calendar not in VALID_CALENDARS:
        raise HTTPException(status_code=400, detail=f"Unsupported calendar: {calendar}")
    if category not in CATEGORY_RULES:
        raise HTTPException(status_code=400, detail=f"Unsupported category: {category}")
    _validate_timezone(tz)
    try:
        windows: list[dict[str, str]] = []
        current_date = date_value
        for _ in range(366):
            panchang = compute_daily_panchang(
                date_iso=current_date.isoformat(),
                latitude=lat,
                longitude=lng,
                timezone_name=tz,
                location_name=_location_name(lat, lng),
                calendar_school=calendar,
                lang="en",
            )
            windows.extend({"date": current_date.isoformat(), **_window_with_iso(window, tz, current_date)} for window in compute_category_windows(panchang, category))
            if len(windows) >= 10:
                windows = windows[:10]
                break
            current_date += timedelta(days=1)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return MuhurtaResponseModel(
        date=date_value.isoformat(),
        category=category,
        location={"lat": lat, "lng": lng, "tz": tz, "calendar": calendar},
        windows=[MuhurtaWindowModel.model_validate(window) for window in windows],
        horizon_exhausted=len(windows) < 10,
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
    if lang not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")
    return FestivalsResponseModel(
        year=year,
        calendar=calendar,
        lang=lang,
        festivals=compute_festivals_for_year(year, calendar=calendar, lang=lang),
    )


# The production web server may serve the PWA itself. This optional mount lets
# a private Tailscale preview expose one HTTPS origin for both UI and API.
if _frontend_dist and _frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(_frontend_dist), html=True), name="panchang-web")
