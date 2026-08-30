import { useCallback, useState } from "react";
import { Routes, Route } from "react-router-dom";
import TraceSplash from "@/components/TraceSplash";
import TraceShell from "@/components/TraceShell";
import CommandCenter from "@/pages/CommandCenter";
import DataHub from "@/pages/DataHub";
import Classification from "@/pages/Classification";
import TraceLab from "@/pages/TraceLab";
import Strategy from "@/pages/Strategy";
import Validation from "@/pages/Validation";
import Engineer from "@/pages/Engineer";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const completeSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      <Routes>
        <Route element={<TraceShell />}>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/data-hub" element={<DataHub />} />
          <Route path="/classification" element={<Classification />} />
          <Route path="/trace-lab" element={<TraceLab />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/engineer" element={<Engineer />} />
        </Route>
      </Routes>
      {showSplash && <TraceSplash onComplete={completeSplash} />}
    </>
  );
}
