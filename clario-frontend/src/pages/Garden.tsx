/**
 * Garden — full view of the user's growing garden.
 * Ported from clario-mobile/src/screens/Garden.tsx.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, Sprout, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import GardenScene from "@/components/GardenScene";
import { useAuth } from "@/contexts/AuthContext";
import { getDailyChecksToday, getDailyChecksHistory, localDateString, type DailyCheckDay } from "@/lib/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
function todayKey() {
  return `daily-check-${localDateString()}`;
}

function dateKeyFor(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `daily-check-${y}-${m}-${day}`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function loadLocal(key: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(key) ?? "{}"); }
  catch { return {}; }
}

interface DayData { date: Date; label: string; keys: string[] }

function buildLast7Local(): DayData[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const data = loadLocal(dateKeyFor(d));
    return { date: d, label: formatDate(d), keys: Object.keys(data).filter(k => data[k]) };
  });
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Garden() {
  const navigate = useNavigate();
  const { displayName } = useAuth();
  const firstName = (displayName?.split(" ")[0] ?? "").replace(/[^a-zA-Z]/g, "");

  const [days, setDays]       = useState<DayData[]>([]);
  const [streak, setStreak]   = useState(0);
  const [todayKeys, setTodayKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediate local render
    const local = buildLast7Local();
    setDays(local);
    setTodayKeys(local[local.length - 1]?.keys ?? []);
    setLoading(false);

    // Sync from API
    Promise.all([getDailyChecksToday(), getDailyChecksHistory(7)])
      .then(([today, history]) => {
        setStreak(today.current_streak);
        const apiKeys = ["morning", "refill", "night"].filter(k => today[k as keyof typeof today]);
        setTodayKeys(apiKeys);

        const dates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
        });
        setDays(history.map((h: DailyCheckDay, i: number) => ({
          date: dates[i],
          label: formatDate(dates[i]),
          keys: ["morning", "refill", "night"].filter(k => h[k as keyof DailyCheckDay]),
        })));
      })
      .catch(() => {/* keep local */});
  }, []);

  const totalPlants  = days.filter(d => d.keys.length === 3).length;
  const activeDays   = days.filter(d => d.keys.length > 0).length;
  const todayDone    = todayKeys.length;

  const gardenFooter =
    todayDone === 0 ? "Start today to see your garden bloom." :
    todayDone === 1 ? "One step done — two more to go." :
    todayDone === 2 ? "Almost there — one more step." :
                      "Full bloom today. Beautiful.";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-5 pt-20 pb-24 md:pt-24 md:pb-16">

        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => navigate("/daily-check")}
              className="flex items-center gap-1 text-sm"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              <ChevronLeft size={18} strokeWidth={2} />
              Back
            </button>

            {streak > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#E8A44A33" }}
              >
                <Flame size={14} color="#C47A1B" strokeWidth={2.3} />
                <span className="text-sm font-black" style={{ color: "#6B3E0A" }}>{streak}</span>
                <span className="text-xs" style={{ color: "#8B5E1A" }}>day{streak !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
            your space
          </p>
          <h1 className="text-4xl font-bold mb-1" style={{ color: "hsl(var(--foreground))", letterSpacing: "-0.5px" }}>
            garden
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            {streak > 0
              ? `${streak}-day streak — your garden is growing.`
              : "Complete daily steps to grow your garden."}
          </p>
        </motion.div>

        {/* ── Garden scene ─────────────────────────────────────────── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 overflow-hidden"
            style={{
              borderRadius: 24,
              border: "2px solid rgba(93,176,117,0.35)",
              boxShadow: "0 6px 32px -6px rgba(58,46,42,0.14)",
            }}
          >
            <GardenScene completedKeys={todayKeys} dayCount={streak} />
            <div
              className="px-5 py-3"
              style={{ backgroundColor: "rgba(93,176,117,0.1)", borderTop: "1px solid rgba(93,176,117,0.2)" }}
            >
              <p className="text-sm italic font-medium" style={{ color: "#3A7A50" }}>
                {gardenFooter}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── This week ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "hsl(var(--foreground))" }}>
            this week
          </h2>
          <div
            className="flex justify-between rounded-2xl p-4"
            style={{ backgroundColor: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))" }}
          >
            {days.map((d, i) => {
              const isToday = i === days.length - 1;
              const full    = d.keys.length === 3;
              const count   = d.keys.length;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: full ? "#5DB075" : "hsl(var(--border))",
                      border: isToday ? "2px solid #E8A44A" : "none",
                      color: full ? "#fff" : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {full
                      ? <Sprout size={13} color="#fff" strokeWidth={2.5} />
                      : <span>{count}</span>
                    }
                  </div>
                  <span
                    className="text-[10px]"
                    style={{
                      color: isToday ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {d.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { num: totalPlants, label: "plants grown" },
            { num: streak,      label: "day streak"   },
            { num: activeDays,  label: "active days"  },
          ].map(({ num, label }) => (
            <div
              key={label}
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              <p className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))", fontFamily: "Georgia, serif" }}>
                {num}
              </p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── What grows ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-3" style={{ color: "hsl(var(--foreground))" }}>
            what grows
          </h2>
          <div
            className="rounded-2xl p-4 flex flex-col gap-4"
            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            {[
              { color: "#E8A44A", title: "Morning flower",  sub: "Morning Energy complete",  done: todayKeys.includes("morning") },
              { color: "#5DB075", title: "Moss bush",        sub: "Day Refill complete",      done: todayKeys.includes("refill")  },
              { color: "hsl(var(--primary))", title: "Night bloom", sub: "Night Summary complete", done: todayKeys.includes("night") },
            ].map(({ color, title, sub, done }) => (
              <div key={title} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    backgroundColor: color,
                    opacity: done ? 1 : 0.35,
                    border: done ? `2px solid ${color}` : "none",
                  }}
                />
                <div className="flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: done ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                  >
                    {title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{sub}</p>
                </div>
                {done && (
                  <span className="text-xs font-medium" style={{ color }}>✓ done</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
