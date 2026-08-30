# TRACE

## Tyre Intelligence for Motorsport

> **TRACE isolates the tyre signal hidden inside noisy race telemetry and turns it into actionable race strategy.**

TRACE is an AI-powered motorsport intelligence platform designed to solve one of the hardest problems in race strategy: **separating true tyre degradation from everything else affecting lap time.**

Instead of simply plotting lap time against tyre age, TRACE analyses telemetry, identifies unreliable laps, accounts for measurable confounding factors, predicts degradation behaviour, evaluates pit strategies, and validates predictions against actual race performance.

---
![Uploading Screenshot 2026-08-30 at 1.49.02 AM.png…]()

## The Problem

A slower lap does not necessarily mean the tyre is degrading.

Lap time can change because of:

- Tyre age and degradation
- Fuel load
- Traffic
- Track evolution
- Temperature
- Driver variation
- Other session-specific factors

Traditional approaches can easily mistake these effects for tyre wear.

This produces noisy degradation estimates and makes it difficult to answer the questions that actually matter:

**How much pace are we losing because of the tyre?**

**When will degradation accelerate?**

**When should we pit?**

**Can we trust the prediction?**

---

## Our Solution

TRACE treats tyre degradation as a **signal extraction problem**.

### 1. ISOLATE
Separates the tyre-age signal from measurable external factors affecting lap time.

### 2. FILTER
Classifies laps as clean, compromised, or unusable so unreliable observations do not distort the degradation model.

### 3. EXPLAIN
Breaks down changes in pace into tyre degradation, traffic, track evolution, and other supported factors.

### 4. PREDICT
Forecasts future degradation, useful tyre life, and the onset of accelerated degradation or the **tyre cliff**.

### 5. OPTIMIZE
Simulates tyre compounds and pit timings using projected race pace to identify better strategic decisions.

### 6. VALIDATE
Compares practice predictions with actual race-day behaviour to measure model accuracy and identify prediction errors.

---

## Why TRACE?

Most systems ask:

> **"How fast is the tyre degrading?"**

TRACE asks:

> **"How much of the slowdown is actually the tyre, what caused the rest, what happens next, and can we prove our prediction was right?"**

This makes TRACE more than a tyre degradation predictor.

It is a **closed-loop motorsport intelligence system** connecting telemetry analysis, prediction, strategy simulation, and real-world validation.

---

## Key Features

### Command Center
A unified view of the current tyre state, degradation rate, predicted tyre cliff, model confidence, and key session insights.

### Data Hub
Upload telemetry in CSV or JSON format and inspect available variables and data coverage.

### Lap Classification
Automatically identifies clean and compromised laps before degradation modelling.

### Degradation Analysis
Builds a normalized tyre degradation signal from available telemetry.

### Pace Decomposition
Explains why lap pace changed instead of attributing every slowdown to tyre wear.

### Tyre Intelligence
Compares degradation behaviour across tyre compounds and tyre ages.

### Strategy Simulator
Evaluates different pit laps and tyre combinations using projected race pace.

### Practice → Race Validation
Compares predicted degradation with actual race-day behaviour.

### AI Race Engineer
Provides a natural-language interface for querying the current session analysis and strategy insights.

---

## System Architecture

```text
             RACE TELEMETRY
             CSV / JSON
                  |
                  v
          +----------------+
          |   DATA HUB      |
          | Ingestion       |
          | Data Coverage   |
          +-------+--------+
                  |
                  v
          +----------------+
          | LAP CLASSIFIER  |
          | Clean / Traffic |
          | Flags / Outlap  |
          +-------+--------+
                  |
                  v
          +----------------+
          | DATA PROCESSING |
          | Feature Analysis|
          | Normalization   |
          +-------+--------+
                  |
                  v
          +----------------+
          |   ML ANALYSIS   |
          | Degradation     |
          | Cliff Prediction|
          +-------+--------+
                  |
                  v
          +----------------+
          | STRATEGY ENGINE |
          | Pit Windows     |
          | Tyre Choices    |
          | Race Pace       |
          +-------+--------+
                  |
                  v
          +----------------+
          | TRACE DASHBOARD |
          | Insights        |
          | Visualizations  |
          +-------+--------+
                  |
                  v
          +----------------+
          |    VALIDATION   |
          | Practice vs Race|
          | Error Analysis  |
          +----------------+
