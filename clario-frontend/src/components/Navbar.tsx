import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import i18n from "@/i18n";
import { useState } from "react";

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

  const navItems = [
    { label: "Daily Check", path: "/daily-check" },
    { label: t("nav.dashboard"), path: "/dashboard" },
    { label: "Breathe", path: "/breathe" },
    { label: "Meditation", path: "/meditation" },
    { label: t("nav.journal"), path: "/journal" },
    { label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4">
        {/* Mobile layout */}
        <div className="md:hidden flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="font-display text-2xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors duration-200 shrink-0"
          >
            Clario
          </Link>

          <div className="flex items-center gap-4 min-w-0 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-body text-sm tracking-wide whitespace-nowrap transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="font-display text-2xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors duration-200 shrink-0"
          >
            Clario
          </Link>

          <div className="flex items-center gap-6 md:gap-8 flex-1 justify-center min-w-0">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-body text-sm tracking-wide transition-colors duration-200 whitespace-nowrap ${
                  location.pathname === item.path
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              title={currentLang === "en" ? "Switch to नेपाली" : "Switch to English"}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
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
      </div>
    </motion.nav>
  );
};

export default Navbar;
