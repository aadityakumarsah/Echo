import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isTrialActive, getTrialDaysLeft } from "@/lib/trial";
import { getSubscriptionStatus } from "@/lib/subscription";

interface AccessState {
  hasAccess: boolean;
  trialDaysLeft: number;
  loading: boolean;
}

export function useAccess(): AccessState {
  const { user, loading: authLoading } = useAuth();
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subLoading, setSubLoading] = useState(true);

  const createdAt = user?.created_at ?? null;
  const trialActive  = isTrialActive(createdAt);
  const trialDaysLeft = getTrialDaysLeft(createdAt);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setSubLoading(false); return; }

    getSubscriptionStatus()
      .then((s) => setSubscriptionActive(s.active))
      .catch(() => setSubscriptionActive(false))
      .finally(() => setSubLoading(false));
  }, [user, authLoading]);

  return {
    hasAccess: trialActive || subscriptionActive,
    trialDaysLeft,
    loading: authLoading || subLoading,
  };
}
