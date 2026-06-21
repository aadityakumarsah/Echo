"""SQLite helpers for Stripe subscription tracking."""
from app.core.database import get_conn


def init_subscriptions_table() -> None:
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS subscriptions (
            user_id TEXT PRIMARY KEY,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            plan TEXT,
            status TEXT,
            current_period_end INTEGER
        );
    """)
    conn.commit()


def upsert_subscription(
    user_id: str,
    stripe_customer_id: str | None = None,
    stripe_subscription_id: str | None = None,
    plan: str | None = None,
    status: str | None = None,
    current_period_end: int | None = None,
) -> None:
    conn = get_conn()
    existing = conn.execute(
        "SELECT * FROM subscriptions WHERE user_id = ?", (user_id,)
    ).fetchone()

    if existing:
        fields = []
        values = []
        if stripe_customer_id is not None:
            fields.append("stripe_customer_id = ?")
            values.append(stripe_customer_id)
        if stripe_subscription_id is not None:
            fields.append("stripe_subscription_id = ?")
            values.append(stripe_subscription_id)
        if plan is not None:
            fields.append("plan = ?")
            values.append(plan)
        if status is not None:
            fields.append("status = ?")
            values.append(status)
        if current_period_end is not None:
            fields.append("current_period_end = ?")
            values.append(current_period_end)
        if fields:
            values.append(user_id)
            conn.execute(
                f"UPDATE subscriptions SET {', '.join(fields)} WHERE user_id = ?",
                values,
            )
    else:
        conn.execute(
            """INSERT INTO subscriptions
               (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end),
        )
    conn.commit()


def get_subscription(user_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM subscriptions WHERE user_id = ?", (user_id,)
    ).fetchone()
    return dict(row) if row else None
