import { useState } from "react";
import type { ReactNode } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { Button } from "@/components/ui/button";
import type { DecompositionItem, SignalPoint, TraceSession, Provenance } from "@/services/traceService";

export function ProvenanceBadge({ value }: { value: Provenance | string }) {
  const tone = value === "MODEL PREDICTION" ? "border-[#6d5bc4] text-[#a99cf5]" : value === "DERIVED" ? "border-[#38bdf8] text-[#38bdf8]" : value === "UNAVAILABLE" ? "border-[#6b3030] text-[#c87878]" : value === "DEMO" ? "border-[#8a5f16] text-[#f0b84f]" : "border-[#444] text-[#b4bac1]";
  return <span className={`inline-flex items-center border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] ${tone}`} data-testid={`provenance-${value.toLowerCase().replaceAll(" ", "-")}`}>{value}</span>;
}

export function Panel({ children, className = "", testId, id }: { children: ReactNode; className?: string; testId: string; id?: string }) {
  return <section id={id} className={`border border-[#222] bg-[#0f0f0f] ${className}`} data-testid={testId}>{children}</section>;
}

export function PanelHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail?: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between border-b border-[#222] px-4 py-3"><div><div className="font-mono text-[9px] tracking-[0.22em] text-[#666]" data-testid={`eyebrow-${eyebrow.toLowerCase().replaceAll(" ", "-")}`}>{eyebrow}</div><h2 className="mt-1 font-heading text-sm font-semibold uppercase tracking-[0.06em] text-[#e7e9eb]" data-testid={`heading-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h2>{detail && <p className="mt-1 max-w-2xl text-xs text-[#747b82]" data-testid={`detail-${title.toLowerCase().replaceAll(" ", "-")}`}>{detail}</p>}</div>{action}</div>;
}

export function Metric({ label, value, suffix, provenance = "MEASURED", tone = "default" }: { label: string; value: string | number; suffix?: string; provenance?: Provenance | string; tone?: "default" | "red" | "amber" | "green" }) {
  const color = tone === "red" ? "text-[#ef4444]" : tone === "amber" ? "text-[#f59e0b]" : tone === "green" ? "text-[#10b981]" : "text-[#f1f5f9]";
  return <div className="min-w-0" data-testid={`metric-${label.toLowerCase().replaceAll(" ", "-")}`}><div className="font-mono text-[9px] tracking-[0.17em] text-[#666]">{label}</div><div className={`mt-1 font-mono text-xl tracking-[-0.04em] ${color}`}>{value}{suffix && <span className="ml-1 text-xs text-[#858b91]">{suffix}</span>}</div><div className="mt-1"><ProvenanceBadge value={provenance} /></div></div>;
}

