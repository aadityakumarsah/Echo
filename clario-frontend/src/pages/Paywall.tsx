import { useState } from "react";
import { motion } from "framer-motion";
import { createCheckoutSession } from "@/lib/subscription";

type Plan = "weekly" | "monthly" | "yearly";

interface PlanCard {
  id: Plan;
  label: string;
  price: string;
  period: string;
  description: string;
  highlight: boolean;
  badge?: string;
}

const PLANS: PlanCard[] = [
  {
    id: "weekly",
    label: "Weekly",
    price: "$3",
    period: "per week",
    description: "Try it out week by week",
    highlight: false,
  },
  {
    id: "monthly",
    label: "Monthly",
    price: "$10",
    period: "per month",
    description: "The most popular choice",
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "yearly",
    label: "Yearly",
    price: "$199",
    period: "per year",
    description: "Best value — save over 30%",
    highlight: false,
  },
];

export default function Paywall() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (plan: Plan) => {
    setLoadingPlan(plan);
    setError(null);
    try {
      const url = await createCheckoutSession(plan);
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#060F1E" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "#A78BFA" }}
        >
          Clario
        </h1>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center mb-10 space-y-2"
      >
        <h2 className="text-3xl font-semibold text-white">
          Your free trial has ended
        </h2>
        <p className="text-base" style={{ color: "#94A3B8" }}>
          Continue your wellness journey with a Clario subscription
        </p>
      </motion.div>

      {/* Plan cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => handleSelect(plan.id)}
            disabled={loadingPlan !== null}
            className="relative flex flex-col items-center text-center rounded-2xl p-6 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            style={{
              background: plan.highlight
                ? "linear-gradient(135deg, #1E1040 0%, #0F172A 100%)"
                : "#0D1B2E",
              border: plan.highlight
                ? "1.5px solid #7C3AED"
                : "1.5px solid #1E293B",
              boxShadow: plan.highlight
                ? "0 0 24px 0 rgba(124,58,237,0.18)"
                : "none",
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-0.5 rounded-full"
                style={{ background: "#7C3AED", color: "#fff" }}
              >
                {plan.badge}
              </span>
            )}

            <span
              className="text-base font-semibold mb-1"
              style={{ color: plan.highlight ? "#A78BFA" : "#94A3B8" }}
            >
              {plan.label}
            </span>

            <span
              className="text-4xl font-bold mb-0.5"
              style={{ color: "#F1F5F9" }}
            >
              {plan.price}
            </span>

            <span className="text-xs mb-3" style={{ color: "#64748B" }}>
              {plan.period}
            </span>

            <span className="text-sm mb-5" style={{ color: "#94A3B8" }}>
              {plan.description}
            </span>

            <span
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150"
              style={{
                background: plan.highlight
                  ? loadingPlan === plan.id
                    ? "#5B21B6"
                    : "#7C3AED"
                  : loadingPlan === plan.id
                  ? "#1E3A5F"
                  : "#1E293B",
                color: plan.highlight ? "#fff" : "#94A3B8",
              }}
            >
              {loadingPlan === plan.id ? "Redirecting…" : "Get started"}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-sm text-red-400 text-center max-w-sm"
        >
          {error}
        </motion.p>
      )}

      {/* Footer note */}
      <p className="mt-8 text-xs text-center" style={{ color: "#475569" }}>
        Cancel anytime. Secure payment via Stripe.
      </p>
    </div>
  );
}
