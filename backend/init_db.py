import psycopg2

connection = psycopg2.connect(
        dbname="postgres",
        user="admin",
        password="12345678",
        host="34.45.220.223",
        port="15001"
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