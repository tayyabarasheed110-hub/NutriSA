import os
from flask import Blueprint, request, jsonify
from supabase import create_client

user_bp = Blueprint("user", __name__, url_prefix="/api/user")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def _calc_targets(weight_kg, goal, activity_level):
    base = {"build muscle": 1.6, "lose fat": 1.2, "maintain weight": 1.0}.get(goal, 1.0)
    mult = {"sedentary": 0.9, "light": 1.0, "moderate": 1.05, "active": 1.1, "very active": 1.15}.get(activity_level, 1.0)
    protein = round(base * weight_kg * mult / 5) * 5
    return protein, round(2200 * mult)


def _get_user(token):
    return supabase.auth.get_user(token)


@user_bp.route("/profile", methods=["GET"])
def get_profile():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user(auth.split(" ", 1)[1]).user.id
        row = supabase.table("profiles").select("*").eq("id", uid).single().execute()
        return jsonify(row.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@user_bp.route("/profile", methods=["PUT"])
def update_profile():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify({"error": "Missing token"}), 401
    data = request.get_json() or {}
    try:
        uid = _get_user(auth.split(" ", 1)[1]).user.id
        allowed = {k: v for k, v in data.items() if k in [
            "full_name", "age", "sex", "weight_kg", "height_cm",
            "goal", "activity_level", "diet_types", "allergies",
            "protein_target", "calorie_target"
        ]}
        if "weight_kg" in allowed and "goal" in allowed and "activity_level" in allowed:
            allowed["protein_target"], allowed["calorie_target"] = _calc_targets(
                allowed["weight_kg"], allowed["goal"], allowed["activity_level"]
            )
        if allowed:
            supabase.table("profiles").update(allowed).eq("id", uid).execute()
        row = supabase.table("profiles").select("*").eq("id", uid).single().execute()
        return jsonify(row.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
