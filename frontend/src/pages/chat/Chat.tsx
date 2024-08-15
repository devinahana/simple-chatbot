import { useRef, useState, useEffect, createRef } from "react";
import { DefaultButton, Dialog, DialogFooter, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { BroomRegular, SquareRegular, ErrorCircleRegular, SaveRegular } from "@fluentui/react-icons";
import { ClipLoader } from 'react-spinners';
import styles from "./Chat.module.css";
import TelkomIcon from "../../assets/telkom-icon.png";

import {
    ChatMessage,
    ConversationRequest,
    conversationApi,
    ChatResponse,
    historyApi,
    saveChatApi
} from "../../api";
import { Answer } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";

const Chat = () => {
    const queryParameters = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const id = queryParameters?.get("id") as string;
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
    const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
    const [title, setTitle] = useState('');
    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showLoadingMessage, setShowLoadingMessage] = useState<boolean>(false);
    const [answers, setAnswers] = useState<ChatMessage[]>([]);
    const abortFuncs = useRef([] as AbortController[]);

    useEffect(() => {
        const initializeAnswers = async () => {
            try {
                const data = await historyApi(id);
                if (data) {
                    setAnswers(data);
                } else {
                    setAnswers([]);
                }
            } catch (error) {
                console.error("Failed to fetch data. " + error);
            } finally {
                setIsLoadingInitial(false)
            }
        };

        if (id) {
            initializeAnswers();
        } else {
            setIsLoadingInitial(false);
        }

    }, []);


    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        setIsLoading(true);
        setShowLoadingMessage(true);
        const abortController = new AbortController();
        abortFuncs.current.unshift(abortController);

        const userMessage: ChatMessage = {
            role: "user",
            content: question
        };

        const request: ConversationRequest = {
            messages: [...answers.filter((answer) => answer.role !== "error"), userMessage]
        };

        let result = {} as ChatResponse;
        try {
            const response = await conversationApi(request, abortController.signal);
            if (response?.body) {

                const reader = response.body.getReader();
                let runningText = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = new TextDecoder("utf-8").decode(value);
                    const objects = text.split("\n");
                    objects.forEach((obj) => {
                        try {
                            runningText += obj;
                            result = JSON.parse(runningText);
                            setShowLoadingMessage(false);
                            setAnswers([...answers, userMessage, ...result.choices[0].messages]);
                            runningText = "";
                        }
                        catch { }
                    });
                }
                setAnswers([...answers, userMessage, ...result.choices[0].messages]);
            }

        } catch (e) {
            if (!abortController.signal.aborted) {
                console.error(result);
                let errorMessage = "An error occurred. Please try again. If the problem persists, please contact the site administrator.";
                if (result.error?.message) {
                    errorMessage = result.error.message;
                }
                else if (typeof result.error === "string") {
                    errorMessage = result.error;
                }
                setAnswers([...answers, userMessage, {
                    role: "error",
                    content: errorMessage
                }]);
            } else {
                setAnswers([...answers, userMessage]);
            }
        } finally {
            setIsLoading(false);
            setShowLoadingMessage(false);
            abortFuncs.current = abortFuncs.current.filter(a => a !== abortController);
        }

        return abortController.abort();
    };

    const saveChat = async (title: string) => {
        try {
            const response = await saveChatApi(
                {
                    messages: answers, // Use the current state as the messages
                    title: title
                }
            );
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        setAnswers([]);
    };

    const stopGenerating = () => {
        abortFuncs.current.forEach(a => a.abort());
        setShowLoadingMessage(false);
        setIsLoading(false);
    }

    const handlePanelClick = () => {
        setIsSharePanelOpen(true);
    };

    const textFieldRef = createRef<HTMLInputElement>();
    const handleSaveClick = () => {
        const title = textFieldRef.current?.value || ''; 
        saveChat(title);
        handlePanelDismiss();
      };
    

    const handlePanelDismiss = () => {
        setIsSharePanelOpen(false);
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [showLoadingMessage]);

    return (
        <div className={styles.container} role="main" key={id}>
            <Stack horizontal className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {isLoadingInitial ? (
                        <div className={styles.loadingContainer}>
                            <ClipLoader color="#000000" size={50} /> {/* You can customize the color and size */}
                            <p className={styles.loadingText}>Loading...</p> {/* Optional text */}
                        </div>
                    ) : (
                        <>
                            {!lastQuestionRef.current && answers.length === 0 ? (
                                <Stack className={styles.chatEmptyState}>
                                    <img
                                        src={TelkomIcon}
                                        className={styles.chatIcon}
                                        aria-hidden="true"
                                    />
                                    <h1 className={styles.chatEmptyStateTitle}>Start chatting</h1>
                                    <h2 className={styles.chatEmptyStateSubtitle}>This chatbot is configured to be your virtual assistant</h2>
                                </Stack>
                            ) : (
                                <div className={styles.chatMessageStream} style={{ marginBottom: isLoading ? "40px" : "0px" }} role="log">
                                    {answers.map((answer, index) => (
                                        <div key={index}>
                                            {answer.role === "user" ? (
                                                <div className={styles.chatMessageUser} tabIndex={0}>
                                                    <div className={styles.chatMessageUserMessage}>{answer.content}</div>
                                                </div>
                                            ) : (
                                                answer.role === "assistant" ? <div className={styles.chatMessageGpt}>
                                                    <Answer
                                                        answer={{
                                                            answer: answer.content
                                                        }}
                                                    />
                                                </div> : answer.role === "error" ? <div className={styles.chatMessageError}>
                                                    <Stack horizontal className={styles.chatMessageErrorContent}>
                                                        <ErrorCircleRegular className={styles.errorIcon} style={{ color: "rgba(182, 52, 67, 1)" }} />
                                                        <span>Error</span>
                                                    </Stack>
                                                    <span className={styles.chatMessageErrorContent}>{answer.content}</span>
                                                </div> : null
                                            )}
                                        </div>
                                    ))}
                                    {showLoadingMessage && (
                                        <>
                                            <div className={styles.chatMessageUser}>
                                                <div className={styles.chatMessageUserMessage}>{lastQuestionRef.current}</div>
                                            </div>
                                            <div className={styles.chatMessageGpt}>
                                                <Answer
                                                    answer={{
                                                        answer: "Generating answer..."
                                                    }}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div ref={chatMessageStreamEnd} />
                                </div>
                            )}

                            <Stack horizontal className={styles.chatInput}>
                                {isLoading && (
                                    <Stack
                                        horizontal
                                        className={styles.stopGeneratingContainer}
                                        role="button"
                                        aria-label="Stop generating"
                                        tabIndex={0}
                                        onClick={stopGenerating}
                                        onKeyDown={e => e.key === "Enter" || e.key === " " ? stopGenerating() : null}
                                    >
                                        <SquareRegular className={styles.stopGeneratingIcon} aria-hidden="true" />
                                        <span className={styles.stopGeneratingText} aria-hidden="true">Stop generating</span>
                                    </Stack>
                                )}

                                <Stack horizontal className={styles.saveAndClearContainer}>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={handlePanelClick}
                                        aria-label="Save session"
                                    >
                                        <SaveRegular
                                            className={styles.saveIcon}
                                            style={{
                                                background: isLoading || answers.length === 0 ? "#BDBDBD" : "radial-gradient(109.81% 107.82% at 100.1% 90.19%, #D6484C 33.63%, #EED7D8 100%)",
                                                cursor: isLoading || answers.length === 0 ? "" : "pointer"
                                            }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={clearChat}
                                        aria-label="Clear session"
                                    >
                                        <BroomRegular
                                            className={styles.clearChatBroom}
                                            style={{
                                                background: isLoading || answers.length === 0 ? "#BDBDBD" : "radial-gradient(109.81% 107.82% at 100.1% 90.19%, #D6484C 33.63%, #EED7D8 100%)",
                                                cursor: isLoading || answers.length === 0 ? "" : "pointer"
                                            }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </Stack>
                                <QuestionInput
                                    clearOnSend
                                    placeholder="Type a new question..."
                                    disabled={isLoading}
                                    onSend={question => makeApiRequest(question)}
                                />
                            </Stack>

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
                                    title: "Save Chat",
                                    showCloseButton: true
                                }}
                            >
                                <TextField
                                    componentRef={textFieldRef}
                                    placeholder="Enter title here"
                                    styles={{ root: { marginBottom: '24px' } }}
                                />
                                <DialogFooter>
                                    <DefaultButton onClick={handlePanelDismiss} text="Cancel" />
                                    <PrimaryButton onClick={handleSaveClick} text="Save" />
                                </DialogFooter>
                            </Dialog>
                        </>
                    )}

                </div>
            </Stack>

        </div>
    );
};

export default Chat;
