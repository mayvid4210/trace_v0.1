import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";

export type Provenance = "MEASURED" | "DERIVED" | "MODEL PREDICTION" | "UNAVAILABLE" | "DEMO";

export interface SessionContext { driver: string; team: string; circuit: string; session: string; compound: string; stint: string; source: "DEMO" | "UPLOADED" }
export interface LapRecord { lap: number; lap_time: number; driver: string; team: string; compound: string; stint: string; tyre_age: number; traffic?: string | null; flag?: string | null; status: string; reason: string; included_in_model: boolean; sector_1?: number | null; sector_2?: number | null; sector_3?: number | null; track_temperature?: number | null; air_temperature?: number | null; fuel_load?: number | null; tyre_temperature?: number | null }
export interface SignalPoint { lap: number; tyre_age: number; raw: number; corrected?: number | null; predicted?: number | null; compound: string; stint: string; traffic?: string | null; classification: string; available_telemetry: string[] }
export interface CurrentTyreState { tyre_age?: number | null; current_pace?: number | null; degradation_rate?: number | null; predicted_cliff?: number | null; model_confidence?: number | null; phase: string; phase_note: string }
export interface InsightFactor { name: string; detail: string; provenance: Provenance }
export interface DataQualityReport { score: number; total_laps: number; valid_laps: number; invalid_laps: number; missing_values: number; duplicate_laps: number; outliers: number; stints_detected: number; issues: string[] }
export interface FeatureAvailability { field: string; available: boolean; label: string }
export interface DegradationResult { rate?: number | null; state: string; interpretation: string; provenance: Provenance }
export interface CliffDistribution { lap: number; probability: number }
export interface CliffPrediction { current_lap?: number | null; predicted_onset?: number | null; estimated_remaining?: number | null; confidence?: number | null; note: string; distribution: CliffDistribution[] }
export interface DecompositionItem { name: string; value?: number | null; unit: string; status: "AVAILABLE" | "UNAVAILABLE"; detail: string; provenance: Provenance }
export interface CompoundComparison { compound: string; peak_pace?: number | null; degradation_rate?: number | null; useful_stint: string; cliff_onset: string; provenance: "DEMO" | "DERIVED" | "UNAVAILABLE" }
export interface TyreState { position: string; temperature?: number | null; state: string; risk: string; provenance: Provenance }
export interface StrategyOption { name: string; sequence: string; pit_laps: string; projected_time: number; degradation: string; status: string; rationale: string }
export interface ValidationResult { predicted_degradation: number; actual_degradation: number; error: number; predicted_cliff: number; actual_cliff: number; cliff_error: number; predicted_stint_life: number; actual_stint_life: number; mae: number; rmse: number; note: string }
export interface ErrorSource { name: string; detail: string; laps: number[]; provenance: "MEASURED" | "DERIVED" | "MODEL PREDICTION" | "DEMO" }
export interface TraceSession { id: string; context: SessionContext; laps: LapRecord[]; signal: SignalPoint[]; current_tyre: CurrentTyreState; primary_insight: string; insight_factors: InsightFactor[]; data_quality: DataQualityReport; availability: FeatureAvailability[]; degradation: DegradationResult; cliff: CliffPrediction; decomposition: DecompositionItem[]; compounds: CompoundComparison[]; tyre_states: TyreState[]; strategy_options: StrategyOption[]; validation: ValidationResult; error_sources: ErrorSource[]; limitations: string[]; mode: "REPLAY" }
export interface StrategyResponse { pit_lap: number; projected_time: number; pit_loss: number; degradation: number; remaining_stint: number; recommendation: string; rationale: string[] }
export interface EngineerResponse { question: string; answer: string; evidence: string[]; confidence: number; provenance: "DEMO" | "DERIVED" | "MODEL PREDICTION" }
export interface ReportResponse { title: string; generated_at: string; summary: string; sections: Array<{ title: string; value: string }> }

export const useTraceSession = () => useQuery({ queryKey: ["trace-session"], queryFn: () => apiGet<TraceSession>("/trace/demo"), retry: 1, staleTime: 60_000 });
export const fetchDemoSession = () => apiGet<TraceSession>("/trace/demo");
export const uploadTraceSession = (file_name: string, rows: Array<Record<string, unknown>>) => apiPost<TraceSession>("/trace/sessions", { file_name, rows });
export const simulateStrategy = (pit_lap: number, next_compound: string) => apiPost<StrategyResponse>("/trace/strategy", { pit_lap, next_compound });
export const askTraceEngineer = (question: string) => apiPost<EngineerResponse>("/trace/engineer", { question });
export const generateTraceReport = () => apiPost<ReportResponse>("/trace/report", {});