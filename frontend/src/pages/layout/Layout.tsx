import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import BotIcon from "../../assets/bot-icon.png";
import { History32Regular } from "@fluentui/react-icons";
import { Dialog, Stack, Link as FluentLink, Text, IconButton, DefaultButton, PrimaryButton, DialogFooter, MessageBar, MessageBarType } from "@fluentui/react";
import { useState } from "react";
import { ChatHistory } from "../../api";
import { historyListApi, deleteHistoryApi } from "../../api";
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { format } from 'date-fns';

interface LayoutProps {
    title: string;
    historyId: string;
}

const Layout: React.FC<LayoutProps> = ({ title, historyId }) => {
    const navigate = useNavigate();
    const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [historyToDelete, setHistoryToDelete] = useState<ChatHistory | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<MessageBarType | undefined>(undefined);


    const navigateToHome = () => {
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
        cancelDelete()
    };

    const handleDeleteHistory = (history: ChatHistory) => {
        setHistoryToDelete(history);
        setIsDeleting(true);
    };

    const confirmDelete = async () => {
        if (historyToDelete) {
            try {
                await deleteHistoryApi(historyToDelete.id); // Ensure this returns a promise
                setAlertMessage(`Chat history "${historyToDelete?.title}" deleted successfully.`);
                setAlertType(MessageBarType.success);

                if (historyId == historyToDelete.id) {
                    setTimeout(() => {
                        navigateToHome();
                    }, 2500);
                }
            } catch (error) {
                setAlertMessage(`Failed to delete chat history "${historyToDelete?.title}". Please try again.`);
                setAlertType(MessageBarType.error);
            } finally {
                setIsDeleting(false);
                setIsSharePanelOpen(false);
            }
        }
    };

    const cancelDelete = () => {
        setIsDeleting(false);
        setHistoryToDelete(null);
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
                    <div onClick={navigateToHome} className={styles.headerTitleContainer}>
                        <img
                            src={BotIcon}
                            className={styles.headerIcon}
                            aria-hidden="true"
                        />
                        <div className={styles.headerTitleContainer}>
                            <h1 className={styles.headerTitle}>Chatbot</h1>
                        </div>
                    </div>
                    <div className={styles.middleTextContainer}>
                        <span className={styles.middleText}>{title}</span>
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
                        {isDeleting ? (
                            <Stack tokens={{ childrenGap: 10 }}>
                                <Text
                                    styles={{ root: { marginBottom: '24px' } }}
                                >Are you sure you want to delete the chat history "{historyToDelete?.title}"?</Text>
                                <DialogFooter>
                                    <DefaultButton onClick={cancelDelete} text="Cancel" />
                                    <PrimaryButton onClick={confirmDelete} text="Delete" styles={{
                                        root: {
                                            backgroundColor: 'red',
                                            borderColor: 'red',
                                        },
                                        rootHovered: {
                                            backgroundColor: 'darkred', // darker shade for hover
                                            borderColor: 'darkred',    // optional: darker border on hover
                                        },
                                    }} />
                                </DialogFooter>
                            </Stack>
                        ) : (
                            <Stack>
                                {chatHistory.length > 0 ? (
                                    chatHistory.map((history) => (
                                        <Stack
                                            key={history.id}
                                            horizontal
                                            verticalAlign="center"
                                            tokens={{ childrenGap: 10 }}
                                            style={{ marginBottom: '12px', display: 'flex', alignItems: 'stretch' }}
                                        >
                                            <FluentLink
                                                onClick={() => handleHistoryClick(history.id)}
                                                style={{ display: 'block', padding: '8px', cursor: 'pointer', flex: 1 }}
                                            >
                                                <Stack tokens={{ childrenGap: 4 }}>
                                                    <Text>{history.title}</Text>
                                                    {history.updated_at && (
                                                        <Text variant="xSmall" style={{ color: '#888' }}>
                                                            {format(new Date(history.updated_at), 'MM/dd/yyyy, hh:mm a')}
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </FluentLink>
                                            <IconButton
                                                iconProps={{ iconName: 'Delete' }}
                                                title="Delete"
                                                onClick={() => handleDeleteHistory(history)}
                                                styles={{
                                                    root: {
                                                        alignSelf: 'center',
                                                        padding: '8px',
                                                    },
                                                    icon: {
                                                        color: '#888',
                                                    }
                                                }}
                                            />
                                        </Stack>
                                    ))
                                ) : (
                                    <Text>No chat history available</Text>
                                )}
                            </Stack>
                        )}
                    </>
                )}
            </Dialog>

            {alertMessage && (
                <div
                    style={{
                        position: "fixed",
                        top: "32px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 1000,
                        width: "90%",
                        maxWidth: "400px",
                    }}
                >
                    <MessageBar
                        messageBarType={alertType}
                        isMultiline={true}
                        onDismiss={() => setAlertMessage(null)}
                        dismissButtonAriaLabel="Close"
                        styles={{
                            root: {
                                padding: "12px", 
                                border: "1px solid lightgray",
                                borderRadius: "8px"
                            },
                            text: {
                                fontSize: "14px", 
                            },
                        }}
                    >
                        {alertMessage}
                    </MessageBar>
                </div>
            )}

        </div>
    );
};

export default Layout;
