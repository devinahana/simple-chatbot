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

3.  **Configure the token**
    You'll need to obtain an OpenAI API key and configure it in the **.env** for the app to function properly
    ```properties
    API_KEY=<<YOUR_OPENAI_API_KEY>>
    ```

4. **Run backend**
    ```bash
    flask run
    ```

5. **Run frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

[Checkout the demo video](https://drive.google.com/file/d/1BK4CQRK5rxXvGMft_E2AaStGnc9JWMp_/view?usp=sharing)

## References
https://github.com/Azure-Samples/azure-search-openai-demo
