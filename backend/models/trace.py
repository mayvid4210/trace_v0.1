from typing import Any, Literal

from pydantic import BaseModel, Field


class SessionContext(BaseModel):
    driver: str
    team: str
    circuit: str
    session: str
    compound: str
    stint: str
    source: Literal["DEMO", "UPLOADED"]


class LapRecord(BaseModel):
    lap: int
    lap_time: float
    driver: str
    team: str
    compound: str
    stint: str
    tyre_age: int
    traffic: str | None = None
    flag: str | None = None
    status: str
    reason: str
    included_in_model: bool
    sector_1: float | None = None
    sector_2: float | None = None
    sector_3: float | None = None
    track_temperature: float | None = None
    air_temperature: float | None = None
    fuel_load: float | None = None
    tyre_temperature: float | None = None


class SignalPoint(BaseModel):
    lap: int
    tyre_age: int
    raw: float
    corrected: float | None = None
    predicted: float | None = None
    compound: str
    stint: str
    traffic: str | None = None
    classification: str
    available_telemetry: list[str] = Field(default_factory=list)


class CurrentTyreState(BaseModel):
    tyre_age: int | None = None
    current_pace: float | None = None
    degradation_rate: float | None = None
    predicted_cliff: int | None = None
    model_confidence: int | None = None
    phase: str = "PHASE UNCERTAIN"
    phase_note: str


class InsightFactor(BaseModel):
    name: str
    detail: str
    provenance: Literal["MEASURED", "DERIVED", "MODEL PREDICTION", "UNAVAILABLE", "DEMO"]


class DataQualityReport(BaseModel):
    score: int
    total_laps: int
    valid_laps: int
    invalid_laps: int
    missing_values: int
    duplicate_laps: int
    outliers: int
    stints_detected: int
    issues: list[str] = Field(default_factory=list)


class FeatureAvailability(BaseModel):
    field: str
    available: bool
    label: str


class DegradationResult(BaseModel):
    rate: float | None = None
    state: str
    interpretation: str
    provenance: Literal["MEASURED", "DERIVED", "MODEL PREDICTION", "UNAVAILABLE", "DEMO"]


class CliffDistribution(BaseModel):
    lap: int
    probability: int


class CliffPrediction(BaseModel):
    current_lap: int | None = None
    predicted_onset: int | None = None
    estimated_remaining: int | None = None
    confidence: int | None = None
    note: str
    distribution: list[CliffDistribution] = Field(default_factory=list)


class DecompositionItem(BaseModel):
    name: str
    value: float | None = None
    unit: str
    status: Literal["AVAILABLE", "UNAVAILABLE"]
    detail: str
    provenance: Literal["MEASURED", "DERIVED", "MODEL PREDICTION", "UNAVAILABLE", "DEMO"]


class CompoundComparison(BaseModel):
    compound: str
    peak_pace: float | None = None
    degradation_rate: float | None = None
    useful_stint: str
    cliff_onset: str
    provenance: Literal["DEMO", "DERIVED", "UNAVAILABLE"]


class TyreState(BaseModel):
    position: str
    temperature: float | None = None
    state: str
    risk: str
    provenance: Literal["MEASURED", "DERIVED", "MODEL PREDICTION", "UNAVAILABLE", "DEMO"]


class StrategyOption(BaseModel):
    name: str
    sequence: str
    pit_laps: str
    projected_time: float
    degradation: str
    status: str
    rationale: str


class ValidationResult(BaseModel):
    predicted_degradation: float
    actual_degradation: float
    error: float
    predicted_cliff: int
    actual_cliff: int
    cliff_error: int
    predicted_stint_life: int
    actual_stint_life: int
    mae: float
    rmse: float
    note: str


class ErrorSource(BaseModel):
    name: str
    detail: str
    laps: list[int]
    provenance: Literal["MEASURED", "DERIVED", "MODEL PREDICTION", "DEMO"]


class TraceSession(BaseModel):
    id: str
    context: SessionContext
    laps: list[LapRecord]
    signal: list[SignalPoint]
    current_tyre: CurrentTyreState
    primary_insight: str
    insight_factors: list[InsightFactor]
    data_quality: DataQualityReport
    availability: list[FeatureAvailability]
    degradation: DegradationResult
    cliff: CliffPrediction
    decomposition: list[DecompositionItem]
    compounds: list[CompoundComparison]
    tyre_states: list[TyreState]
    strategy_options: list[StrategyOption]
    validation: ValidationResult
    error_sources: list[ErrorSource]
    limitations: list[str]
    mode: Literal["REPLAY"] = "REPLAY"


class UploadSessionRequest(BaseModel):
    file_name: str
    rows: list[dict[str, Any]]


class StrategyRequest(BaseModel):
    pit_lap: int = Field(ge=1, le=60)
    next_compound: str


class StrategyResponse(BaseModel):
    pit_lap: int
    projected_time: float
    pit_loss: float
    degradation: float
    remaining_stint: int
    recommendation: str
    rationale: list[str]


class EngineerRequest(BaseModel):
    question: str


class EngineerResponse(BaseModel):
    question: str
    answer: str
    evidence: list[str]
    confidence: int
    provenance: Literal["DEMO", "DERIVED", "MODEL PREDICTION"]


class ReportResponse(BaseModel):
    title: str
    generated_at: str
    summary: str
    sections: list[dict[str, Any]]