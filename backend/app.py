import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from setup_db import db_conn, create_tables
from utils.convert_time import convert_to_local
from flasgger import Swagger, swag_from

app = Flask(__name__)
swagger = Swagger(app, template={
    "info": {
        "title": "Simple OpenAI Chatbot API",
        "description": "API for managing simple OpenAI chatbot",
        "version": "1.0.0"
    }
})

CORS(app, resources={r"/*": {"origins": "*"}})

@app.cli.command("init-db")
def initialize():
    create_tables()

@app.route("/create-history", methods=["POST"])
@swag_from({
    "tags": ["History"],
    "summary": "Create Chat History",
    "description": "Create a new chat history along with its associated messages.",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "messages": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "role": {"type": "string"},
                                "content": {"type": "string"}
                            }
                        }
                    }
                },
                "required": ["messages", "title"]
            }
        }
    ],
    "responses": {
        "201": {
            "description": "Success",
            "schema": {
                "type": "object",
                "properties": {
                    "history_id": {"type": "integer"},
                    "message": {"type": "string"}
                }
            }
        },
        "400": {
            "description": "Bad Request",
            "schema": {
                "type": "object",
                "properties": {
                    "error": {"type": "string"}
                },
                "example": {
                    "error": "Invalid request body. 'messages' field is required."
                }
            }
        },
        "500": {
            "description": "Internal Server Error",
            "schema": {
                "type": "object",
                "properties": {
                    "error": {"type": "string"}
                },
                "example": {
                    "error": "Error creating chat history. "
                }
            }
        }
    }
})
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

        return jsonify({"message": "Chat history created successfully", "history_id": history_id}), 201
    except Exception as e:
        connection.rollback()
        return jsonify({"error": "Error creating chat history. " + str(e)}), 500
    
@app.route("/update-history/<int:id>", methods=["PUT"])
@swag_from({
    "tags": ["History"],
    "summary": "Update Chat History",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "messages": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "role": {"type": "string"},
                                "content": {"type": "string"}
                            }
                        }
                    }
                },
                "required": ["messages"]
            }
        }
    ],
    "responses": {
        "200": {
            "description": "Success",
            "schema": {
                "type": "object",
                "properties": {
                    "history_id": {"type": "integer"},
                    "message": {"type": "string"}
                }
            }
        },
        "400": {
            "description": "Bad Request",
            "schema": {
                "type": "object",
                "properties": {
                    "error": {"type": "string"}
                },
                "example": {
                    "error": "Invalid request body. 'messages' field is required."
                }
            }
        },
        "500": {
            "description": "Internal Server Error",
            "schema": {
                "type": "object",
                "properties": {
                    "error": {"type": "string"}
                },
                "example": {
                    "error": "Error updating chat history. "
                }
            }
        }
    }
})
def update_history(id):

    data = request.get_json()
    if not data or 'messages' not in data:
        return jsonify({"error": "Invalid request body. 'messages' field is required."}), 400
    
    messages = data['messages']

    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("BEGIN")
                if 'title' in data:
                    title = data['title']
                    cursor.execute("UPDATE history SET title = %s, updated_at=CURRENT_TIMESTAMP WHERE id = %s", (title, id))

                cursor.execute("DELETE FROM messages WHERE history_id = %s", (id,))
                
                message_values = [(msg['role'], msg['content'], id) for msg in messages]
                cursor.executemany(
                    "INSERT INTO messages (role, content, history_id) VALUES (%s, %s, %s)", 
                    message_values
                )
        return jsonify({"message": "Chat history updated successfully", "history_id": id}), 200
    except Exception as e:
        connection.rollback()
        return jsonify({"error": "Error updating chat history. " + str(e)}), 500


@app.route("/history/<int:id>", methods=["GET"])
def history(id):
    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT role, content FROM messages WHERE history_id = %s", (id,))
                messages = cursor.fetchall()
                messages_list = [{'role': row[0], 'content': row[1]} for row in messages]
                
                cursor.execute("SELECT title, created_at, updated_at, deleted_at FROM history WHERE id = %s", (id,))
                history_data = cursor.fetchone()
                
                return jsonify({
                    "title": history_data[0],
                    "messages": messages_list, 
                    "created_at": convert_to_local(history_data[1]),
                    "updated_at": convert_to_local(history_data[2]),
                    "deleted_at": convert_to_local(history_data[3]) if history_data[3] else None
                }), 200
    except Exception as e:
        return jsonify({"error": "Error retrieving messages. " + str(e)}), 500
    
@app.route("/delete-history/<int:id>", methods=["DELETE"])
def delete_history(id):
    
    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("UPDATE history SET deleted_at=CURRENT_TIMESTAMP WHERE id = %s", (id,))
                
                return jsonify({"message": "History is deleted successfully", "history_id": id}), 200
    except Exception as e:
        return jsonify({"error": "Error deleting history. " + str(e)}), 500

@app.route("/histories", methods=["GET"])
def histories():
    connection = db_conn()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute('''SELECT id, title, created_at, updated_at FROM history 
                               WHERE deleted_at IS NULL
                               ORDER BY updated_at DESC''')
                histories = cursor.fetchall()
                
                histories_list = [
                    {'id': row[0], 
                     'title': row[1],
                     'created_at': convert_to_local(row[2]),
                     'updated_at': convert_to_local(row[3])
                    } for row in histories]
                
                return jsonify({"histories": histories_list}), 200
    except Exception as e:
        return jsonify({"error": "Error retrieving histories. " + str(e)}), 500

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
                "content": "You are a helpful assistant that helps computer science students do their assignments."
            }
        ]
    messages.extend(data['messages'])
    
    client = OpenAI(api_key=api_key)
    completion = client.chat.completions.create(
        model="gpt-4",
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