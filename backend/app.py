from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ai'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'database'))

import ai_logic
import db

app = Flask(__name__, static_folder='../frontend')
CORS(app)

db.init_db()

@app.route("/")
def home():
    return send_from_directory('../frontend', 'index.html')

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory('../frontend', filename)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    mode = data.get("mode", "symptoms")
    messages = data.get("messages", [])
    session_id = data.get("session_id", "default_session")
    user_message = messages[-1]["content"]
    db.save_message(session_id, "user", user_message, mode)
    reply = ai_logic.get_ai_response(mode, messages)
    db.save_message(session_id, "assistant", reply, mode)
    return jsonify({"reply": reply, "mode": mode})

if __name__ == "__main__":
    print("MediSense AI running on http://127.0.0.1:5000")
    app.run(debug=False, port=5000)