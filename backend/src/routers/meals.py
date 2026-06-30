import os
from flask import Blueprint, request, jsonify
from supabase import create_client
from datetime import datetime, timedelta

meals_bp = Blueprint("meals", __name__, url_prefix="/api/meal")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def _get_user_id(token):
    return supabase.auth.get_user(token).user.id


@meals_bp.route("/scan", methods=["POST"])
def scan_meal():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    if not request.files.get("image"):
        return jsonify({"error": "No image uploaded"}), 400
    # Simulated scan result
    return jsonify({
        "meal_name": "Dal makhani + 2 roti",
        "confidence": 91,
        "protein": 24, "carbs": 72, "fat": 9, "calories": 468,
        "ingredients": ["black lentils", "butter", "cream", "wheat roti"],
    }), 200


@meals_bp.route("/chat", methods=["POST"])
def chat_meal():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    data = request.get_json() or {}
    msg = data.get("message", "")
    return jsonify({
        "response_text": f"Logged: {msg}",
        "meal_identified": True,
        "nutrients": {"protein": 18, "carbs": 55, "fat": 8, "calories": 350},
        "logged": False,
    }), 200


@meals_bp.route("/log", methods=["POST"])
def log_meal():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    data = request.get_json() or {}
    try:
        supabase.table("meals").insert({
            "user_id": uid,
            "name": data.get("name", "Unnamed"),
            "protein": data.get("protein", 0),
            "carbs": data.get("carbs", 0),
            "fat": data.get("fat", 0),
            "calories": data.get("calories", 0),
            "source": data.get("source", "chat"),
            "image_url": data.get("image_url"),
        }).execute()
        return jsonify({"ok": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@meals_bp.route("/today", methods=["GET"])
def get_today():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    today = datetime.utcnow().strftime("%Y-%m-%d")
    try:
        meals = supabase.table("meals").select("*").eq("user_id", uid).gte("created_at", today).execute()
        totals = {"protein": 0, "carbs": 0, "fat": 0, "calories": 0}
        for m in meals.data:
            for k in totals: totals[k] += m.get(k, 0)
        return jsonify({"meals": meals.data, "totals": totals}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@meals_bp.route("/history", methods=["GET"])
def get_history():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    try:
        q = supabase.table("meals").select("*").eq("user_id", uid).order("created_at", desc=True)
        if from_date: q = q.gte("created_at", from_date)
        if to_date: q = q.lte("created_at", to_date)
        return jsonify({"meals": q.execute().data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@meals_bp.route("/<meal_id>", methods=["DELETE"])
def delete_meal(meal_id):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
        supabase.table("meals").delete().eq("id", meal_id).eq("user_id", uid).execute()
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@meals_bp.route("/<meal_id>", methods=["PUT"])
def update_meal(meal_id):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
        data = request.get_json() or {}
        allowed = {k: v for k, v in data.items() if k in ["name", "protein", "carbs", "fat", "calories", "image_url"]}
        supabase.table("meals").update(allowed).eq("id", meal_id).eq("user_id", uid).execute()
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
