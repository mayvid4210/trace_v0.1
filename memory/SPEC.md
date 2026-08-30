# TRACE living specification

## Product
TRACE is a dark, technical motorsport intelligence workstation. It loads a deterministic Bahrain FP2 demo replay or browser-parsed CSV/JSON and shows the path from raw lap pace to a model-normalized tyre signal, degradation, predicted accelerated-degradation onset, strategy comparison and practice-to-race validation.

## Data model
- `TraceSession` is the primary persisted Mongo document.
- `LapRecord` keeps every lap, its classification, reason and `included_in_model` flag.
- `SignalPoint` separates `raw`, `corrected` (model-normalized) and `predicted` trajectories.
- Analysis outputs declare provenance: MEASURED, DERIVED, MODEL PREDICTION, UNAVAILABLE or DEMO.
- Demo session id: `demo-bahrain-fp2`; source is DEMO and mode is REPLAY.

## Key flows
0. Every fresh browser load presents a four-second CSS/SVG TRACE boot sequence. The existing router remains mounted beneath the overlay, then is revealed without navigation or state reset. Reduced-motion users receive a short static version.
1. Command Center loads `/api/trace/demo` and exposes the raw/corrected/predicted signal modes.
2. Lap Classification makes clean, contaminated, out-lap, yellow-flag, Safety Car and abnormal rows visible with used/excluded state.
3. Data Hub parses CSV/JSON in the browser, posts rows to `/api/trace/sessions`, and persists the resulting session in Mongo.
4. Trace Lab shows pace decomposition, cliff probability, tyre-state availability and compound comparison.
5. Strategy calls `/api/trace/strategy`; Validation shows practice-vs-race error and error sources.
6. Race Engineer calls `/api/trace/engineer` with deterministic evidence-linked answers.

## Auth
No authentication or gated roles in the MVP. The Race Engineer is a deterministic grounded mock service, not a live LLM integration.

## Honesty constraints
Fuel load, tyre surface temperature, brake, throttle, steering and slip telemetry are unavailable in the demo and are not fabricated. Strategy is replay/model output, never live race mode.