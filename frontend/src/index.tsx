import React, { MutableRefObject, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { initializeIcons, MessageBarType } from "@fluentui/react";
import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Chat from "./pages/chat/Chat";
import { ChatMessage } from "./api";
import "./index.css";

initializeIcons();

export default function App() {
    const [title, setTitle] = useState<string>("");
    const [historyId, setHistoryId] = useState<string>("");
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<MessageBarType | undefined>(undefined);
    const lastQuestionRef: MutableRefObject<string> = useRef<string>("");
    const [answers, setAnswers] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const clearChat = () => {
        lastQuestionRef.current = "";
        setAnswers([]);
    };
    const resetChat = () => {
        setHistoryId('');
        setTitle('');
        setInputValue('');
        clearChat();
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout
                    title={title}
                    setTitle={setTitle}
                    historyId={historyId}
                    setHistoryId={setHistoryId}
                    alertMessage={alertMessage}
                    setAlertMessage={setAlertMessage}
                    alertType={alertType}
                    setAlertType={setAlertType}
                    resetChat={resetChat}
                />}>
                    <Route index element={<Chat
                        title={title}
                        setTitle={setTitle}
                        historyId={historyId}
                        setHistoryId={setHistoryId}
                        setAlertMessage={setAlertMessage}
                        setAlertType={setAlertType}
                        lastQuestionRef={lastQuestionRef}
                        answers={answers}
                        setAnswers={setAnswers}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        clearChat={clearChat}
                        resetChat={resetChat}
                    />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
