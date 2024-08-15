export type AskResponse = {
    answer: string;
    error?: string;
};

export type ChatHistory = {
    id: string;
    title?: string;
};

export type ChatMessage = {
    role: string;
    content: string;
    end_turn?: boolean;
};

export enum ChatCompletionType {
    ChatCompletion = "chat.completion",
    ChatCompletionChunk = "chat.completion.chunk"
}

export type ChatResponseChoice = {
    messages: ChatMessage[];
}

export type ChatResponse = {
    id: string;
    model: string;
    created: number;
    object: ChatCompletionType;
    choices: ChatResponseChoice[];
    error?: any;
}

export type ConversationRequest = {
    messages: ChatMessage[];
};

export type UserInfo = {
    access_token: string;
    expires_on: string;
    id_token: string;
    provider_name: string;
    user_claims: any[];
    user_id: string;
};