import { useEffect, useState } from "react";
import { isTrialActive, getTrialDaysLeft } from "@/lib/trial";
import { getSubscriptionStatus } from "@/lib/subscription";

interface AccessState {
  hasAccess: boolean;
  trialDaysLeft: number;
  loading: boolean;
}

export function useAccess(): AccessState {
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const trialActive = isTrialActive();
  const trialDaysLeft = getTrialDaysLeft();

  useEffect(() => {
    // Only check subscription if user has a token (is logged in)
    const token = localStorage.getItem("clario-token");
    if (!token) {
      setLoading(false);
      return;
    }

    getSubscriptionStatus()
      .then((status) => {
        setSubscriptionActive(status.active);
      })
      .catch(() => {
        setSubscriptionActive(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    hasAccess: trialActive || subscriptionActive,
    trialDaysLeft,
    loading,
  };
}
