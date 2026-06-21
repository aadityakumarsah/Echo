const TRIAL_KEY = "clario-trial-start";
const TRIAL_DAYS = 3;

export function getTrialStartDate(): Date {
  const stored = localStorage.getItem(TRIAL_KEY);
  if (stored) {
    return new Date(stored);
  }
  const now = new Date();
  localStorage.setItem(TRIAL_KEY, now.toISOString());
  return now;
}

export function isTrialActive(): boolean {
  const start = getTrialStartDate();
  const expiry = new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  return new Date() < expiry;
}

export function getTrialDaysLeft(): number {
  const start = getTrialStartDate();
  const expiry = new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const msLeft = expiry.getTime() - Date.now();
  if (msLeft <= 0) return 0;
  return Math.min(TRIAL_DAYS, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
}
