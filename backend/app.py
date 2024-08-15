import os
import psycopg2
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

load_dotenv()

def db_conn():
    conn = psycopg2.connect(
        dbname="postgres",
        user="admin",
        password="12345678",
        host="34.45.220.223",
        port="15001"
    )
    return conn

@app.route("/create-history", methods=["POST"])
def create_history():

    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({"error": "Invalid request body. 'messages' field is required."}), 400
    
    messages = data['messages']
    title = data['title']

    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("BEGIN")
                cursor.execute("INSERT INTO history (title) VALUES (%s) RETURNING id", (title,))
                history_id = cursor.fetchone()[0]
                
                message_values = [(msg['role'], msg['content'], history_id) for msg in messages]
                cursor.executemany(
                    "INSERT INTO messages (role, content, history_id) VALUES (%s, %s, %s)",
                    message_values
                )

        return jsonify({"message": "History and messages created successfully", "history_id": history_id}), 201
    except Exception as e:
        connection.rollback()
        return jsonify({"error": "Error creating chat history. " + str(e)}), 500

@app.route("/history/<int:id>", methods=["GET"])
def history(id):
    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT role, content FROM messages WHERE history_id = %s", (id,))
                messages = cursor.fetchall()
                
                messages_list = [{'role': row[0], 'content': row[1]} for row in messages]
                
                return jsonify({"messages": messages_list}), 200
    except Exception as e:
        return jsonify({"error": "Error retrieving messages. " + str(e)}), 500

@app.route("/histories", methods=["GET"])
def histories():
    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, title FROM history")
                histories = cursor.fetchall()
                
                histories_list = [{'id': row[0], 'title': row[1]} for row in histories]
                
                return jsonify({"histories": histories_list}), 200
    except Exception as e:
        return jsonify({"error": "Error retrieving histories. " + str(e)}), 500
    

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