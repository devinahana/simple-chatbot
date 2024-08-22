import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

connection = psycopg2.connect(
        conn = psycopg2.connect(
        dbname=os.environ.get("DB_NAME"),
        user=os.environ.get("DB_USERNAME"),
        password=os.environ.get("DB_PASSWORD"),
        host=os.environ.get("DB_HOST"),
        port=os.environ.get("DB_PORT")
    )
    )
with connection:
    with connection.cursor() as cursor:
        cursor.execute('''CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT 'Title'
        );''')

        cursor.execute('''CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        role VARCHAR(15) NOT NULL,
        content TEXT NOT NULL, 
        history_id INT NOT NULL, 
        FOREIGN KEY (history_id) REFERENCES history (id)
        );''')