from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException

from lib.db import db
from models.trace import (
    CliffDistribution,
    CliffPrediction,
    CompoundComparison,
    CurrentTyreState,
    DataQualityReport,
    DecompositionItem,
    DegradationResult,
    EngineerRequest,
    EngineerResponse,
    ErrorSource,
    FeatureAvailability,
    InsightFactor,
    LapRecord,
    ReportResponse,
    SessionContext,
    SignalPoint,
    StrategyOption,
    StrategyRequest,
    StrategyResponse,
    TraceSession,
    TyreState,
    UploadSessionRequest,
    ValidationResult,
)

router = APIRouter(prefix="/trace", tags=["trace"])


def _demo_laps() -> list[LapRecord]:
    raw_times = [92.88, 92.31, 91.94, 91.72, 91.61, 91.57, 91.62, 91.68, 91.74, 91.82, 91.78, 91.89, 92.01, 92.12, 92.19, 92.28, 92.36, 92.47, 92.61, 92.78, 92.96, 93.14, 93.31, 93.55]
    laps: list[LapRecord] = []
    for lap, lap_time in enumerate(raw_times, start=1):
        status = "CLEAN"
        reason = "Representative lap; included in degradation fitting."
        traffic = "Clear"
        flag = "None"
        included = True
        if lap == 1:
            status, reason, included = "OUT LAP", "Out lap; tyre not yet in representative operating state.", False
        elif lap in (7, 13):
            status, reason, traffic, included = "CONTAMINATED", "Traffic detected; lap excluded from degradation fitting.", "High", False
        elif lap == 16:
            status, reason, flag, included = "YELLOW FLAG", "Yellow flag sector detected; lap excluded from fit.", "Yellow", False
        elif lap == 20:
            status, reason, flag, included = "SAFETY CAR", "Safety Car pace; lap excluded from fit.", "SC", False
        elif lap == 24:
            status, reason, included = "ABNORMAL", "Late-stint anomaly; retained for audit, excluded from fit.", False
        laps.append(
            LapRecord(
                lap=lap,
                lap_time=lap_time,
                driver="L. Voss",
                team="Apex GP",
                compound="Medium",
                stint="Stint 2",
                tyre_age=lap,
                traffic=traffic,
                flag=flag,
                status=status,
                reason=reason,
                included_in_model=included,
                sector_1=30.12 + lap * 0.015 if lap not in (16, 20) else None,
                sector_2=32.01 + lap * 0.028 if lap not in (16, 20) else None,
                sector_3=29.44 + lap * 0.018 if lap not in (16, 20) else None,
                track_temperature=41.0 + lap * 0.08,
                air_temperature=26.5,
            )
        )
    return laps


