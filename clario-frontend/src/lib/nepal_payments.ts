import { supabase } from "./supabase";

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL as string) ?? "";

async function authHeaders(): Promise<Record<string, string>> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
  return h;
}

export type NepalPlan = "weekly" | "monthly" | "yearly";
export type NepalGateway = "esewa" | "khalti";

export interface NepalCheckoutResult {
  gateway: NepalGateway;
  action_url: string;
  fields: Record<string, string> | null;
  transaction_uuid: string;
}

/** Initiate eSewa or Khalti checkout — returns redirect info from the backend. */
export async function initiateNepalPayment(
  plan: NepalPlan,
  gateway: NepalGateway,
): Promise<NepalCheckoutResult> {
  if (!BASE) throw new Error("Backend URL not configured");
  const origin = window.location.origin;
  const res = await fetch(`${BASE}/nepal-payments/initiate`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      plan,
      gateway,
      success_url: `${origin}/paywall/success`,
      failure_url: `${origin}/paywall`,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Nepal payment initiation failed (${res.status})`);
  }
  return res.json();
}

/**
 * Submit an eSewa payment — creates a hidden <form> and auto-submits it.
 * eSewa requires a browser POST (not a fetch redirect) to their endpoint.
 */
export function submitEsewaForm(actionUrl: string, fields: Record<string, string>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

/** Verify a completed Nepal payment with the backend. Called from the success page. */
export async function verifyNepalPayment(params: {
  gateway: NepalGateway;
  plan: NepalPlan;
  transaction_uuid: string;
  esewa_data?: string;
  khalti_pidx?: string;
}): Promise<{ verified: boolean; plan: string; expires_at: string }> {
  if (!BASE) throw new Error("Backend URL not configured");
  const res = await fetch(`${BASE}/nepal-payments/verify`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Verification failed (${res.status})`);
  }
  return res.json();
}

export const NPR_LABELS: Record<NepalPlan, string> = {
  weekly:  "Rs. 399 / week",
  monthly: "Rs. 1,299 / month",
  yearly:  "Rs. 24,999 / year",
};
