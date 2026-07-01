import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

// ── Step 1 — concerns ────────────────────────────────────────────────────────
const CONCERNS = [
  { id: "anxiety",     emoji: "😰", label: "Stress & anxiety" },
  { id: "sleep",       emoji: "😴", label: "Poor sleep" },
  { id: "mood",        emoji: "😞", label: "Low mood" },
  { id: "overthink",   emoji: "🌀", label: "Overthinking" },
  { id: "burnout",     emoji: "🔥", label: "Burnout" },
  { id: "lonely",      emoji: "💔", label: "Loneliness" },
  { id: "work",        emoji: "💼", label: "Work pressure" },
  { id: "anger",       emoji: "😤", label: "Anger & irritability" },
  { id: "motivation",  emoji: "🥱", label: "Lack of motivation" },
  { id: "relation",    emoji: "🤝", label: "Relationship stress" },
  { id: "self",        emoji: "💭", label: "Low self-worth" },
  { id: "grief",       emoji: "😢", label: "Grief or loss" },
];

// ── Step 2 — goals ───────────────────────────────────────────────────────────
const GOALS = [
  { id: "calm",    emoji: "🌿", label: "Feel calmer every day",       desc: "Build a daily calm practice" },
  { id: "sleep",   emoji: "🌙", label: "Sleep better at night",       desc: "Wind down routines that actually work" },
  { id: "resilience", emoji: "🪨", label: "Build emotional resilience", desc: "Handle hard moments with strength" },
  { id: "process", emoji: "🗣️", label: "Process my feelings",          desc: "Voice journal to understand yourself" },
  { id: "joy",     emoji: "✨", label: "Find joy again",               desc: "Rediscover what makes you feel alive" },
  { id: "focus",   emoji: "🎯", label: "Reduce stress at work",        desc: "Stay grounded during busy days" },
];

const STEP_LABELS = ["What's going on?", "What's your goal?", "You're all set"];

const fadeSlide = (dir: 1 | -1) => ({
  initial:  { opacity: 0, x: dir * 40 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, x: dir * -40, transition: { duration: 0.25 } },
});

export default function Onboard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [goal, setGoal] = useState<string | null>(null);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const toggleConcern = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const finish = () => {
    localStorage.setItem("clario-onboarded", "1");
    localStorage.setItem("clario-concerns", JSON.stringify([...selected]));
    if (goal) localStorage.setItem("clario-goal", goal);
    navigate("/daily-check");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      {/* ── Progress bar ─────────────────────────────────────── */}
      <div className="w-full h-1 shrink-0" style={{ background: "hsl(var(--border))" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "hsl(var(--primary))" }}
          animate={{ width: `${((step + 1) / 3) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium" style={{ color: "hsl(var(--primary))" }}>
            Step {step + 1} of 3
          </span>
          <button
            type="button"
            onClick={finish}
            className="text-xs"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Skip
          </button>
        </div>
        <h2
          className="text-2xl font-semibold"
          style={{ color: "hsl(var(--foreground))", fontFamily: "var(--font-display)" }}
        >
          {STEP_LABELS[step]}
        </h2>
      </div>

      {/* ── Animated step body ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div key="step0" {...fadeSlide(dir)}>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                Choose everything that resonates — there are no wrong answers.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {CONCERNS.map(c => {
                  const on = selected.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleConcern(c.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150"
                      style={{
                        background: on ? "hsl(var(--primary))" : "hsl(var(--card))",
                        border: `1.5px solid ${on ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                        color: on ? "#fff" : "hsl(var(--foreground))",
                        boxShadow: on ? "0 2px 8px rgba(58,46,42,0.12)" : "none",
                      }}
                    >
                      <span>{c.emoji}</span>
                      <span>{c.label}</span>
                      {on && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" {...fadeSlide(dir)}>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                Pick one — you can always adjust later.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOALS.map(g => {
                  const on = goal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id)}
                      className="text-left rounded-2xl px-5 py-4 transition-all duration-150"
                      style={{
                        background: on ? "hsl(var(--primary))" : "hsl(var(--card))",
                        border: `1.5px solid ${on ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                        boxShadow: on ? "0 4px 16px rgba(58,46,42,0.14)" : "none",
                      }}
                    >
                      <span className="text-2xl block mb-2">{g.emoji}</span>
                      <p
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: on ? "#fff" : "hsl(var(--foreground))" }}
                      >
                        {g.label}
                      </p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: on ? "rgba(255,255,255,0.75)" : "hsl(var(--muted-foreground))" }}
                      >
                        {g.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...fadeSlide(dir)} className="flex flex-col items-center text-center pt-8 gap-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-7xl"
              >
                🌱
              </motion.div>
              <div className="space-y-2">
                <h3
                  className="text-2xl font-semibold"
                  style={{ color: "hsl(var(--foreground))", fontFamily: "var(--font-display)" }}
                >
                  Your garden is ready
                </h3>
                <p className="text-sm max-w-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Clario will guide you with personalized rituals based on what you've shared.
                  Small steps, every day.
                </p>
              </div>

              {selected.size > 0 && (
                <div
                  className="rounded-2xl px-5 py-4 text-left w-full max-w-xs"
                  style={{ background: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))" }}
                >
                  <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Working on:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...selected].map(id => {
                      const c = CONCERNS.find(x => x.id === id)!;
                      return (
                        <span
                          key={id}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                        >
                          {c.emoji} {c.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom CTA ────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4"
        style={{ background: "linear-gradient(to top, hsl(var(--background)) 80%, transparent)" }}
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="px-5 py-3 rounded-xl text-sm font-medium transition-opacity"
              style={{
                background: "hsl(var(--muted))",
                color: "hsl(var(--foreground))",
                border: "1.5px solid hsl(var(--border))",
              }}
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={step < 2 ? () => go(step + 1) : finish}
            disabled={step === 0 && selected.size === 0}
            className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            style={{ background: "hsl(var(--primary))", color: "#fff" }}
          >
            {step === 2 ? "Open Clario" : step === 1 && !goal ? "Skip this step" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
