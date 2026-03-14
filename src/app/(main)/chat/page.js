"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, RotateCcw, MessageSquare } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);

    // Auto-scroll to bottom when messages update
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }, 0);
            }
        }
    }, [messages, isLoading]);

    // Start preview session on mount
    useEffect(() => {
        const startSession = async () => {
            try {
                const res = await fetch('/api/preview/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flow_id: "550e8400-e29b-41d4-a716-446655440000" })
                });
                const data = await res.json();
                if (data.success) {
                    setSessionId(data.session_id);
                    const initialMessages = data.messages.map(msg => ({
                        role: msg.sender,
                        content: msg.message_text,
                        timestamp: new Date()
                    }));
                    setMessages(initialMessages);
                    toast.success("Chat preview session started");
                } else {
                    toast.error("Failed to start session: " + (data.error || "Unknown error"));
                }
            } catch (error) {
                console.error("Failed to start preview session:", error);
                toast.error("Failed to start preview session");
            }
        };

        startSession();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || !sessionId || isLoading) return;

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);

        try {
            const res = await fetch(`/api/preview/${sessionId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await res.json();

            if (data.success && data.messages) {
                const botMessages = data.messages.map(msg => ({
                    role: msg.sender,
                    content: msg.message_text,
                    timestamp: new Date()
                }));
                setMessages(prev => [...prev, ...botMessages]);
            } else {
                toast.error("Failed to send message: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setInput('');
    };

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] w-full">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Chat Preview</h2>
                        <p className="text-muted-foreground mt-1">
                            Test your chatbot workflows in real-time
                        </p>
                    </div>
                    {sessionId && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleClearChat}
                            className="gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Clear Chat
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Card */}
            <Card className="flex-1 flex flex-col overflow-hidden shadow-lg">
                {/* Header with Status */}
                <CardHeader className="border-b bg-gradient-to-r from-background to-muted/30 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-semibold">Assistant Bot</CardTitle>
                                <Badge variant={sessionId ? "default" : "secondary"} className="gap-1">
                                    <span className={`h-2 w-2 rounded-full ${sessionId ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                    {sessionId ? 'Online' : 'Connecting...'}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                        </div>
                    </div>
                </CardHeader>

                {/* Messages Area */}
                <CardContent className="flex-1 p-0 overflow-hidden bg-background">
                    {messages.length === 0 && !isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <div className="bg-muted rounded-full p-4 mb-4">
                                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">No messages yet</p>
                            <p className="text-sm text-muted-foreground">Start a conversation with the bot</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full" ref={scrollAreaRef}>
                            <div className="flex flex-col gap-4 p-6">
                                {messages.map((msg, i) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                            {!isUser && (
                                                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                                        AI
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`flex flex-col gap-1 max-w-lg ${isUser ? 'items-end' : 'items-start'}`}>
                                                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${
                                                    isUser
                                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                                        : 'bg-muted text-foreground rounded-bl-none border border-border'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <span className="text-xs text-muted-foreground px-2">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                            {isUser && (
                                                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                                        U
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    );
                                })}
                                {isLoading && (
                                    <div className="flex gap-3 justify-start">
                                        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                                                AI
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="bg-muted text-foreground rounded-2xl rounded-bl-none px-4 py-3 text-sm">
                                            <div className="flex gap-1 items-center">
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce animation-delay-200" />
                                                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce animation-delay-400" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>

                {/* Input Area */}
                <Separator />
                <CardFooter className="p-4 bg-muted/30 border-t">
                    <div className="flex w-full items-center gap-3">
                        <Input
                            placeholder={sessionId ? "Type a message..." : "Connecting to bot..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={!sessionId || isLoading}
                            className="flex-1 rounded-full"
                        />
                        <Button 
                            size="icon" 
                            onClick={handleSend} 
                            disabled={!sessionId || isLoading || !input.trim()}
                            className="rounded-full flex-shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
