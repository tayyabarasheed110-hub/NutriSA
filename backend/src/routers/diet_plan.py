import os
from flask import Blueprint, request, jsonify
from supabase import create_client

diet_plan_bp = Blueprint("diet_plan", __name__, url_prefix="/api/diet-plan")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def _get_user_id(token):
    return supabase.auth.get_user(token).user.id


def _generate_plan(profile):
    protein_target = profile.get("protein_target", 100)
    diet_types = profile.get("diet_types", [])
    is_veg = "vegetarian" in diet_types or "vegan" in diet_types or "jain" in diet_types
    is_halal = "halal" in diet_types
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    plan = []
    for day in days:
        if is_veg:
            breakfast = {"name": "Paneer paratha + lassi", "protein": 22}
            lunch = {"name": "Rajma chawal + salad", "protein": 20}
            dinner = {"name": "Dal tadka + roti + raita", "protein": 18}
            snack = {"name": "Roasted chana + chai", "protein": 12}
        else:
            meat = "chicken" if is_halal else "chicken"
            breakfast = {"name": "Egg bhurji + paratha", "protein": 22}
            lunch = {"name": f"{meat} karahi + roti", "protein": 32}
            dinner = {"name": "Fish curry + rice", "protein": 24}
            snack = {"name": "Boiled eggs + chai", "protein": 14}
        total = breakfast["protein"] + lunch["protein"] + dinner["protein"] + snack["protein"]
        plan.append({
            "day": day,
            "meals": {"breakfast": breakfast, "lunch": lunch, "dinner": dinner, "snack": snack},
            "total_protein": total,
        })
    return plan


@diet_plan_bp.route("/generate", methods=["POST"])
def generate_plan():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    try:
        profile = supabase.table("profiles").select("*").eq("id", uid).single().execute()
        plan = _generate_plan(profile.data)
        existing = supabase.table("diet_plans").select("id").eq("user_id", uid).execute()
        if existing.data:
            plan_id = existing.data[0]["id"]
            supabase.table("diet_plans").update({"plan_data": plan}).eq("id", plan_id).execute()
        else:
            insert = supabase.table("diet_plans").insert({"user_id": uid, "plan_data": plan}).execute()
            plan_id = insert.data[0]["id"]
        return jsonify({"plan": plan, "plan_id": plan_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@diet_plan_bp.route("/current", methods=["GET"])
def get_current_plan():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "): return jsonify({"error": "Missing token"}), 401
    try:
        uid = _get_user_id(auth.split(" ", 1)[1])
    except Exception:
        return jsonify({"error": "Invalid token"}), 401
    try:
        row = supabase.table("diet_plans").select("*").eq("user_id", uid).single().execute()
        return jsonify(row.data), 200
    except Exception:
        return jsonify({"plan_data": []}), 200
