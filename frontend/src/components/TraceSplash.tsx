import { useEffect, useState } from "react";

const telemetryLabels = [
  { text: "LAP 18", className: "trace-splash-label trace-splash-label-a" },
  { text: "TYRE AGE", className: "trace-splash-label trace-splash-label-b" },
  { text: "+0.071 S/LAP", className: "trace-splash-label trace-splash-label-c" },
  { text: "TRACK EVOLUTION", className: "trace-splash-label trace-splash-label-d" },
  { text: "TRAFFIC", className: "trace-splash-label trace-splash-label-e" },
  { text: "DEGRADATION", className: "trace-splash-label trace-splash-label-f" },
  { text: "PREDICTED CLIFF", className: "trace-splash-label trace-splash-label-g" },
  { text: "CONFIDENCE 82%", className: "trace-splash-label trace-splash-label-h" },
];

interface TraceSplashProps {
  onComplete: () => void;
}

export default function TraceSplash({ onComplete }: TraceSplashProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fadeTimer = window.setTimeout(() => setIsLeaving(true), reducedMotion ? 650 : 3900);
    const completeTimer = window.setTimeout(onComplete, reducedMotion ? 1050 : 4500);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`trace-splash ${isLeaving ? "trace-splash-leaving" : ""}`}
      data-testid="trace-splash-screen"
      role="status"
      aria-label="TRACE tyre intelligence system starting"
    >
      <div className="trace-splash-grid" aria-hidden="true" />
      <div className="trace-splash-scan" aria-hidden="true" />
      <div className="trace-splash-coordinate trace-splash-coordinate-tl" data-testid="splash-coordinate-top-left">SYS / TRACE_01</div>
      <div className="trace-splash-coordinate trace-splash-coordinate-tr" data-testid="splash-coordinate-top-right">ANALYSIS MODE · REPLAY</div>
      <div className="trace-splash-coordinate trace-splash-coordinate-bl" data-testid="splash-coordinate-bottom-left">X 26.0325 · Y 50.5106</div>
      <div className="trace-splash-coordinate trace-splash-coordinate-br" data-testid="splash-coordinate-bottom-right">SIGNAL ACQUISITION</div>

      <div className="trace-splash-stage" data-testid="splash-signal-stage">
        <div className="trace-splash-sequence" aria-hidden="true">
          <span>RAW TELEMETRY</span><i /><span>LAP DATA</span><i /><span>SIGNAL ANALYSIS</span>
        </div>

        {telemetryLabels.map((label) => (
          <span key={label.text} className={label.className} data-testid={`splash-annotation-${label.text.toLowerCase().replaceAll(" ", "-").replaceAll("+", "plus").replaceAll("/", "-")}`}>
            {label.text}
          </span>
        ))}

        <svg className="trace-splash-signal" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="traceSignalFade" x1="0" x2="1">
              <stop offset="0" stopColor="#747a80" stopOpacity="0" />
              <stop offset="0.16" stopColor="#747a80" stopOpacity="0.42" />
              <stop offset="0.5" stopColor="#f1f5f9" stopOpacity="0.9" />
              <stop offset="0.84" stopColor="#dc2626" stopOpacity="0.56" />
              <stop offset="1" stopColor="#dc2626" stopOpacity="0" />
            </linearGradient>
            <filter id="traceSignalGlow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path className="trace-splash-baseline" d="M0 130 H1200" />
          <path className="trace-splash-raw" pathLength="1" d="M0 130 L55 129 L72 106 L86 153 L103 119 L119 145 L137 92 L151 164 L170 118 L188 139 L209 104 L227 154 L247 121 L266 142 L287 111 L305 149 L326 122 L348 139 L369 117 L390 144 L413 123 L435 137 L459 121 L481 140 L505 124 L530 136 L557 126 L584 134 L612 128 L646 132 L690 129 L735 131 L782 130 L830 130 L880 130 L930 130 L980 130 L1030 130 L1080 130 L1140 130 L1200 130" />
          <path className="trace-splash-clean" pathLength="1" d="M0 130 H410 C445 130 453 96 477 96 C502 96 508 166 534 166 C558 166 568 112 593 112 C618 112 626 139 651 139 C678 139 684 125 711 125 C748 125 756 130 795 130 H1200" />
          <path className="trace-splash-pulse" d="M0 130 H1200" />
        </svg>

        <div className="trace-splash-wordmark" data-testid="splash-wordmark">
          <div className="trace-splash-mark-line" aria-hidden="true" />
          <div className="trace-splash-name">TRACE</div>
          <div className="trace-splash-descriptor">TYRE INTELLIGENCE</div>
          <div className="trace-splash-subtitle">ISOLATING THE SIGNAL BEHIND EVERY LAP</div>
        </div>

        <div className="trace-splash-progress" aria-hidden="true"><span /></div>
        <div className="trace-splash-status" data-testid="splash-boot-status">
          <span>NOISE</span><b>→</b><span>FILTER</span><b>→</b><span>SIGNAL</span><b>→</b><span>INSIGHT</span>
        </div>
      </div>
    </div>
  );
}