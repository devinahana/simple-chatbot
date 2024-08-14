import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)

CORS(app)

load_dotenv()

@app.route("/test")
def test():
    return {"test": "Test"}

@app.route("/conversation", methods=["POST"])
def conversation():
    api_key = os.environ.get("API_KEY")
    if not api_key:
        return jsonify({"error": "API key is not set. Please check your environment variables."}), 500

    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({"error": "Invalid request body. 'messages' field is required."}), 400
    
    messages = [
            {
                "role": "system", 
                "content": "You are a helpful assistant."
            }
        ]
    messages.extend(data['messages'])
    
    client = OpenAI(api_key=api_key)
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )

    response_obj = {
        "id": completion.id,
        "model": completion.model,
        "created": completion.created,
        "object": completion.object,
        "choices": [{
            "messages": [{
                "role": "assistant",
                "content": completion.choices[0].message.content
            }]
        }]
    }

    return jsonify(response_obj), 200

if __name__ == "__main__":
    app.run()

