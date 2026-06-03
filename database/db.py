import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "medisense.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    with open(SCHEMA_PATH, "r") as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("Database ready!")

def save_message(session_id, role, content, mode):
    conn = get_connection()
    conn.execute(
        "INSERT INTO messages (session_id, role, content, mode) VALUES (?, ?, ?, ?)",
        (session_id, role, content, mode)
    )
    conn.commit()
    conn.close()

def get_conversation_history(session_id):
    conn = get_connection()
    rows = conn.execute(
        "SELECT role, content, mode, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]