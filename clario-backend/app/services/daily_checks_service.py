"""Daily check completion + streak tracking backed by Supabase."""
from __future__ import annotations

from datetime import date, timedelta
from typing import Literal

from loguru import logger

from app.core.supabase import get_supabase_client

StepKey = Literal["morning", "refill", "night"]
_ALL_STEPS: tuple[StepKey, ...] = ("morning", "refill", "night")


# ── helpers ───────────────────────────────────────────────────────────────────

def _sb():
    """Return the admin Supabase client (bypasses RLS).  Raises if unconfigured."""
    client = get_supabase_client()
    if client is None:
        raise RuntimeError("Supabase client not configured")
    return client


def _row_to_dict(row: dict) -> dict:
    return {
        "morning":      bool(row.get("morning")),
        "refill":       bool(row.get("refill")),
        "night":        bool(row.get("night")),
        "day_complete": bool(row.get("day_complete")),
        "completed_at": row.get("completed_at"),
        "check_date":   str(row.get("check_date", "")),
    }


def _empty_day(check_date: str) -> dict:
    return {
        "morning": False, "refill": False, "night": False,
        "day_complete": False, "completed_at": None, "check_date": check_date,
    }


def _streak_dict(row: dict | None) -> dict:
    if not row:
        return {"current_streak": 0, "longest_streak": 0, "last_check_date": None}
    return {
        "current_streak":  int(row.get("current_streak") or 0),
        "longest_streak":  int(row.get("longest_streak") or 0),
        "last_check_date": row.get("last_check_date"),
    }


# ── streak recalculation ──────────────────────────────────────────────────────

def _update_streak(user_id: str, check_date_str: str) -> dict:
    """
    Called when a day just became complete (day_complete flipped to TRUE).
    Computes the new streak and upserts user_streaks.
    """
    sb = _sb()
    today = date.fromisoformat(check_date_str)

    # Fetch existing streak row
    res = sb.table("user_streaks").select("*").eq("user_id", user_id).maybe_single().execute()
    existing = res.data if res.data else None

    if existing is None:
        new_streak = 1
        new_longest = 1
    else:
        prev_date = existing.get("last_check_date")
        current   = int(existing.get("current_streak") or 0)
        longest   = int(existing.get("longest_streak") or 0)

        if prev_date is None:
            new_streak = 1
        elif isinstance(prev_date, str):
            prev = date.fromisoformat(prev_date)
            if prev == today:
                # Already counted today — idempotent
                return _streak_dict(existing)
            elif prev == today - timedelta(days=1):
                new_streak = current + 1
            else:
                new_streak = 1
        else:
            new_streak = 1

        new_longest = max(longest, new_streak)

    payload = {
        "user_id":        user_id,
        "current_streak": new_streak,
        "longest_streak": new_longest,
        "last_check_date": check_date_str,
    }
    sb.table("user_streaks").upsert(payload, on_conflict="user_id").execute()
    return {"current_streak": new_streak, "longest_streak": new_longest, "last_check_date": check_date_str}


# ── public API ────────────────────────────────────────────────────────────────

def mark_step(user_id: str, step: StepKey, check_date: str) -> dict:
    """
    Mark one step as done for a given local date.
    Returns: { morning, refill, night, day_complete, completed_at,
               check_date, current_streak, longest_streak }
    """
    sb = _sb()

    # Fetch (or create) today's row
    res = (
        sb.table("daily_checks")
        .select("*")
        .eq("user_id", user_id)
        .eq("check_date", check_date)
        .maybe_single()
        .execute()
    )
    existing = res.data or {}

    # Build the update payload — only set the relevant step to TRUE
    update: dict = {step: True}

    # Compute new per-step booleans
    morning = update.get("morning", bool(existing.get("morning")))
    refill  = update.get("refill",  bool(existing.get("refill")))
    night   = update.get("night",   bool(existing.get("night")))

    was_complete = bool(existing.get("day_complete"))
    now_complete = morning and refill and night

    if now_complete and not was_complete:
        from datetime import datetime, timezone
        update["day_complete"] = True
        update["completed_at"] = datetime.now(timezone.utc).isoformat()

    # Upsert the row
    upsert_payload = {
        "user_id":    user_id,
        "check_date": check_date,
        "morning":    morning,
        "refill":     refill,
        "night":      night,
        **update,
    }
    sb.table("daily_checks").upsert(upsert_payload, on_conflict="user_id,check_date").execute()

    # Recalculate streak if this call just completed the day
    streak = {}
    if now_complete and not was_complete:
        streak = _update_streak(user_id, check_date)
    else:
        s_res = sb.table("user_streaks").select("*").eq("user_id", user_id).maybe_single().execute()
        streak = _streak_dict(s_res.data)

    logger.info(
        "mark_step | user={} step={} date={} day_complete={} streak={}",
        user_id, step, check_date, now_complete, streak.get("current_streak"),
    )
    return {
        "morning":        morning,
        "refill":         refill,
        "night":          night,
        "day_complete":   morning and refill and night,
        "completed_at":   upsert_payload.get("completed_at"),
        "check_date":     check_date,
        **streak,
    }


def get_today(user_id: str, check_date: str) -> dict:
    """
    Fetch today's check state + current streak.
    """
    sb = _sb()

    day_res = (
        sb.table("daily_checks")
        .select("*")
        .eq("user_id", user_id)
        .eq("check_date", check_date)
        .maybe_single()
        .execute()
    )
    day = _row_to_dict(day_res.data) if day_res.data else _empty_day(check_date)

    streak_res = sb.table("user_streaks").select("*").eq("user_id", user_id).maybe_single().execute()
    streak = _streak_dict(streak_res.data)

    return {**day, **streak}


def get_history(user_id: str, days: int, end_date: str) -> list[dict]:
    """
    Return the last `days` rows (inclusive of end_date) for the weekly dots view.
    Missing dates are filled with empty rows.
    """
    sb = _sb()
    end   = date.fromisoformat(end_date)
    start = end - timedelta(days=days - 1)

    res = (
        sb.table("daily_checks")
        .select("check_date, morning, refill, night, day_complete")
        .eq("user_id", user_id)
        .gte("check_date", start.isoformat())
        .lte("check_date", end.isoformat())
        .order("check_date")
        .execute()
    )
    rows_by_date = {r["check_date"]: r for r in (res.data or [])}

    result = []
    for i in range(days):
        d = start + timedelta(days=i)
        key = d.isoformat()
        row = rows_by_date.get(key)
        result.append(
            _row_to_dict(row) if row else _empty_day(key)
        )
    return result
