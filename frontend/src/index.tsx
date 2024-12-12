import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import Chat from "./pages/chat/Chat";
import "./index.css";

initializeIcons();

export default function App() {
    const [title, setTitle] = useState<string>("");
    const [historyId, setHistoryId] = useState<string>("");

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout title={title} historyId={historyId} />}>
                    <Route index element={<Chat title={title} setTitle={setTitle} setHistoryId={setHistoryId} />} />
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
