import { Activity, ArrowUpRight, Database, Gauge, GitCompare, Radio, Settings2, Target, Upload, Wrench } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navGroups = [
  { label: "COMMAND CENTER", items: [{ label: "Command Center", to: "/", icon: Gauge }] },
  { label: "DATA HUB", items: [{ label: "Upload", to: "/data-hub", icon: Upload }, { label: "Data Quality", to: "/data-hub#quality", icon: Database }, { label: "Lap Classification", to: "/classification", icon: Activity }] },
  { label: "TRACE LAB", items: [{ label: "Degradation", to: "/trace-lab", icon: Radio }, { label: "Pace Decomposition", to: "/trace-lab#decomposition", icon: GitCompare }, { label: "Tyre State", to: "/trace-lab#tyre-state", icon: Target }] },
  { label: "STRATEGY", items: [{ label: "Strategy Simulator", to: "/strategy", icon: Gauge }, { label: "Pit Window", to: "/strategy#pit-window", icon: ArrowUpRight }] },
  { label: "VALIDATION", items: [{ label: "Practice → Race", to: "/validation", icon: GitCompare }, { label: "Prediction Error", to: "/validation#error", icon: Wrench }] },
];

export default function TraceShell() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#f1f5f9] selection:bg-red-600/40">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[#222] bg-[#030303] lg:flex lg:flex-col" data-testid="trace-sidebar">
        <div className="border-b border-[#222] px-5 py-5" data-testid="brand-lockup">
          <div className="flex items-center gap-2"><span className="h-2 w-2 bg-[#dc2626]" /><span className="font-heading text-xl font-semibold tracking-[-0.04em]">TRACE</span></div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.24em] text-[#8b929a]">AI MOTORSPORT INTELLIGENCE</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5" data-testid="primary-navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="px-2 pb-2 font-mono text-[9px] tracking-[0.22em] text-[#555]" data-testid={`nav-group-${group.label.toLowerCase().replaceAll(" ", "-")}`}>{group.label}</div>
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink key={label} to={to} className={({ isActive }) => `group flex items-center gap-3 border-l-2 px-2 py-2 font-mono text-[11px] tracking-[0.05em] transition-colors duration-150 ${isActive ? "border-[#dc2626] bg-[#151515] text-white" : "border-transparent text-[#777] hover:border-[#555] hover:bg-[#101010] hover:text-white"}`} data-testid={`nav-${label.toLowerCase().replaceAll(" ", "-").replaceAll("→", "to")}`}>
                  <Icon size={14} strokeWidth={1.5} /><span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
          <div className="mb-5">
            <div className="px-2 pb-2 font-mono text-[9px] tracking-[0.22em] text-[#555]">AI RACE ENGINEER</div>
            <NavLink to="/engineer" className={({ isActive }) => `group flex items-center gap-3 border-l-2 px-2 py-2 font-mono text-[11px] transition-colors duration-150 ${isActive ? "border-[#38bdf8] bg-[#151515] text-white" : "border-transparent text-[#777] hover:border-[#555] hover:bg-[#101010] hover:text-white"}`} data-testid="nav-ai-race-engineer">
              <Wrench size={14} strokeWidth={1.5} /><span>Race Engineer</span>
            </NavLink>
          </div>
        </nav>
        <div className="border-t border-[#222] p-3"><div className="flex items-center gap-2 px-2 py-2 font-mono text-[10px] text-[#666]" data-testid="settings-link"><Settings2 size={14} /> SETTINGS <span className="ml-auto text-[#333]">v0.1</span></div></div>
      </aside>
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#222] bg-[#050505]/95 px-4 backdrop-blur-sm lg:px-7" data-testid="top-command-bar">
          <div className="flex items-center gap-3 lg:hidden"><span className="h-2 w-2 bg-[#dc2626]" /><span className="font-heading font-semibold">TRACE</span></div>
          <div className="hidden items-center gap-3 lg:flex"><span className="font-mono text-[10px] tracking-[0.18em] text-[#666]">TRACE /</span><span className="font-mono text-[10px] tracking-[0.18em] text-[#c4c8cc]">ANALYSIS WORKSTATION</span></div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-[#666]"><span className="hidden sm:inline">SESSION: <b className="text-[#10b981]">REPLAY</b></span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 bg-[#10b981]" /> SYSTEM READY</span></div>
        </header>
        <div className="mx-auto max-w-[1600px] p-4 lg:p-7"><Outlet /></div>
      </main>
    </div>
  );
}