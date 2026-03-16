"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '@/services/socket';
import { fetchConversations, fetchMessages } from '@/services/liveChat';

export function useLiveChat(flowId) {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [mode, setMode] = useState('active');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [agentRequests, setAgentRequests] = useState([]);
    const socketRef = useRef(null);
    const activeConversationRef = useRef(null);

    // Keep ref in sync so socket callbacks always see the latest value
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    useEffect(() => {
        if (!flowId) return;

        const adminJwt = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

        // Step 1: Connect socket and subscribe
        const socket = connectSocket(adminJwt);
        socketRef.current = socket;

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // Subscribe to live event room
        socket.emit('admin:join_live', { flowId });

        // ─── Receive: Initialization ────
        socket.on('admin:joined', (data) => {
            if (data.activeConversations && Array.isArray(data.activeConversations)) {
                const formatted = data.activeConversations.map((c) => ({
                    conversation_id: c.conversation_id,
                    customer_name: c.user_name || c.user_phone,
                    customer_phone: c.user_phone,
                    last_message: c.last_message_at ? 'Active Session' : 'No messages',
                    last_message_at: c.last_message_at || c.started_at,
                    status: c.status,
                }));
                // Sort by latest message first
                formatted.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
                setConversations(formatted);

                // Initialize agent request queue from pending conversations
                const pending = data.activeConversations.filter(c => c.status === 'pending_agent');
                setAgentRequests(pending.map(c => ({
                    conversationId: c.conversation_id,
                    customerPhone: c.user_phone,
                    customerName: c.user_name || c.user_phone,
                    requestedAt: c.last_message_at || c.started_at,
                    previewMessages: [],
                    fallbackNodeId: null
                })));
            }
        });

        // ─── Receive: Live Messages ───
        socket.on('admin:incoming_message', (data) => {
            updateConversationLastMessage(data.conversationId, data.message);

            // Add to existing conversation or create new one in list
            setConversations((prev) => {
                const exists = prev.find((c) => c.conversation_id === data.conversationId);
                if (!exists) {
                    return [
                        {
                            conversation_id: data.conversationId,
                            customer_name: data.name || data.from,
                            customer_phone: data.from,
                            last_message: data.message,
                            last_message_at: data.timestamp || new Date().toISOString(),
                            status: 'active',
                        },
                        ...prev,
                    ];
                }
                return prev;
            });

            if (activeConversationRef.current?.conversation_id === data.conversationId) {
                appendMessage({
                    sender: 'user',
                    message_type: data.type || 'text',
                    message_text: data.message,
                    timestamp: data.timestamp,
                });
            }
        });

        // Bot sent a reply
        socket.on('admin:bot_response', (data) => {
            if (activeConversationRef.current?.conversation_id === data.conversationId) {
                appendMessage({
                    sender: 'bot',
                    message_type: data.message?.type || 'text',
                    message_text: data.message?.text,
                    message_data: data.message?.data,
                    timestamp: data.timestamp,
                });
            }
        });

        // ─── Receive: Takeover Events ───
        socket.on('admin:takeover_confirmed', (data) => {
            // Remove from queue if it was an agent request that we accepted
            setAgentRequests(prev => prev.filter(r => r.conversationId !== data.conversationId));

            setMode('takeover');
            if (data.chatHistory) {
                const sorted = [...data.chatHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setMessages(sorted);
            }
        });

        // Customer replied while admin is in control
        socket.on('admin:customer_reply', (data) => {
            appendMessage({
                sender: 'user',
                message_type: 'text',
                message_text: data.message,
                timestamp: data.timestamp,
            });
        });

        // Agent message was delivered
        socket.on('admin:message_sent', (data) => {
            appendMessage({
                sender: 'agent',
                message_type: 'text',
                message_text: data.text,
                timestamp: data.timestamp,
            });
        });

        // Handback confirmed
        socket.on('admin:handback_confirmed', ({ conversationId }) => {
            setMode('active');
            setConversations((prev) =>
                prev.map((c) =>
                    c.conversation_id === conversationId ? { ...c, status: 'active' } : c
                )
            );
        });

        // Another admin changed status
        socket.on('admin:conversation_status_changed', ({ conversationId, status }) => {
            setConversations((prev) =>
                prev.map((c) =>
                    c.conversation_id === conversationId ? { ...c, status } : c
                )
            );
        });

        // Conversation ended / completed
        socket.on('admin:conversation_completed', ({ conversationId, status }) => {
            // Remove from the conversations list
            setConversations((prev) => prev.filter((c) => c.conversation_id !== conversationId));
            if (activeConversationRef.current?.conversation_id === conversationId) {
                setActiveConversation(null);
                setMessages([]);
                setMode('active');
            }
        });

        // Error from server
        socket.on('admin:error', ({ message, conversationId }) => {
            console.error('[LiveChat Error]', message);
            if (message && message.includes('already been accepted')) {
                if (conversationId) {
                    setAgentRequests((prev) => prev.filter((r) => r.conversationId !== conversationId));
                }
            }
        });

        // ─── Receive: Agent Requests ───
        socket.on('admin:agent_request', (data) => {
            setAgentRequests((prev) => {
                if (prev.find((r) => r.conversationId === data.conversationId)) return prev;
                return [...prev, data];
            });
        });

        socket.on('admin:agent_request_accepted', ({ conversationId }) => {
            setAgentRequests((prev) => prev.filter((r) => r.conversationId !== conversationId));
        });

        socket.on('admin:agent_request_rejected', ({ conversationId }) => {
            setAgentRequests((prev) => prev.filter((r) => r.conversationId !== conversationId));
        });

        socket.on('admin:agent_request_timeout', ({ conversationId }) => {
            setAgentRequests((prev) => prev.filter((r) => r.conversationId !== conversationId));
        });

        return () => {
            socket.off('admin:joined');
            socket.off('admin:incoming_message');
            socket.off('admin:bot_response');
            socket.off('admin:takeover_confirmed');
            socket.off('admin:customer_reply');
            socket.off('admin:message_sent');
            socket.off('admin:handback_confirmed');
            socket.off('admin:conversation_status_changed');
            socket.off('admin:conversation_completed');
            socket.off('admin:error');
            socket.off('admin:agent_request');
            socket.off('admin:agent_request_accepted');
            socket.off('admin:agent_request_rejected');
            socket.off('admin:agent_request_timeout');
        };
    }, [flowId]);

    function appendMessage(msg) {
        setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
    }

    function updateConversationLastMessage(conversationId, text) {
        setConversations((prev) =>
            prev.map((c) =>
                c.conversation_id === conversationId
                    ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
                    : c
            )
        );
    }

    // Called when admin clicks on a conversation
    const selectConversation = useCallback(async (conversation) => {
        setActiveConversation(conversation);
        setIsLoadingHistory(true);
        try {
            const { messages: history } = await fetchMessages(conversation.conversation_id);
            const sorted = (history || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(sorted);
            setMode(conversation.status === 'human_takeover' ? 'takeover' : 'active');
        } catch (err) {
            console.error('[LiveChat] Failed to load history:', err);
            setMessages([]);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    const takeover = useCallback((conversationId) => {
        socketRef.current?.emit('admin:takeover', { conversationId });
    }, []);

    const acceptAgentRequest = useCallback((conversationId) => {
        socketRef.current?.emit('admin:accept_agent_request', { conversationId });
    }, []);

    const rejectAgentRequest = useCallback((conversationId) => {
        socketRef.current?.emit('admin:reject_agent_request', { conversationId });
        setAgentRequests(prev => prev.filter(r => r.conversationId !== conversationId));
    }, []);

    const sendMessage = useCallback((conversationId, text) => {
        socketRef.current?.emit('admin:send_message', { conversationId, text });
    }, []);

    const handback = useCallback((conversationId) => {
        socketRef.current?.emit('admin:handback', { conversationId });
    }, []);

    return {
        conversations,
        activeConversation,
        messages,
        mode,
        isConnected,
        isLoadingHistory,
        agentRequests,
        setAgentRequests,
        selectConversation,
        takeover,
        acceptAgentRequest,
        rejectAgentRequest,
        sendMessage,
        handback,
    };
}
