import { ConversationRequest } from "./models";
import { BASE_URL } from "./constant";
import { ChatMessage } from "./models";

export async function conversationApi(options: ConversationRequest, abortSignal: AbortSignal): Promise<Response> {
    const response = await fetch(BASE_URL + "/conversation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            messages: options.messages
        }),
        signal: abortSignal
    });

    return response;
}

export async function historyApi(id: string): Promise<any> {
    try {
        const response = await fetch(BASE_URL + "/history/" + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });

        const responseData = await response.json();

        if (response.ok || response.status === 404) {
            return responseData;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function deleteHistoryApi(id: string): Promise<any> {
    try {
        const response = await fetch(BASE_URL + "/delete-history/" + id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });

        const responseData = await response.json();

        if (response.ok) {
            return responseData;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function historyListApi(): Promise<any> {
    try {
        const response = await fetch(BASE_URL + "/histories", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        });

        const responseData = await response.json();

        if (response.ok) {
            return responseData.histories;
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function saveHistoryApi(options: { messages: ChatMessage[]; title: string }): Promise<any> {
    const response = await fetch(BASE_URL + "/create-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
            messages: options.messages,
            title: options.title
        })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'An error occurred');
    }

    const responseData = await response.json();
    return responseData;
}

export async function updateHistoryApi(id: string, options: { messages: ChatMessage[]; title?: string }): Promise<any> {
    const bodyData: any = {
        messages: options.messages,
    };

    // Include title only if it is provided
    if (options.title && options.title.trim() !== '') {
        bodyData.title = options.title;
    }

    const response = await fetch(BASE_URL + "/update-history/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'An error occurred');
    }

    const responseData = await response.json();
    return responseData;
}