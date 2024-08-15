import { Outlet, Link } from "react-router-dom";
import styles from "./Layout.module.css";
import TelkomIcon from "../../assets/telkom-icon.png";
import { History32Regular } from "@fluentui/react-icons";
import { Dialog, Stack, Link as FluentLink, Text } from "@fluentui/react";
import { useState } from "react";
import { ChatHistory } from "../../api";
import { historyListApi } from "../../api";
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

const Layout = () => {
    const navigate = useNavigate();
    const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

    const handleClick = () => {
        window.location.href = '/';
      };

    const fetchHistoryList = async () => {
        setIsLoadingHistory(true)
        try {
            const data = await historyListApi();
            if (data) {
                setChatHistory(data);
            } else {
                setChatHistory([]);
            }
        } catch (error) {
            console.error("Failed to fetch data. " + error);
        } finally {
            setIsLoadingHistory(false)
        }
    };

    const handlePanelClick = () => {
        setIsSharePanelOpen(true);
        fetchHistoryList()
    };

    const handlePanelDismiss = () => {
        setIsSharePanelOpen(false);
    };

    const handleHistoryClick = (id: string) => {
        setIsSharePanelOpen(false)
        navigate(`${location.pathname}`, { replace: true });
        document.location.search += `&id=${id}`;
    };

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <div onClick={handleClick} className={styles.headerTitleContainer}>
                        <img
                            src={TelkomIcon}
                            className={styles.headerIcon}
                            aria-hidden="true"
                        />
                        <div className={styles.headerTitleContainer}>
                            <h1 className={styles.headerTitle}>Telkom Chatbot</h1>
                        </div>
                    </div>
                    <div className={styles.buttonsContainer}>
                        <div
                            className={styles.historyButtonContainer}
                            role="button"
                            tabIndex={0}
                            aria-label="Share"
                            onClick={handlePanelClick}
                            onKeyDown={e => e.key === "Enter" || e.key === " " ? handlePanelClick() : null}
                        >
                            <History32Regular className={styles.historyButton} />
                            <span className={styles.historyButtonText}>History</span>
                        </div>
                    </div>

                </div>
            </header>
            <Outlet />
            <Dialog
                onDismiss={handlePanelDismiss}
                hidden={!isSharePanelOpen}
                styles={{

                    main: [{
                        selectors: {
                            ['@media (min-width: 600px)']: {
                                maxWidth: '80%',
                                background: "#FFFFFF",
                                boxShadow: "0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "8px",
                                maxHeight: '300px',
                                minHeight: '100px',
                                overflow: 'auto'
                            }
                        }
                    }]
                }}
                dialogContentProps={{
                    title: "Chat History",
                    showCloseButton: true
                }}
            >
                {isLoadingHistory ? (
                    <div className={styles.loadingContainer}>
                        <ClipLoader color="#000000" size={20} />
                    </div>
                ) : (
                    <>
                        <Stack>
                            {chatHistory.length > 0 ? (
                                chatHistory.map(({ id, title }) => (
                                    <FluentLink
                                        key={id}
                                        onClick={() => handleHistoryClick(id)}
                                        style={{ display: 'block', padding: '8px', cursor: 'pointer' }}
                                    >
                                        <Text>{title}</Text>
                                    </FluentLink>
                                ))
                            ) : (
                                <Text>No chat history available</Text>
                            )}
                        </Stack>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default Layout;
