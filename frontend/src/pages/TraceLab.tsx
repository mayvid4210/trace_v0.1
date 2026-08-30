import { ArrowRight, CircleHelp, Thermometer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DecompositionList, Metric, PageIntro, Panel, PanelHeader, ProvenanceBadge, SessionUnavailable, SignalChart, TraceButton } from "@/components/trace-ui";
import { useTraceSession } from "@/services/traceService";

export default function TraceLab() {
  const { data: session } = useTraceSession();
  const navigate = useNavigate();
  return (
    <div data-testid="trace-lab-page">
      <PageIntro kicker="TRACE LAB / MODEL WORKSPACE" title="Find the degradation." description="Move from observed pace to a defensible tyre signal. Each output declares whether it is measured, derived, predicted or unavailable." action={<TraceButton testId="trace-lab-strategy-button" onClick={() => navigate("/strategy")}>SIMULATE STRATEGY <ArrowRight size={13} className="ml-2" /></TraceButton>} />
      {session ? (
        <div className="grid grid-cols-12 gap-4">
          <Panel testId="lab-signal-panel" className="col-span-12">
            <PanelHeader eyebrow="DEGRADATION CURVE" title="Observed / normalized / predicted" detail="The curve is not a grip percentage. It is a pace signal with explicit model boundaries." />
            <SignalChart signal={session.signal} />
          </Panel>
          <Panel testId="pace-decomposition-panel" className="col-span-12 lg:col-span-7" id="decomposition">
            <PanelHeader eyebrow="PACE DECOMPOSITION" title="Why did the lap get slower?" detail="Observed change → supported confounders → estimated tyre effect." action={<CircleHelp size={15} className="text-[#555]" />} />
            <DecompositionList items={session.decomposition} />
            <div className="border-t border-[#222] bg-[#0b0b0b] px-4 py-3 font-mono text-[10px] text-[#f59e0b]">LIMITATION <span className="ml-2 text-[#777]">Unavailable variables are intentionally not assigned a number.</span></div>
          </Panel>
          <Panel testId="cliff-predictor-panel" className="col-span-12 lg:col-span-5">
            <PanelHeader eyebrow="THE CLIFF" title="Change in degradation behaviour" detail={session.cliff.note} action={<ProvenanceBadge value="MODEL PREDICTION" />} />
            <div className="grid grid-cols-3 gap-3 p-4"><Metric label="CURRENT LAP" value={session.cliff.current_lap ?? "—"} provenance="MEASURED" /><Metric label="PREDICTED ONSET" value={session.cliff.predicted_onset ?? "—"} provenance="MODEL PREDICTION" tone="amber" /><Metric label="REMAINING" value={session.cliff.estimated_remaining ?? "—"} suffix="laps" provenance="MODEL PREDICTION" /></div>
            <div className="border-t border-[#222] p-4"><div className="mb-3 flex items-center justify-between font-mono text-[10px] text-[#777]"><span>ONSET PROBABILITY</span><span className="text-[#f59e0b]">{session.cliff.confidence ?? "—"}% confidence</span></div>{session.cliff.distribution.map((item) => <div key={item.lap} className="mb-2 grid grid-cols-[42px_1fr_35px] items-center gap-2 font-mono text-[10px]"><span className="text-[#777]">LAP {item.lap}</span><div className="h-2 bg-[#1a1a1a]"><div className="h-full bg-[#f59e0b]" style={{ width: `${item.probability}%` }} /></div><span className="text-right text-[#b8bdc2]">{item.probability}%</span></div>)}</div>
          </Panel>
          <Panel testId="tyre-state-panel" className="col-span-12" id="tyre-state">
            <PanelHeader eyebrow="TYRE STATE" title="Four-tyre view" detail="Temperature and stress channels are shown only when supported by the dataset." />
            <div className="grid grid-cols-2 gap-px bg-[#222] lg:grid-cols-4">{session.tyre_states.map((tyre) => <div key={tyre.position} className="bg-[#0f0f0f] p-4" data-testid={`tyre-state-${tyre.position.toLowerCase()}`}><div className="flex items-center justify-between"><span className="font-mono text-sm text-[#f1f5f9]">{tyre.position}</span><Thermometer size={15} className="text-[#6c7379]" /></div><div className="mt-4 font-mono text-lg text-[#6b7379]">{tyre.temperature ? `${tyre.temperature}°C` : "—"}</div><div className="mt-2 font-mono text-[9px] text-[#9c6060]">{tyre.state}</div><p className="mt-3 text-[11px] leading-5 text-[#70777d]">{tyre.risk}</p><div className="mt-3"><ProvenanceBadge value={tyre.provenance} /></div></div>)}</div>
          </Panel>
          <Panel testId="compound-comparison-panel" className="col-span-12">
            <PanelHeader eyebrow="COMPOUND COMPARISON" title="Relative behaviour in demo data" detail="These are relative demo outputs, not real F1 statistics." action={<ProvenanceBadge value="DEMO" />} />
            <div className="grid gap-px bg-[#222] md:grid-cols-3">{session.compounds.map((compound) => <div key={compound.compound} className="bg-[#0f0f0f] p-4"><div className="flex items-center justify-between font-heading text-sm tracking-[0.08em] text-[#e4e7e9]"><span>{compound.compound}</span><span className="h-2 w-2 bg-[#dc2626]" /></div><div className="mt-4 space-y-3 text-[11px] text-[#777]"><div className="flex justify-between"><span>PEAK PACE</span><span className="font-mono text-[#d7dadd]">{compound.peak_pace?.toFixed(2) ?? "—"} s</span></div><div className="flex justify-between"><span>DEGRADATION</span><span className="font-mono text-[#d7dadd]">{compound.degradation_rate ? `+${compound.degradation_rate.toFixed(3)}` : "—"}</span></div><div className="flex justify-between"><span>USEFUL STINT</span><span className="font-mono text-[#d7dadd]">{compound.useful_stint}</span></div><div className="flex justify-between"><span>CLIFF ONSET</span><span className="font-mono text-[#d7dadd]">{compound.cliff_onset}</span></div></div></div>)}</div>
          </Panel>
        </div>
      ) : <SessionUnavailable />}
    </div>
  );
}