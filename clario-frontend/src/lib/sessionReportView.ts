import type { LucideIcon } from "lucide-react";
import { Sun, Cloud, CloudRain } from "lucide-react";

import type { SessionDetailData } from "./api";

function isSameLocalCalendarDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

/** Data for the dashboard "Today's Summary" strip — prefers today’s session, else most recent with a report */
export type TodaySummaryModel = {
  isFromToday: boolean;
  sessionDateLabel: string;
  mood: number;
  moodDelta: number | null;
  energyLevel: number | null;
  oneWordSummary: string | null;
  durationSeconds: number | null;
  wordsSpoken: number | null;
  keyBullets: string[];
  insightLine: string;
};

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function buildTodaySummaryFromSessions(
  sessions: SessionDetailData[],
): TodaySummaryModel | null {
  const withReport = sessions.filter((s) => s.report);
  if (withReport.length === 0) return null;

  const now = new Date();
  const todaySession = withReport.find((s) => isSameLocalCalendarDay(s.created_at, now));
  const picked = todaySession ?? withReport[0];
  const r = picked.report!;

  const idx = withReport.findIndex((s) => s.session_id === picked.session_id);
  const prev = idx >= 0 && idx < withReport.length - 1 ? withReport[idx + 1] : null;
  const moodDelta =
    prev?.report != null ? r.average_mood_rating - prev.report.average_mood_rating : null;

  const keyBullets: string[] = [];
  if (r.themes_discussed?.length) {
    for (const t of r.themes_discussed) {
      const label = t.label?.trim();
      if (label) keyBullets.push(label);
      if (keyBullets.length >= 3) break;
    }
  }
  if (keyBullets.length < 3 && r.things_you_did_today?.length) {
    for (const th of r.things_you_did_today) {
      if (keyBullets.length >= 3) break;
      const raw = (th.narrative ?? th.label ?? "").trim();
      if (!raw) continue;
      keyBullets.push(truncate(raw, 100));
    }
  }
  if (keyBullets.length === 0 && r.session_overview?.length) {
    for (const line of r.session_overview) {
      const one = line.replace(/\s+/g, " ").trim();
      if (one) keyBullets.push(truncate(one, 120));
      if (keyBullets.length >= 3) break;
    }
  }
  if (keyBullets.length === 0 && r.gratitude?.length) {
    for (const g of r.gratitude) {
      const t = g?.trim();
      if (t) keyBullets.push(truncate(t, 100));
      if (keyBullets.length >= 3) break;
    }
  }

  let insightLine = "";
  if (r.insights?.[0]?.body?.trim()) insightLine = r.insights[0].body.trim();
  else if (r.suggestions?.[0]?.trim()) insightLine = r.suggestions[0].trim();
  else if (r.personal_reflection?.trim()) {
    const first = r.personal_reflection.trim().split(/\n\s*\n+/)[0]?.trim() ?? "";
    insightLine = truncate(first, 240);
  } else if (r.session_overview?.[0]) insightLine = r.session_overview[0].trim();

  insightLine = insightLine.replace(/^["“]|["”]$/g, "").trim();

  return {
    isFromToday: !!todaySession && picked.session_id === todaySession.session_id,
    sessionDateLabel: formatSessionListDate(picked.created_at),
    mood: Math.round(r.average_mood_rating * 10) / 10,
    moodDelta,
    energyLevel: r.energy_level ?? null,
    oneWordSummary: r.one_word_summary ?? null,
    durationSeconds: r.duration_seconds ?? picked.duration_seconds ?? null,
    wordsSpoken: r.user_words_spoken ?? null,
    keyBullets,
    insightLine: insightLine || "Keep reflecting — your next entry will add more color here.",
  };
}

/** Card row in Past Sessions — summary outside; full `detail` opens the report modal */
export type PastSessionCardModel = {
  id: string;
  createdAtIso: string;
  labelDate: string;
  summary: string;
  moodScore: number | null;
  hasReport: boolean;
  detail: SessionDetailData;
};

export function formatSessionListDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

/** One-line summary for list tiles from stored report or fallbacks */
export function sessionListSummary(detail: SessionDetailData): string {
  const report = detail.report;
  const firstOverview = report?.session_overview?.[0]?.trim();
  if (firstOverview) return firstOverview;

  const word = report?.one_word_summary?.trim();
  if (word) return `${word} — reflection logged.`;

  if (detail.conversation?.length) {
    return "Voice session — open the report when it's ready.";
  }
  return "Session started — no transcript yet.";
}

export function sessionDetailToPastCard(detail: SessionDetailData): PastSessionCardModel {
  const report = detail.report;
  const moodScore =
    report != null ? Math.round(report.average_mood_rating * 10) / 10 : null;

  return {
    id: detail.session_id,
    createdAtIso: detail.created_at,
    labelDate: formatSessionListDate(detail.created_at),
    summary: sessionListSummary(detail),
    moodScore,
    hasReport: report != null,
    detail,
  };
}

/** Rough weather-style icon from average mood (7+ sunny, 4–6 cloudy, below rainy) */
export function moodWeatherIcon(score: number | null): LucideIcon {
  if (score == null) return Cloud;
  if (score >= 7) return Sun;
  if (score >= 4) return Cloud;
  return CloudRain;
}

/** One point per calendar day for the mood line chart (oldest → newest, local dates) */
export type MoodTrendPoint = { day: string; mood: number | null };

const sameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Last `dayCount` calendar days ending today. `mood` is the average of `average_mood_rating`
 * for sessions that day that have a report; null if none.
 */
export function buildMoodTrendSeries(
  sessions: SessionDetailData[],
  dayCount = 7,
): MoodTrendPoint[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setDate(start.getDate() - (dayCount - 1));

  const out: MoodTrendPoint[] = [];
  for (let j = 0; j < dayCount; j++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + j);
    const label = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);

    const moods: number[] = [];
    for (const s of sessions) {
      if (!s.report) continue;
      const sd = new Date(s.created_at);
      if (sameLocalDay(sd, d)) moods.push(s.report.average_mood_rating);
    }

    const mood =
      moods.length === 0
        ? null
        : Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10;
    out.push({ day: label, mood });
  }
  return out;
}

function localCalendarKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Consecutive local calendar days with at least one session that has a report.
 * If today has no report yet, the streak still counts from yesterday (common journal UX).
 */
export function computeJournalStreak(sessions: SessionDetailData[]): number {
  const dayKeys = new Set<string>();
  for (const s of sessions) {
    if (!s.report) continue;
    const d = new Date(s.created_at);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    dayKeys.add(localCalendarKey(start));
  }
  if (dayKeys.size === 0) return 0;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  let anchor = todayStart;
  if (!dayKeys.has(localCalendarKey(todayStart))) {
    anchor = yesterdayStart;
  }

  let streak = 0;
  const check = new Date(anchor);
  while (dayKeys.has(localCalendarKey(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}
