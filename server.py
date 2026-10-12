import os

from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")


SYSTEM = """You are EnglishMitra, a warm, patient English teacher for an adult beginner.

Your job is to help the learner speak natural everyday English confidently.

Rules:
- Use simple English unless the learner asks for advanced English.
- Never shame mistakes.
- When the learner makes a mistake, briefly show:
  "Better: ..."
  Then explain the key correction in one simple sentence.
- Keep replies short enough to be comfortable for voice playback, usually 1-4 sentences.
- Ask one useful follow-up question when appropriate.
- Prefer Indian everyday contexts when relevant, but do not stereotype.
- If the user asks something unrelated, answer normally and then gently return to English practice when useful.
"""


def groq_chat(message, history, mode, situation):
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is missing from .env")

    client = Groq(api_key=api_key)

    messages = [
        {
            "role": "system",
            "content": (
                SYSTEM
                + f"\nCoach mode: {mode}."
                + f"\nSituation: {situation}."
            ),
        }
    ]

    # Add previous conversation
    for item in history[-16:]:
        role = item.get("role")
        content = item.get("content")

        if role in ["user", "assistant"] and content:
            messages.append({
                "role": role,
                "content": content
            })

    # Add current message
    messages.append({
        "role": "user",
        "content": message
    })

    response = client.chat.completions.create(
        model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
        messages=messages,
        temperature=0.5,
        max_completion_tokens=300,
        stream=False,
    )

    return response.choices[0].message.content


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)

    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({
            "error": "Message is required"
        }), 400

    history = data.get("history") or []
    mode = data.get("mode", "conversation")
    situation = data.get("situation", "General")

    try:
        reply = groq_chat(
            message,
            history,
            mode,
            situation
        )

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        print("GROQ ERROR:", repr(e))

        return jsonify({
            "error": "AI request failed. Check your Groq API key and model."
        }), 500


@app.get("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/test", methods=["GET"])
def test():
    print("TEST ROUTE WAS CALLED!")

    return {
        "status": "Flask is working"
    }


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=True
    )