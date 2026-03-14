const API = process.env.NEXT_PUBLIC_URL || 'http://localhost:3006/api';

function authHeaders() {
    return { Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}` };
}

// Load all active conversations for a flow
export async function fetchConversations(flowId) {
    const res = await fetch(`${API}/live/conversations?flowId=${flowId}`, {
        headers: authHeaders(),
    });
    return res.json();
}

// Load full message history for one conversation
export async function fetchMessages(conversationId) {
    const res = await fetch(`${API}/live/conversations/${conversationId}/messages`, {
        headers: authHeaders(),
    });
    return res.json();
}

// REST fallbacks if socket is not unavailable
export async function apiTakeover(conversationId) {
    const res = await fetch(`${API}/live/conversations/${conversationId}/takeover`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return res.json();
}

export async function apiHandback(conversationId) {
    const res = await fetch(`${API}/live/conversations/${conversationId}/handback`, {
        method: 'POST',
        headers: authHeaders(),
    });
    return res.json();
}

export async function apiSendMessage(conversationId, text) {
    const res = await fetch(`${API}/live/conversations/${conversationId}/message`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    return res.json();
}
