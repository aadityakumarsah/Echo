// Trial is based on Supabase user.created_at — server-side, cannot be faked
// by clearing localStorage.

const TRIAL_DAYS = 3;

export function isTrialActive(userCreatedAt: string | null | undefined): boolean {
  if (!userCreatedAt) return false;
  const expiry = new Date(new Date(userCreatedAt).getTime() + TRIAL_DAYS * 864e5);
  return Date.now() < expiry.getTime();
}

export function getTrialDaysLeft(userCreatedAt: string | null | undefined): number {
  if (!userCreatedAt) return 0;
  const expiry = new Date(new Date(userCreatedAt).getTime() + TRIAL_DAYS * 864e5);
  const ms = expiry.getTime() - Date.now();
  return ms <= 0 ? 0 : Math.min(TRIAL_DAYS, Math.ceil(ms / 864e5));
}

/** Returns a human-readable time string like "2 days", "18 hours", "45 minutes". */
export function getTrialTimeLabel(userCreatedAt: string | null | undefined): string {
  if (!userCreatedAt) return "0 days";
  const expiry = new Date(new Date(userCreatedAt).getTime() + TRIAL_DAYS * 864e5);
  const ms = expiry.getTime() - Date.now();
  if (ms <= 0) return "0 days";
  const totalMinutes = Math.floor(ms / 60_000);
  const totalHours   = Math.floor(ms / 3_600_000);
  const totalDays    = Math.floor(ms / 86_400_000);
  if (totalDays >= 2) return `${totalDays + 1} days`;
  if (totalHours >= 1) return `${totalHours} hour${totalHours !== 1 ? "s" : ""}`;
  return `${Math.max(1, totalMinutes)} minute${totalMinutes !== 1 ? "s" : ""}`;
}
