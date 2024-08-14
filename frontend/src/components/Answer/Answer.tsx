import { useMemo } from "react";
import { Stack, Text } from "@fluentui/react";

import styles from "./Answer.module.css";

import { AskResponse } from "../../api";
import { parseAnswer } from "./AnswerParser";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supersub from 'remark-supersub'

interface Props {
    answer: AskResponse;
}

export const Answer = ({
    answer
}: Props) => {

    const parsedAnswer = useMemo(() => parseAnswer(answer), [answer]);
    
    return (
        <>
            <Stack className={styles.answerContainer} tabIndex={0}>
                <Stack.Item grow>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, supersub]}
                        children={parsedAnswer.markdownFormatText}
                        className={styles.answerText}
                    />
                </Stack.Item>
                <Stack horizontal className={styles.answerFooter}>
                <Stack.Item className={styles.answerDisclaimerContainer}>
                    <span className={styles.answerDisclaimer}>AI-generated content may be incorrect</span>
                </Stack.Item>
                </Stack>
            </Stack>
        </>
    );
};
