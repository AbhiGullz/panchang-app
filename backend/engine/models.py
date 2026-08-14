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


class NakshatraModel(BaseModel):
    index: int
    name: LocalizedNameModel
    pada: int


class YogaModel(BaseModel):
    index: int
    name: LocalizedNameModel


class KaranaModel(BaseModel):
    index: int | None = None
    name: LocalizedNameModel


class TimeWindowModel(BaseModel):
    start: str
    end: str


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
