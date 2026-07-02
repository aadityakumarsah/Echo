import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TrialBannerProps {
  daysLeft: number;
  timeLabel?: string;
}

export default function TrialBanner({ daysLeft, timeLabel }: TrialBannerProps) {
  const navigate = useNavigate();

  const label = timeLabel ?? (daysLeft === 1 ? "1 day" : `${daysLeft} days`);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm"
      style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border))" }}
    >
      <span style={{ color: "hsl(var(--primary))" }}>
        {label} left in your free trial
      </span>
      <button
        onClick={() => navigate("/paywall")}
        className="font-semibold px-3 py-0.5 rounded-full text-xs transition-colors duration-150"
        style={{ background: "hsl(var(--primary))", color: "#fff" }}
      >
        Upgrade
      </button>
    </motion.div>
  );
}
