## Getting Started

1. **Clone the repository**
    ```bash
    git clone https://github.com/devinahana/simple-chatbot.git
    ```
2. **Create a virtual environment for backend**<br>
    MAC:
    ```bash
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip3 install -r requirements.txt
    ```

    Window:
     ```cmd
    cd backend
    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Run backend**
    ```bash
    flask run
    ```

4. **Run frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## References
https://github.com/Azure-Samples/azure-search-openai-demo
