import os
from flask import Blueprint, request, jsonify
from supabase import create_client

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase credentials not found")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    try:
        resp = supabase.auth.sign_up({"email": email, "password": password})
        user = resp.user
        if not user:
            return jsonify({"error": "Sign-up failed"}), 400
        supabase.table("profiles").insert({
            "id": user.id,
            "email": email,
        }).execute()
        return jsonify({"id": user.id, "email": email}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    try:
        resp = supabase.auth.sign_in_with_password({"email": email, "password": password})
        session = resp.session
        if not session:
            return jsonify({"error": "Invalid credentials"}), 401
        return jsonify({
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "user": {"id": resp.user.id, "email": resp.user.email},
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
