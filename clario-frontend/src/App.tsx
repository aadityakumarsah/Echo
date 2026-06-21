import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { useAccess } from "@/hooks/useAccess";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Journal from "./pages/Journal.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import Plan from "./components/Plan.tsx";
import Breathe from "./pages/Breathe.tsx";
import BreatheSession from "./pages/BreatheSession.tsx";
import Meditation from "./pages/Meditation.tsx";
import DailyCheck from "./pages/DailyCheck.tsx";
import DailyCheckMorning from "./pages/DailyCheckMorning.tsx";
import DailyCheckRefill from "./pages/DailyCheckRefill.tsx";
import DailyCheckNight from "./pages/DailyCheckNight.tsx";
import Relief from "./pages/Relief.tsx";
import ReliefDrawing from "./pages/ReliefDrawing.tsx";
import ReliefBlocks from "./pages/ReliefBlocks.tsx";
import Paywall from "./pages/Paywall.tsx";
import PaywallSuccess from "./pages/PaywallSuccess.tsx";
import TrialBanner from "./components/TrialBanner.tsx";

const queryClient = new QueryClient();

// Routes that are always accessible — don't redirect these to paywall
const UNGUARDED_PATHS = ["/paywall", "/paywall/success"];

function AppRoutes() {
  const location = useLocation();
  const { hasAccess, trialDaysLeft, loading } = useAccess();

  const isUnguarded = UNGUARDED_PATHS.some((p) => location.pathname.startsWith(p));

  // While loading, render nothing (avoids flash of paywall)
  if (loading && !isUnguarded) return null;

  // If access check is done, user is on a guarded route, and has no access → redirect
  if (!loading && !hasAccess && !isUnguarded) {
    return <Navigate to="/paywall" replace />;
  }

  const showBanner =
    !loading && hasAccess && trialDaysLeft <= 2 && trialDaysLeft > 0 && !isUnguarded;

  return (
    <>
      {showBanner && <TrialBanner daysLeft={trialDaysLeft} />}
      <Routes>
        <Route path="/" element={<DailyCheck />} />
        <Route path="/index" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/breathe" element={<Breathe />} />
        <Route path="/breathe/:emotion" element={<BreatheSession />} />
        <Route path="/meditation" element={<Meditation />} />
        <Route path="/daily-check" element={<DailyCheck />} />
        <Route path="/daily-check/morning" element={<DailyCheckMorning />} />
        <Route path="/daily-check/refill" element={<DailyCheckRefill />} />
        <Route path="/daily-check/night" element={<DailyCheckNight />} />
        <Route path="/relief" element={<Relief />} />
        <Route path="/relief/drawing" element={<ReliefDrawing />} />
        <Route path="/relief/blocks" element={<ReliefBlocks />} />
        <Route path="/paywall" element={<Paywall />} />
        <Route path="/paywall/success" element={<PaywallSuccess />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