def _demo_session() -> TraceSession:
    laps = _demo_laps()
    raw = [lap.lap_time for lap in laps]
    corrected = [92.68, 92.18, 91.88, 91.72, 91.65, 91.63, 91.66, 91.71, 91.77, 91.84, 91.91, 91.98, 92.05, 92.12, 92.20, 92.28, 92.37, 92.46, 92.55, 92.64, 92.74, 92.84, 92.94, 93.04]
    predicted = [None, None, None, 91.70, 91.64, 91.62, 91.66, 91.72, 91.79, 91.87, 91.96, 92.06, 92.16, 92.27, 92.38, 92.50, 92.63, 92.77, 92.91, 93.06, 93.22, 93.39, 93.57, 93.76]
    signal = [
        SignalPoint(lap=lap.lap, tyre_age=lap.tyre_age, raw=raw[lap.lap - 1], corrected=corrected[lap.lap - 1], predicted=predicted[lap.lap - 1], compound=lap.compound, stint=lap.stint, traffic=lap.traffic, classification=lap.status, available_telemetry=["sector times", "track temperature", "air temperature"] if lap.lap not in (16, 20) else ["track temperature"])
        for lap in laps
    ]
    return TraceSession(
        id="demo-bahrain-fp2",
        context=SessionContext(driver="L. Voss", team="Apex GP", circuit="Bahrain International Circuit", session="FP2 · Replay", compound="Medium", stint="Stint 2 · 24 laps", source="DEMO"),
        laps=laps,
        signal=signal,
        current_tyre=CurrentTyreState(tyre_age=18, current_pace=91.82, degradation_rate=0.071, predicted_cliff=29, model_confidence=82, phase="DEGRADATION", phase_note="The fitted signal is accelerating after the peak window; onset remains a model prediction."),
        primary_insight="Tyre degradation is accelerating.",
        insight_factors=[InsightFactor(name="Tyre age", detail="18 laps into the current Medium stint.", provenance="MEASURED"), InsightFactor(name="Track evolution", detail="Baseline pace is improving as the session progresses.", provenance="DERIVED"), InsightFactor(name="Traffic exposure", detail="2 high-traffic laps were excluded from the fit.", provenance="MEASURED"), InsightFactor(name="Tyre temperature", detail="Tyre surface temperature unavailable.", provenance="UNAVAILABLE")],
        data_quality=DataQualityReport(score=91, total_laps=24, valid_laps=17, invalid_laps=7, missing_values=3, duplicate_laps=0, outliers=1, stints_detected=2, issues=["7 laps excluded from degradation fit", "3 unavailable telemetry values", "1 late-stint anomaly"]),
        availability=[FeatureAvailability(field="lap", available=True, label="Lap"), FeatureAvailability(field="lap_time", available=True, label="Lap Time"), FeatureAvailability(field="driver", available=True, label="Driver"), FeatureAvailability(field="team", available=True, label="Team"), FeatureAvailability(field="compound", available=True, label="Compound"), FeatureAvailability(field="stint", available=True, label="Stint"), FeatureAvailability(field="tyre_age", available=True, label="Tyre Age"), FeatureAvailability(field="sector_times", available=True, label="Sector Times"), FeatureAvailability(field="track_temperature", available=True, label="Track Temperature"), FeatureAvailability(field="air_temperature", available=True, label="Air Temperature"), FeatureAvailability(field="traffic", available=True, label="Traffic"), FeatureAvailability(field="fuel_load", available=False, label="Fuel Load"), FeatureAvailability(field="tyre_temperature", available=False, label="Tyre Surface Temperature"), FeatureAvailability(field="brake_pressure", available=False, label="Brake Pressure")],
        degradation=DegradationResult(rate=0.071, state="ACCELERATING", interpretation="Observed pace is separating from the normalized baseline as tyre age increases.", provenance="MODEL PREDICTION"),
        cliff=CliffPrediction(current_lap=24, predicted_onset=29, estimated_remaining=5, confidence=82, note="Predicted onset of accelerated degradation — not a literal tyre failure.", distribution=[CliffDistribution(lap=27, probability=12), CliffDistribution(lap=28, probability=19), CliffDistribution(lap=29, probability=34), CliffDistribution(lap=30, probability=23), CliffDistribution(lap=31, probability=12)]),
        decomposition=[DecompositionItem(name="Observed pace change", value=0.32, unit="s", status="AVAILABLE", detail="Lap 18 versus the stint's normalized reference.", provenance="MEASURED"), DecompositionItem(name="Tyre age effect", value=0.071, unit="s/lap", status="AVAILABLE", detail="Estimated from clean laps in the Medium stint.", provenance="MODEL PREDICTION"), DecompositionItem(name="Fuel effect", value=None, unit="", status="UNAVAILABLE", detail="Fuel load unavailable; correction not estimated.", provenance="UNAVAILABLE"), DecompositionItem(name="Traffic effect", value=0.08, unit="s", status="AVAILABLE", detail="Traffic-affected laps excluded rather than corrected.", provenance="DERIVED"), DecompositionItem(name="Track evolution effect", value=-0.11, unit="s", status="AVAILABLE", detail="Estimated baseline improvement across the session.", provenance="DERIVED"), DecompositionItem(name="Temperature effect", value=None, unit="", status="UNAVAILABLE", detail="Tyre temperature channel unavailable.", provenance="UNAVAILABLE"), DecompositionItem(name="Driver effect", value=None, unit="", status="UNAVAILABLE", detail="No driver-behaviour telemetry in this dataset.", provenance="UNAVAILABLE"), DecompositionItem(name="Residual / unexplained", value=0.28, unit="s", status="AVAILABLE", detail="Remaining variance not assigned to a supported feature.", provenance="DERIVED")],
        compounds=[CompoundComparison(compound="SOFT", peak_pace=91.12, degradation_rate=0.092, useful_stint="12–16 laps", cliff_onset="Lap 16–19", provenance="DEMO"), CompoundComparison(compound="MEDIUM", peak_pace=91.62, degradation_rate=0.071, useful_stint="20–25 laps", cliff_onset="Lap 27–31", provenance="DEMO"), CompoundComparison(compound="HARD", peak_pace=92.06, degradation_rate=0.041, useful_stint="28+ laps", cliff_onset="Not resolved", provenance="DEMO")],
        tyre_states=[TyreState(position="FL", temperature=None, state="UNAVAILABLE", risk="Tyre temperature unavailable.", provenance="UNAVAILABLE"), TyreState(position="FR", temperature=None, state="UNAVAILABLE", risk="Tyre temperature unavailable.", provenance="UNAVAILABLE"), TyreState(position="RL", temperature=None, state="UNAVAILABLE", risk="Tyre temperature unavailable.", provenance="UNAVAILABLE"), TyreState(position="RR", temperature=None, state="UNAVAILABLE", risk="Tyre temperature unavailable.", provenance="UNAVAILABLE")],
        strategy_options=[StrategyOption(name="STRATEGY A", sequence="Medium → Hard", pit_laps="Pit Lap 22", projected_time=5664.8, degradation="Medium: +0.071 s/lap", status="BASELINE", rationale="Single-stop baseline with a late Medium stint."), StrategyOption(name="STRATEGY B", sequence="Medium → Soft → Hard", pit_laps="Pit Laps 16 / 37", projected_time=5658.9, degradation="Soft: +0.092 s/lap", status="TRACE RECOMMENDS", rationale="Projected race-time objective is lower under the available model assumptions."), StrategyOption(name="STRATEGY C", sequence="No Stop", pit_laps="No pit", projected_time=5681.4, degradation="Medium: accelerating", status="TOO LATE", rationale="The current Medium crosses the predicted accelerated-degradation window." )],
        validation=ValidationResult(predicted_degradation=0.064, actual_degradation=0.071, error=0.007, predicted_cliff=29, actual_cliff=30, cliff_error=1, predicted_stint_life=27, actual_stint_life=28, mae=0.084, rmse=0.108, note="TRACE captured the direction of degradation but underestimated the late-stint temperature response."),
        error_sources=[ErrorSource(name="Unexpected temperature rise", detail="Rear axle response was steeper than the practice fit implied.", laps=[28, 29, 30], provenance="DERIVED"), ErrorSource(name="Traffic exposure", detail="Race stint contained longer traffic segments than practice.", laps=[23, 24], provenance="MEASURED"), ErrorSource(name="Track evolution underestimated", detail="The race baseline improved slightly faster than the practice estimate.", laps=[4, 5, 6], provenance="DERIVED")],
        limitations=["Fuel load unavailable; fuel correction not estimated.", "Tyre surface temperature unavailable.", "Brake, throttle, steering and slip channels unavailable.", "All prediction outputs are deterministic DEMO or MODEL PREDICTION values."],
    )


