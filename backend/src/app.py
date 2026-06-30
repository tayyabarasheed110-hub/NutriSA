import os
from flask import Flask, jsonify
from flask_cors import CORS
from .routers.auth import auth_bp
from .routers.user import user_bp
from .routers.meals import meals_bp
from .routers.progress import progress_bp
from .routers.diet_plan import diet_plan_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(meals_bp)
app.register_blueprint(progress_bp)
app.register_blueprint(diet_plan_bp)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
