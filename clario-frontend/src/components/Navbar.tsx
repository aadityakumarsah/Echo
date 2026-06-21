import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Languages, CheckSquare, LayoutDashboard, Wind, Brain, BookOpen, Settings, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import i18n from "@/i18n";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Check",      path: "/daily-check", Icon: CheckSquare },
  { label: "Dashboard",  path: "/dashboard",   Icon: LayoutDashboard },
  { label: "Breathe",    path: "/breathe",     Icon: Wind },
  { label: "Relief",     path: "/relief",      Icon: Smile },
  { label: "Meditation", path: "/meditation",  Icon: Brain },
  { label: "Journal",    path: "/journal",     Icon: BookOpen },
  { label: "Settings",   path: "/settings",    Icon: Settings },
];

// Pages that render their own full-screen UI — hide navbar entirely on mobile
const FULLSCREEN_PATHS = ["/breathe/", "/daily-check/morning", "/daily-check/refill", "/daily-check/night", "/meditation", "/relief/drawing", "/relief/blocks"];

const Navbar = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ne" : "en";
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("clario-lang", newLang);
  };

  const isFullscreen = FULLSCREEN_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <>
      {/* ── Desktop top bar ──────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="font-display text-2xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors duration-200 shrink-0"
          >
            Clario
          </Link>

          <div className="flex items-center gap-7 flex-1 justify-center">
            {NAV_ITEMS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`text-sm tracking-wide transition-colors duration-200 whitespace-nowrap ${
                  location.pathname === path || location.pathname.startsWith(path + "/")
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              <Languages className="w-3.5 h-3.5" />
              {currentLang === "en" ? "EN" : "ने"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile top strip (brand + utils only) ────────────────────── */}
      {!isFullscreen && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/85 border-b border-border/40 flex items-center justify-between px-4 py-3">
          <Link
            to="/dashboard"
            className="font-display text-xl font-semibold tracking-tight text-foreground"
          >
            Clario
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Languages className="w-3.5 h-3.5" />
              {currentLang === "en" ? "EN" : "ने"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ─────────────────────────────────────── */}
      {!isFullscreen && (
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40"
          style={{
            backgroundColor: "rgba(10,14,24,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="flex items-stretch">
            {NAV_ITEMS.map(({ label, path, Icon }) => {
              const active = location.pathname === path || location.pathname.startsWith(path + "/");
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-opacity"
                  style={{ minWidth: 0 }}
                >
                  <motion.div
                    animate={{ scale: active ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: active ? "#A78BFA" : "rgba(255,255,255,0.32)" }}
                      strokeWidth={active ? 2.2 : 1.6}
                    />
                  </motion.div>
                  <span
                    className="text-[9px] font-medium truncate w-full text-center"
                    style={{
                      color: active ? "#A78BFA" : "rgba(255,255,255,0.28)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute top-0 h-[2px] w-8 rounded-full"
                      style={{ backgroundColor: "#A78BFA" }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </>
  );
};

export default Navbar;