async def _persist(session: TraceSession) -> TraceSession:
    await db.trace_sessions.replace_one({"id": session.id}, session.model_dump(), upsert=True)
    return session


@router.get("/demo", response_model=TraceSession)
async def get_demo_session() -> TraceSession:
    return await _persist(_demo_session())


@router.get("/sessions/{session_id}", response_model=TraceSession)
async def get_session(session_id: str) -> TraceSession:
    if session_id == "demo-bahrain-fp2":
        return await _persist(_demo_session())
    record = await db.trace_sessions.find_one({"id": session_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="session not found")
    return TraceSession(**record)


def _parse_upload(request: UploadSessionRequest) -> TraceSession:
    valid_rows = [row for row in request.rows if row.get("lap_time") not in (None, "")]
    if not valid_rows:
        raise HTTPException(status_code=422, detail="No rows with lap_time were found")
    laps: list[LapRecord] = []
    for index, row in enumerate(valid_rows[:100], start=1):
        try:
            lap = int(row.get("lap", index))
            lap_time = float(row["lap_time"])
        except (ValueError, TypeError, KeyError) as exc:
            raise HTTPException(status_code=422, detail=f"Invalid lap row {index}: {exc}") from exc
        compound = str(row.get("compound", "Unavailable")).upper()
        status = "CLEAN" if str(row.get("traffic", "Clear")).lower() in ("", "clear", "none") else "CONTAMINATED"
        laps.append(LapRecord(lap=lap, lap_time=lap_time, driver=str(row.get("driver", "Uploaded driver")), team=str(row.get("team", "Uploaded team")), compound=compound, stint=str(row.get("stint", "Uploaded stint")), tyre_age=int(row.get("tyre_age", index)), traffic=str(row.get("traffic", "Clear")), flag=str(row.get("flag", "None")), status=status, reason="Uploaded row classified from available fields.", included_in_model=status == "CLEAN", track_temperature=float(row["track_temperature"]) if row.get("track_temperature") not in (None, "") else None, air_temperature=float(row["air_temperature"]) if row.get("air_temperature") not in (None, "") else None, fuel_load=float(row["fuel_load"]) if row.get("fuel_load") not in (None, "") else None, tyre_temperature=float(row["tyre_temperature"]) if row.get("tyre_temperature") not in (None, "") else None))
    available_keys = set(valid_rows[0].keys())
    signal = [SignalPoint(lap=lap.lap, tyre_age=lap.tyre_age, raw=lap.lap_time, compound=lap.compound, stint=lap.stint, traffic=lap.traffic, classification=lap.status, available_telemetry=[key for key in ("sector_1", "sector_2", "sector_3", "track_temperature", "air_temperature", "fuel_load", "tyre_temperature") if key in available_keys]) for lap in laps]
    fields = ["lap", "lap_time", "driver", "team", "compound", "stint", "tyre_age", "sector_times", "track_temperature", "air_temperature", "traffic", "fuel_load", "tyre_temperature", "brake_pressure"]
    availability = [FeatureAvailability(field=field, available=field in available_keys or (field == "sector_times" and any(key.startswith("sector_") for key in available_keys)), label=field.replace("_", " ").title()) for field in fields]
    included = sum(1 for lap in laps if lap.included_in_model)
    quality = int((included / len(laps)) * 100)
    first = laps[0]
    return TraceSession(id=f"upload-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}", context=SessionContext(driver=first.driver, team=first.team, circuit=str(valid_rows[0].get("circuit", "Uploaded circuit")), session=str(valid_rows[0].get("session", "Uploaded session")), compound=first.compound, stint=first.stint, source="UPLOADED"), laps=laps, signal=signal, current_tyre=CurrentTyreState(tyre_age=first.tyre_age, current_pace=first.lap_time, phase="PHASE UNCERTAIN", phase_note="Insufficient uploaded context for a defensible phase estimate."), primary_insight="TRACE has classified the uploaded rows; degradation fitting is awaiting more clean context.", insight_factors=[InsightFactor(name="Uploaded rows", detail=f"{len(laps)} laps parsed from {request.file_name}.", provenance="MEASURED"), InsightFactor(name="Fuel effect", detail="Fuel correction only available when fuel_load is present.", provenance="UNAVAILABLE" if "fuel_load" not in available_keys else "MEASURED")], data_quality=DataQualityReport(score=quality, total_laps=len(laps), valid_laps=included, invalid_laps=len(laps) - included, missing_values=sum(1 for lap in laps for value in (lap.track_temperature, lap.air_temperature, lap.fuel_load, lap.tyre_temperature) if value is None), duplicate_laps=0, outliers=0, stints_detected=len({lap.stint for lap in laps}), issues=["Model predictions unavailable for uploaded session until sufficient clean laps are present."]), availability=availability, degradation=DegradationResult(state="UNCERTAIN", interpretation="No degradation rate is reported from this upload yet.", provenance="UNAVAILABLE"), cliff=CliffPrediction(note="Predicted onset unavailable for this upload."), decomposition=[DecompositionItem(name="Fuel effect", unit="", status="UNAVAILABLE" if "fuel_load" not in available_keys else "AVAILABLE", detail="Correction follows the uploaded field availability.", provenance="UNAVAILABLE" if "fuel_load" not in available_keys else "MEASURED")], compounds=[], tyre_states=[TyreState(position=position, state="UNAVAILABLE", risk="Tyre temperature unavailable.", provenance="UNAVAILABLE") for position in ("FL", "FR", "RL", "RR")], strategy_options=[], validation=ValidationResult(predicted_degradation=0, actual_degradation=0, error=0, predicted_cliff=0, actual_cliff=0, cliff_error=0, predicted_stint_life=0, actual_stint_life=0, mae=0, rmse=0, note="Validation unavailable for uploaded session."), error_sources=[], limitations=["Uploaded data is not silently completed with fabricated telemetry.", "Model predictions require sufficient clean laps and supported variables."], mode="REPLAY")


@router.post("/sessions", response_model=TraceSession)
async def upload_session(request: UploadSessionRequest) -> TraceSession:
    return await _persist(_parse_upload(request))


@router.post("/strategy", response_model=StrategyResponse)
async def simulate_strategy(request: StrategyRequest) -> StrategyResponse:
    pit_loss = 19.8
    degradation = 0.071 + max(0, request.pit_lap - 22) * 0.004
    projected_time = 5652.6 + pit_loss + degradation * max(0, request.pit_lap - 5)
    return StrategyResponse(pit_lap=request.pit_lap, projected_time=round(projected_time, 1), pit_loss=pit_loss, degradation=round(degradation, 3), remaining_stint=max(0, 45 - request.pit_lap), recommendation="PIT WINDOW" if 21 <= request.pit_lap <= 24 else ("TOO EARLY" if request.pit_lap < 21 else "TOO LATE"), rationale=[f"{request.next_compound} is evaluated against the Medium baseline.", "The objective is projected race time, not an arbitrary score.", "Fuel load is unavailable and is not used in this simulation."])


@router.post("/engineer", response_model=EngineerResponse)
async def ask_engineer(request: EngineerRequest) -> EngineerResponse:
    question = request.question.lower()
    if "exclude" in question or "lap 17" in question:
        answer = "Lap 17 is retained as a clean audit row in the demo flow, while the nearby contaminated and flagged laps are excluded. TRACE does not silently delete abnormal observations."
        evidence = ["Traffic-affected laps 7 and 13 excluded", "Yellow flag lap 16 excluded", "Safety Car lap 20 excluded"]
    elif "pit" in question or "window" in question:
        answer = "The current model places the useful pit window at laps 21–24. It is tied to the predicted onset of accelerated degradation around lap 29, with pit loss and projected race time included in the comparison."
        evidence = ["Predicted cliff onset: lap 29", "Projected recommendation: Medium → Soft → Hard", "Fuel load unavailable; not used"]
    elif "accurate" in question or "validation" in question:
        answer = "TRACE captured the direction of degradation but underestimated the late-stint temperature response. Practice predicted +0.064 s/lap; the race reference was +0.071 s/lap."
        evidence = ["Degradation error: 0.007 s/lap", "Cliff prediction error: 1 lap", "Main error: unexpected temperature rise"]
    else:
        answer = "Observed degradation is +0.071 s/lap. The current model attributes the change primarily to tyre age after accounting for the available track-evolution signal. Several high-traffic laps were excluded from the fit."
        evidence = ["18-lap current tyre age", "Model-predicted degradation: +0.071 s/lap", "2 high-traffic laps excluded"]
    return EngineerResponse(question=request.question, answer=answer, evidence=evidence, confidence=82, provenance="DEMO")


@router.post("/report", response_model=ReportResponse)
async def generate_report() -> ReportResponse:
    return ReportResponse(title="TRACE · Bahrain FP2 analysis", generated_at=datetime.now(timezone.utc).isoformat(), summary="TRACE separated observed pace from a model-normalized signal and identified a predicted accelerated-degradation window around lap 29.", sections=[{"title": "Data provenance", "value": "DEMO DATA · REPLAY MODE · deterministic model outputs"}, {"title": "Limitations", "value": "Fuel load, tyre surface temperature and brake telemetry unavailable."}, {"title": "Strategy", "value": "Medium → Soft → Hard · pit laps 16 / 37"}])