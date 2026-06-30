import os
from flask import Blueprint, request, jsonify
from supabase import create_client
from datetime import datetime, timedelta

progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def _get_user_id(token):
    return supabase.auth.get_user(token).user.id


@progress_bp.route("/summary", methods=["GET"])
def get_summary():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    range_param = request.args.get("range", "7d")
    days = {"7d": 7, "30d": 30, "3m": 90}.get(range_param, 7)
    from_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
    try:
        meals = supabase.table("meals").select("*").eq("user_id", uid).gte("created_at", from_date).execute()
        daily = {}
        for m in meals.data:
            d = m["created_at"][:10]
            daily.setdefault(d, {"protein": 0, "carbs": 0, "fat": 0, "calories": 0})
            for k in ["protein", "carbs", "fat", "calories"]:
                daily[d][k] += m.get(k, 0)
        result = []
        for i in range(days):
            d = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            result.append({"date": d, **daily.get(d, {"protein": 0, "carbs": 0, "fat": 0, "calories": 0})})
        result.reverse()
        return jsonify({"daily": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@progress_bp.route("/streak", methods=["GET"])
def get_streak():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
        row = supabase.table("streaks").select("*").eq("user_id", uid).single().execute()
        return jsonify(row.data), 200
    except Exception:
        return jsonify({"current_streak": 0, "best_streak": 0, "last_log_date": None}), 200
