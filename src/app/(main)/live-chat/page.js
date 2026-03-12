"use client"

import { useState, useRef, useEffect } from "react"
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
import {
    Send,
    PhoneForwarded,
    PhoneOff,
    Search,
    Radio,
    MessageSquare,
    User,
    Bot,
    Headset,
    FileText,
    ImageIcon,
    Loader2,
} from "lucide-react"
import { useLiveChat } from "@/hooks/useLiveChat"
import { renderMessage } from "@/lib/renderMessage"

export default function LiveChatPage() {
    const [selectedFlowId, setSelectedFlowId] = useState(null)
    const [publishedFlows, setPublishedFlows] = useState([])
    const [isLoadingFlows, setIsLoadingFlows] = useState(true)

    const {
        conversations,
        activeConversation,
        messages,
        mode,
        isConnected,
        isLoadingHistory,
        selectConversation,
        takeover,
        sendMessage,
        handback,
    } = useLiveChat(selectedFlowId)

    const [agentInput, setAgentInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const messagesEndRef = useRef(null)
    const scrollAreaRef = useRef(null)

    // Fetch published flows on mount
    useEffect(() => {
        const fetchFlows = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    const published = (data.flows || []).filter(f => f.published_at !== null);
                    setPublishedFlows(published);
                }
            } catch (error) {
                console.error("Failed to load flows for live chat:", error);
            } finally {
                setIsLoadingFlows(false);
            }
        };
        fetchFlows();
    }, []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]"
            )
            if (viewport) {
                setTimeout(() => {
                    viewport.scrollTop = viewport.scrollHeight
                }, 50)
            }
        }
    }, [messages])

    const handleSendAgentMessage = () => {
        if (!agentInput.trim() || !activeConversation) return
        sendMessage(activeConversation.conversation_id, agentInput)
        setAgentInput("")
    }

    const handleTakeover = () => {
        if (!activeConversation) return
        takeover(activeConversation.conversation_id)
    }

    const handleHandback = () => {
        if (!activeConversation) return
        handback(activeConversation.conversation_id)
    }

    const filteredConversations = conversations.filter((c) => {
        if (!searchQuery) return true
        const name = (c.customer_name || c.customer_phone || "").toLowerCase()
        const msg = (c.last_message || "").toLowerCase()
        const q = searchQuery.toLowerCase()
        return name.includes(q) || msg.includes(q)
    })

    const formatRelativeTime = (dateStr) => {
        if (!dateStr) return ""
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHrs = Math.floor(diffMins / 60)
        if (diffHrs < 24) return `${diffHrs}h ago`
        const diffDays = Math.floor(diffHrs / 24)
        return `${diffDays}d ago`
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return ""
        const date = new Date(dateStr)
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    // ─── Render a single message bubble ───
    const MessageBubble = ({ msg }) => {
        const rendered = renderMessage(msg)
        if (!rendered) return null

        const isLeft = rendered.align === "left"

        const bgClasses = {
            user: "bg-muted text-foreground border border-border",
            bot: "bg-blue-500/10 text-foreground border border-blue-500/20",
            agent: "bg-emerald-500/10 text-foreground border border-emerald-500/20",
        }

        return (
            <div className={`flex gap-3 ${isLeft ? "justify-start" : "justify-end"}`}>
                {isLeft && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={`flex flex-col gap-1 max-w-md ${isLeft ? "items-start" : "items-end"}`}
                >
                    {rendered.label && (
                        <span className="text-xs text-muted-foreground font-medium px-1">
                            {rendered.label}
                        </span>
                    )}
                    <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${isLeft ? "rounded-bl-none" : "rounded-br-none"
                            } ${bgClasses[rendered.bgColor] || bgClasses.user}`}
                    >
                        <MessageContent content={rendered.content} />
                    </div>
                    <span className="text-xs text-muted-foreground px-2">
                        {formatTime(msg.timestamp || msg.created_at)}
                    </span>
                </div>
                {!isLeft && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback
                            className={`text-xs font-bold ${rendered.bgColor === "agent"
                                ? "bg-emerald-500/20 text-emerald-700"
                                : "bg-blue-500/20 text-blue-700"
                                }`}
                        >
                            {rendered.bgColor === "agent" ? (
                                <Headset className="h-4 w-4" />
                            ) : (
                                <Bot className="h-4 w-4" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>
        )
    }

    // ─── Render message content based on kind ───
    const MessageContent = ({ content }) => {
        if (!content) return null

        switch (content.kind) {
            case "text":
                return <span>{content.text}</span>
            case "buttons":
                return (
                    <div className="space-y-2">
                        <span>{content.text}</span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {content.buttons?.map((btn, i) => (
                                <Badge
                                    key={i}
                                    variant="outline"
                                    className="px-3 py-1 text-xs cursor-default"
                                >
                                    {btn.title || btn.text || btn}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )
            case "list":
                return (
                    <div className="space-y-2">
                        <span>{content.text}</span>
                        <div className="mt-2 space-y-1">
                            {content.sections?.map((section, i) =>
                                section.rows?.map((row, j) => (
                                    <div
                                        key={`${i}-${j}`}
                                        className="bg-background/50 rounded-lg px-3 py-1.5 text-xs border"
                                    >
                                        {row.title}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
            case "image":
                return (
                    <div className="space-y-1">
                        <img
                            src={content.url}
                            alt={content.caption || "Image"}
                            className="rounded-lg max-w-full"
                        />
                        {content.caption && (
                            <span className="text-xs text-muted-foreground">
                                {content.caption}
                            </span>
                        )}
                    </div>
                )
            case "document":
                return (
                    <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                    >
                        <FileText className="h-4 w-4" />
                        <span>{content.filename || "Document"}</span>
                    </a>
                )
            default:
                return <span>{content.text}</span>
        }
    }

    if (isLoadingFlows) {
        return (
            <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading flows...</p>
            </div>
        )
    }

    if (!selectedFlowId) {
        return (
            <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] w-full">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Select a Flow to Monitor</h2>
                    <p className="text-muted-foreground">
                        Choose a published workflow to view its active live chat sessions
                    </p>
                </div>

                {publishedFlows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border rounded-xl border-dashed">
                        <Radio className="h-10 w-10 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No flows available</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            There are currently no workflows. Go to the Workflows page to create and publish one.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-2">
                        {publishedFlows.map((flow) => (
                            <Card
                                key={flow.flow_id}
                                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                                onClick={() => setSelectedFlowId(flow.flow_id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                                            {flow.flow_name}
                                        </CardTitle>
                                        <Badge variant={flow.is_published ? "default" : "secondary"} className="shrink-0">
                                            {flow.is_published ? "Published" : "Draft"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {flow.flow_description || "No description provided."}
                                    </p>
                                    <div className="flex items-center gap-2 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Monitor Conversations</span>
                                        <PhoneForwarded className="h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Live Chat</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-muted-foreground hover:text-primary"
                            onClick={() => setSelectedFlowId(null)}
                        >
                            ← Back to flows
                        </Button>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-muted-foreground">
                            Monitoring: <strong className="text-foreground">{publishedFlows.find(f => f.flow_id === selectedFlowId)?.flow_name || 'Selected Flow'}</strong>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={isConnected ? "default" : "secondary"}
                        className="gap-1.5 px-3 py-1"
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${isConnected
                                ? "bg-green-500 animate-pulse"
                                : "bg-yellow-500"
                                }`}
                        />
                        {isConnected ? "Connected" : "Connecting..."}
                    </Badge>
                </div>
            </div>

            {/* Main Content: Two-Panel Layout */}
            <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                {/* ─── Left Panel: Conversation List ──── */}
                <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden shadow-lg">
                    <CardHeader className="border-b py-3 px-4 space-y-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Radio className="h-4 w-4 text-primary" />
                            Conversations
                            {conversations.length > 0 && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    {conversations.length}
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-8 text-xs rounded-full"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="bg-muted rounded-full p-3 mb-3">
                                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    No conversations yet
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Conversations will appear here when customers start chatting
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="flex flex-col">
                                    {filteredConversations.map((conv) => {
                                        const isActive =
                                            activeConversation?.conversation_id ===
                                            conv.conversation_id
                                        const isTakeover =
                                            conv.status === "human_takeover"

                                        return (
                                            <button
                                                key={conv.conversation_id}
                                                onClick={() => selectConversation(conv)}
                                                className={`flex items-start gap-3 p-3 text-left transition-colors border-b border-border/50 hover:bg-muted/50 ${isActive
                                                    ? "bg-primary/5 border-l-2 border-l-primary"
                                                    : ""
                                                    }`}
                                            >
                                                <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
                                                    <AvatarFallback
                                                        className={`text-xs font-bold ${isTakeover
                                                            ? "bg-amber-500/20 text-amber-700"
                                                            : "bg-primary/10 text-primary"
                                                            }`}
                                                    >
                                                        {(
                                                            conv.customer_name ||
                                                            conv.customer_phone ||
                                                            "?"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-medium truncate">
                                                            {conv.customer_name ||
                                                                conv.customer_phone ||
                                                                "Unknown"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex-shrink-0">
                                                            {formatRelativeTime(
                                                                conv.last_message_at
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {conv.last_message || "No messages"}
                                                    </p>
                                                    <Badge
                                                        variant={
                                                            isTakeover
                                                                ? "outline"
                                                                : "secondary"
                                                        }
                                                        className={`mt-1.5 text-[10px] px-1.5 py-0 ${isTakeover
                                                            ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                                                            : "text-green-600 bg-green-500/10"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full mr-1 ${isTakeover
                                                                ? "bg-amber-500"
                                                                : "bg-green-500"
                                                                }`}
                                                        />
                                                        {isTakeover ? "Agent" : "Bot Active"}
                                                    </Badge>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>

                {/* ─── Right Panel: Chat View ─── */}
                <Card className="flex-1 flex flex-col overflow-hidden shadow-lg">
                    {!activeConversation ? (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="bg-muted rounded-full p-5 mb-4">
                                <MessageSquare className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                Select a Conversation
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Choose a conversation from the list to view the chat history
                                and interact with customers
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/30 py-3 px-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                {(
                                                    activeConversation.customer_name ||
                                                    activeConversation.customer_phone ||
                                                    "?"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                {activeConversation.customer_name ||
                                                    activeConversation.customer_phone ||
                                                    "Unknown Customer"}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {activeConversation.customer_phone || ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                mode === "takeover"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className={`gap-1.5 ${mode === "takeover"
                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                : ""
                                                }`}
                                        >
                                            {mode === "takeover" ? (
                                                <>
                                                    <Headset className="h-3 w-3" />
                                                    Agent Mode
                                                </>
                                            ) : (
                                                <>
                                                    <Bot className="h-3 w-3" />
                                                    Bot Active
                                                </>
                                            )}
                                        </Badge>
                                        {mode === "active" ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleTakeover}
                                                className="gap-1.5 text-amber-600 border-amber-500/50 hover:bg-amber-500/10"
                                            >
                                                <PhoneForwarded className="h-3.5 w-3.5" />
                                                Take Over
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleHandback}
                                                className="gap-1.5 text-green-600 border-green-500/50 hover:bg-green-500/10"
                                            >
                                                <PhoneOff className="h-3.5 w-3.5" />
                                                Hand Back
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Messages Area */}
                            <CardContent className="flex-1 p-0 overflow-hidden bg-background">
                                {isLoadingHistory ? (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Loading messages...
                                        </p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                        <div className="bg-muted rounded-full p-4 mb-3">
                                            <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            No messages in this conversation
                                        </p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                                        <div className="flex flex-col gap-4 p-6">
                                            {messages.map((msg, i) => (
                                                <MessageBubble
                                                    key={msg.id || i}
                                                    msg={msg}
                                                />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>

                            {/* Agent Input (only in takeover mode) */}
                            {mode === "takeover" && (
                                <>
                                    <Separator />
                                    <CardFooter className="p-4 bg-amber-500/5 border-t border-amber-500/20">
                                        <div className="flex w-full items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium flex-shrink-0">
                                                <Headset className="h-3.5 w-3.5" />
                                                Agent
                                            </div>
                                            <Input
                                                placeholder="Type a message as agent..."
                                                value={agentInput}
                                                onChange={(e) =>
                                                    setAgentInput(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        !e.shiftKey
                                                    ) {
                                                        e.preventDefault()
                                                        handleSendAgentMessage()
                                                    }
                                                }}
                                                className="flex-1 rounded-full"
                                            />
                                            <Button
                                                size="icon"
                                                onClick={handleSendAgentMessage}
                                                disabled={!agentInput.trim()}
                                                className="rounded-full flex-shrink-0 bg-amber-500 hover:bg-amber-600"
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </>
                            )}
                        </>
                    )}
                </Card>
            </div>
        </div>
    )
}