export function PageIntro({ kicker, title, description, action }: { kicker: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-5 border-b border-[#222] pb-6 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-[#dc2626]" data-testid={`page-kicker-${kicker.toLowerCase().replaceAll(" ", "-")}`}><span className="h-px w-6 bg-[#dc2626]" />{kicker}</div><h1 className="font-heading text-3xl font-semibold uppercase tracking-[-0.04em] text-[#f1f5f9] md:text-4xl" data-testid={`page-title-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b929a]" data-testid={`page-description-${title.toLowerCase().replaceAll(" ", "-")}`}>{description}</p></div>{action}</div>;
}

export function SignalChart({ signal }: { signal: SignalPoint[] }) {
  const [mode, setMode] = useState<"RAW" | "CORRECTED" | "PREDICTED" | "ALL">("ALL");
  const show = (name: "RAW" | "CORRECTED" | "PREDICTED") => mode === "ALL" || mode === name;
  return <div className="p-3" data-testid="degradation-signal-chart"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-1 border border-[#292929] p-1" data-testid="signal-mode-tabs">{(["RAW", "CORRECTED", "PREDICTED", "ALL"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] transition-colors duration-150 ${mode === item ? "bg-[#f1f5f9] text-[#050505]" : "text-[#777] hover:bg-[#1a1a1a] hover:text-white"}`} data-testid={`signal-mode-${item.toLowerCase()}`}>{item}</button>)}</div><div className="flex items-center gap-4 font-mono text-[9px] text-[#666]"><span><i className="mr-1 inline-block h-2 w-2 bg-[#555]" /> RAW NOISE</span><span><i className="mr-1 inline-block h-2 w-2 bg-[#38bdf8]" /> TRACE SIGNAL</span><span><i className="mr-1 inline-block h-2 w-2 bg-[#f59e0b]" /> MODEL FORECAST</span></div></div><div className="h-[310px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={signal} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}><CartesianGrid stroke="#222" strokeDasharray="2 4" vertical={false} /><XAxis dataKey="tyre_age" tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#333" }} tickLine={false} label={{ value: "TYRE AGE / LAPS", position: "insideBottom", offset: -2, fill: "#555", fontSize: 9, fontFamily: "JetBrains Mono" }} /><YAxis domain={[91, 94]} tick={{ fill: "#666", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#333" }} tickLine={false} tickFormatter={(value) => `${value.toFixed(1)}s`} width={42} /><Tooltip contentStyle={{ background: "#0f0f0f", border: "1px solid #383838", color: "#f1f5f9", fontFamily: "JetBrains Mono", fontSize: 11 }} labelFormatter={(label) => `LAP AGE ${label}`} /><ReferenceLine x={18} stroke="#dc2626" strokeDasharray="3 3" label={{ value: "CURRENT", fill: "#dc2626", fontSize: 9, fontFamily: "JetBrains Mono" }} /><Line type="linear" dataKey="raw" name="Observed pace" stroke="#666" strokeWidth={1.5} dot={{ r: 2, fill: "#777", strokeWidth: 0 }} activeDot={{ r: 4, fill: "#f1f5f9" }} hide={!show("RAW")} connectNulls /><Line type="linear" dataKey="corrected" name="Model-normalized pace" stroke="#38bdf8" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#38bdf8" }} hide={!show("CORRECTED")} connectNulls /><Line type="linear" dataKey="predicted" name="Predicted trajectory" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={false} hide={!show("PREDICTED")} connectNulls /></LineChart></ResponsiveContainer></div><div className="mt-3 grid grid-cols-3 border-t border-[#222] pt-3 text-[10px] text-[#70777d]"><div><span className="text-[#aaa]">RAW PACE</span><br />Observed lap time</div><div><span className="text-[#38bdf8]">TRACE SIGNAL</span><br />Normalized for available confounders</div><div><span className="text-[#f59e0b]">PREDICTED</span><br />Degradation trajectory</div></div></div>;
}

export function DecompositionList({ items }: { items: DecompositionItem[] }) {
  return <div className="divide-y divide-[#222]" data-testid="pace-decomposition-list">{items.map((item) => <div key={item.name} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3"><div><div className="flex items-center gap-2 text-xs text-[#d8dadd]"><span>{item.name}</span>{item.status === "UNAVAILABLE" && <ProvenanceBadge value="UNAVAILABLE" />}</div><div className="mt-1 text-[11px] text-[#686f76]">{item.detail}</div></div><div className="text-right font-mono text-xs text-[#b7bdc2]">{item.value === null || item.value === undefined ? "—" : `${item.value > 0 ? "+" : ""}${item.value.toFixed(3)} ${item.unit}`}</div></div>)}</div>;
}

export function TraceButton({ children, onClick, testId, variant = "primary", disabled = false }: { children: ReactNode; onClick?: () => void; testId: string; variant?: "primary" | "outline"; disabled?: boolean }) {
  return <Button onClick={onClick} disabled={disabled} className={variant === "primary" ? "rounded-none border border-[#dc2626] bg-[#dc2626] px-4 font-mono text-[10px] tracking-[0.12em] text-white hover:bg-[#ef4444] hover:text-white" : "rounded-none border border-[#383838] bg-transparent px-4 font-mono text-[10px] tracking-[0.12em] text-[#c9cdd1] hover:bg-[#1a1a1a] hover:text-white"} data-testid={testId}>{children}</Button>;
}

export function SessionUnavailable({ error }: { error?: boolean }) {
  return <div className="border border-dashed border-[#333] bg-[#0b0b0b] p-6 font-mono text-xs text-[#777]" data-testid="session-unavailable"><span className="text-[#dc2626]">■</span> {error ? "SESSION API UNAVAILABLE · SHELL REMAINS READY" : "AWAITING TELEMETRY"}</div>;
}

export function SessionContextStrip({ session }: { session: TraceSession }) {
  return <div className="grid grid-cols-2 border border-[#222] bg-[#0f0f0f] sm:grid-cols-4 lg:grid-cols-7" data-testid="session-context-strip">{[["DRIVER", session.context.driver], ["TEAM", session.context.team], ["CIRCUIT", session.context.circuit], ["SESSION", session.context.session], ["COMPOUND", session.context.compound], ["STINT", session.context.stint], ["MODE", session.mode]].map(([label, value]) => <div key={label} className="border-b border-r border-[#222] px-3 py-3 last:border-r-0"><div className="font-mono text-[9px] tracking-[0.18em] text-[#5f666c]">{label}</div><div className="mt-1 truncate font-mono text-xs text-[#d6dade]" data-testid={`context-${label.toLowerCase()}`}>{value}</div></div>)}</div>;
}