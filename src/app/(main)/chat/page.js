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
import { Send } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

export default function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef(null);

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
                        content: msg.message_text
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
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
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
                    content: msg.message_text
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

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Chat Preview</h2>
                <p className="text-muted-foreground">
                    Test your chatbot workflows in real-time.
                </p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="border-b bg-muted/20 py-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${sessionId ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                        {sessionId ? 'Bot Online' : 'Connecting...'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                        <div className="flex flex-col gap-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted max-w-[80%] rounded-lg px-4 py-2 text-sm">
                                        Typing...
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="border-t p-4 bg-muted/20">
                    <div className="flex w-full items-center gap-2">
                        <Input
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={!sessionId || isLoading}
                        />
                        <Button size="icon" onClick={handleSend} disabled={!sessionId || isLoading}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
