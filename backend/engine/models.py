from typing import Any

from pydantic import BaseModel


class LocationModel(BaseModel):
    name: str
    lat: float
    lng: float
    tz: str


class SunModel(BaseModel):
    rise: str
    set: str
    rise_at: str | None = None
    set_at: str | None = None
    moonrise_at: str | None = None
    moonset_at: str | None = None


class LocalizedNameModel(BaseModel):
    en: str
    hi: str
    pa: str
    ta: str
    te: str
    kn: str
    ml: str
    mr: str
    gu: str
    bn: str


class TithiModel(BaseModel):
    index: int
    name: LocalizedNameModel
    ends_at: str | None = None
    start: str | None = None
    end: str | None = None
    next: dict[str, Any] | None = None


class NakshatraModel(BaseModel):
    index: int
    name: LocalizedNameModel
    pada: int
    start: str | None = None
    end: str | None = None
    next: dict[str, Any] | None = None


class YogaModel(BaseModel):
    index: int
    name: LocalizedNameModel
    start: str | None = None
    end: str | None = None
    next: dict[str, Any] | None = None


class KaranaModel(BaseModel):
    index: int | None = None
    name: LocalizedNameModel
    start: str | None = None
    end: str | None = None
    next: dict[str, Any] | None = None
    transitions: list[dict[str, Any]] = []


class TimeWindowModel(BaseModel):
    start: str
    end: str
    start_at: str | None = None
    end_at: str | None = None


class MuhurtaWindowModel(TimeWindowModel):
    date: str
    label: str | None = None
    reference: str | None = None
    notes: str | None = None


class MuhurtaModel(BaseModel):
    abhijit: TimeWindowModel
    yamagandam: TimeWindowModel
    gulika: TimeWindowModel
    amrit_kala: TimeWindowModel
    disha_shool: str


class PanchangResponseModel(BaseModel):
    date: str
    location: LocationModel
    sun: SunModel
    tithi: TithiModel
    nakshatra: NakshatraModel
    yoga: YogaModel
    karana: KaranaModel
    moon_sign: LocalizedNameModel
    month_name: LocalizedNameModel
    era_year: int
    paksha: str | None
    rahu_kaal: TimeWindowModel
    muhurta: MuhurtaModel
    names_version: str
    lang_names: dict[str, Any] | None = None
    source: str = "swiss-ephemeris"
    phase: dict[str, Any] | None = None
    timing_metadata: dict[str, Any] | None = None
