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
import { AgentRequestCard } from "@/components/AgentRequestCard"

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
        agentRequests,
        setAgentRequests,
        selectConversation,
        takeover,
        acceptAgentRequest,
        rejectAgentRequest,
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
                    // const published = (data.flows || []).filter(f => f.published_at !== null);
                    const published = (data.flows || []).filter(f => f.is_published);
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

    // Resolve button/list IDs to their titles
    const resolveButtonId = (userMsg, idx) => {
        const text = userMsg.message_text?.trim()
        if (!text || userMsg.sender !== 'user') return text
        // Look backwards through earlier messages for an interactive message containing this ID
        for (let i = idx - 1; i >= 0; i--) {
            const prev = messages[i]
            if (prev.message_type !== 'interactive' || !prev.message_data) continue
            const data = typeof prev.message_data === 'string' ? JSON.parse(prev.message_data) : prev.message_data
            // Check buttons
            if (data.type === 'button' && data.buttons) {
                const match = data.buttons.find(b => b.id === text || b.value === text)
                if (match) return match.title || match.text || text
            }
            // Check list sections
            if (data.type === 'list' && data.sections) {
                for (const section of data.sections) {
                    const match = (section.rows || []).find(r => r.id === text || r.value === text)
                    if (match) return match.title || match.text || text
                }
            }
        }
        return text
    }

    // ─── Render a single message bubble ───
    const MessageBubble = ({ msg, index }) => {
        const resolvedMsg = msg.sender === 'user'
            ? { ...msg, message_text: resolveButtonId(msg, index) }
            : msg
        const rendered = renderMessage(resolvedMsg)
        if (!rendered) return null

        const isLeft = rendered.align === "left"

        const bgClasses = {
            user: "bg-primary/15 text-foreground border border-primary/30 shadow-sm",
            bot: "bg-blue-500/12 text-foreground border border-blue-500/25 shadow-sm",
            agent: "bg-emerald-500/12 text-foreground border border-emerald-500/25 shadow-sm",
        }

        return (
            <div className={`flex gap-2.5 ${isLeft ? "justify-start" : "justify-end"}`}>
                {isLeft && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold text-center">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                )}
                <div
                    className={`flex flex-col gap-1.5 max-w-md ${isLeft ? "items-start" : "items-end"}`}
                >
                    {rendered.label && (
                        <span className="text-xs text-muted-foreground font-semibold px-1">
                            {rendered.label}
                        </span>
                    )}
                    <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words transition-all ${isLeft ? "rounded-bl-sm" : "rounded-br-sm"
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
            <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] w-full items-center justify-center bg-gradient-to-br from-background to-muted/30">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <div className="text-center">
                        <p className="text-foreground font-semibold">Loading flows...</p>
                        <p className="text-muted-foreground text-sm mt-1">Please wait while we fetch your workflows</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!selectedFlowId) {
        return (
            <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] w-full bg-gradient-to-br from-background via-background to-muted/20 mt-4">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight text-balance">Select a Flow to Monitor</h2>
                    <p className="text-muted-foreground text-lg">
                        Choose a published workflow to view its active live chat sessions and manage conversations in real-time.
                    </p>
                </div>

                {publishedFlows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 mt-8 text-center border border-dashed rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="bg-primary/10 rounded-full p-4 mb-4">
                            <Radio className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No flows available</h3>
                        <p className="text-muted-foreground max-w-sm">
                            There are currently no published workflows. Create and publish a flow to start monitoring conversations.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {publishedFlows.map((flow) => (
                            <Card
                                key={flow.flow_id}
                                className="cursor-pointer border-border hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group overflow-hidden"
                                onClick={() => setSelectedFlowId(flow.flow_id)}
                            >
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <div className="flex justify-between items-start gap-3">
                                        <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                            {flow.flow_name}
                                        </CardTitle>
                                        <Badge variant={flow.is_published ? "default" : "secondary"} className="shrink-0 ml-2">
                                            {flow.is_published ? "Published" : "Draft"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {flow.flow_description || "No description provided."}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {flow.total_conversations} conversation{flow.total_conversations !== 1 ? 's' : ''}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>View</span>
                                            <PhoneForwarded className="h-3 w-3" />
                                        </div>
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
        <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] w-full bg-gradient-to-br from-background via-background to-muted/10">
            {/* Header */}
            <div className="flex items-center justify-between px-1 py-2">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-balance">Live Chat Monitoring</h2>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Button
                            variant="outline"
                            className="h-8 text-sm px-3 hover:bg-muted"
                            onClick={() => setSelectedFlowId(null)}
                        >
                            <span className="mr-1">←</span> Back to flows
                        </Button>
                        <span className="text-muted-foreground text-sm">•</span>
                        <p className="text-sm text-muted-foreground">
                            Monitoring: <strong className="text-foreground font-semibold">{publishedFlows.find(f => f.flow_id === selectedFlowId)?.flow_name || 'Selected Flow'}</strong>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant={isConnected ? "ghost" : "secondary"}
                        className="gap-2 px-3 py-1.5 text-sm font-medium"
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${isConnected
                                ? "bg-green-500 animate-pulse"
                                : "bg-amber-500"
                                }`}
                        />
                        {isConnected ? "Connected" : "Connecting..."}
                    </Badge>
                </div>
            </div>

            {/* Main Content: Two-Panel Layout */}
            <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
                {/* ─── Left Panel: Conversation List ──── */}
                <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden shadow-md border border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-border/50 py-4 px-4 space-y-3 bg-gradient-to-r from-background to-muted/5">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <Radio className="h-4 w-4 text-primary" />
                            Active Conversations
                            {conversations.length > 0 && (
                                <Badge className="ml-auto text-xs font-medium bg-primary/20 text-primary border-0">
                                    {conversations.length}
                                </Badge>
                            )}
                        </CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or message..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9 text-sm rounded-lg bg-muted/50 border-muted-foreground/20 focus:bg-background"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden bg-muted/20">
                        {filteredConversations.length === 0 && agentRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="bg-primary/10 rounded-full p-4 mb-3">
                                    <MessageSquare className="h-6 w-6 text-primary/60" />
                                </div>
                                <p className="text-sm text-foreground font-medium">
                                    No active conversations
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                    Conversations will appear here when customers engage with your flow
                                </p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full">
                                <div className="flex flex-col">
                                    {/* Agent Requests Queue */}
                                    {agentRequests.length > 0 && (
                                        <div className="p-3 border-b border-border/50 bg-muted/10">
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                Agent Requests ({agentRequests.length})
                                            </h4>
                                            <div className="flex flex-col gap-2">
                                                {agentRequests.map(req => (
                                                    <AgentRequestCard
                                                        key={req.conversationId}
                                                        request={req}
                                                        onAccept={acceptAgentRequest}
                                                        onReject={rejectAgentRequest}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Normal Conversations List */}
                                    {filteredConversations.map((conv) => {
                                        const isActive =
                                            activeConversation?.conversation_id ===
                                            conv.conversation_id
                                        const isTakeover = conv.status === "human_takeover"
                                        const isPending = conv.status === "pending_agent"
                                        const isCompleted = conv.status === "completed"

                                        let statusConfig = {
                                            variant: "secondary",
                                            bgColor: "bg-green-500",
                                            bgClass: "bg-green-500/10",
                                            textClass: "text-green-600",
                                            borderClass: "border-0",
                                            label: "Bot Active",
                                        }

                                        if (isTakeover) {
                                            statusConfig = {
                                                variant: "outline",
                                                bgColor: "bg-amber-500",
                                                bgClass: "bg-amber-500/10",
                                                textClass: "text-amber-600",
                                                borderClass: "border-amber-500/50",
                                                label: "Agent",
                                            }
                                        } else if (isPending) {
                                            statusConfig = {
                                                variant: "outline",
                                                bgColor: "bg-red-500",
                                                bgClass: "bg-red-500/10",
                                                textClass: "text-red-500",
                                                borderClass: "border-red-500/50",
                                                label: "Waiting",
                                            }
                                        } else if (isCompleted) {
                                            statusConfig = {
                                                variant: "secondary",
                                                bgColor: "bg-gray-500",
                                                bgClass: "bg-gray-500/10",
                                                textClass: "text-gray-500",
                                                borderClass: "border-0",
                                                label: "Completed",
                                            }
                                        }

                                        return (
                                            <button
                                                key={conv.conversation_id}
                                                onClick={() => selectConversation(conv)}
                                                className={`flex items-start gap-3 p-3 text-left transition-all border-b border-border/30 ${isActive
                                                    ? "bg-primary/8 border-l-3 border-l-primary shadow-sm"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                            >
                                                <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
                                                    <AvatarFallback
                                                        className={`text-xs font-bold ${isTakeover ? "bg-amber-500/20 text-amber-700" : isPending ? "bg-red-500/20 text-red-700" : "bg-primary/10 text-primary"}`}
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
                                                        variant={statusConfig.variant}
                                                        className={`mt-1.5 text-[10px] px-1.5 py-0 ${statusConfig.borderClass} ${statusConfig.textClass} ${statusConfig.bgClass}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full mr-1 ${statusConfig.bgColor}`}
                                                        />
                                                        {statusConfig.label}
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
                <Card className="flex-1 flex flex-col overflow-hidden shadow-md border border-border/50 bg-card/80 backdrop-blur-sm">
                    {!activeConversation ? (
                        /* Empty state */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-background to-muted/10">
                            <div className="bg-primary/10 rounded-full p-5 mb-4">
                                <MessageSquare className="h-10 w-10 text-primary/60" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                Select a Conversation
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Choose an active conversation from the list to view the message history and send responses
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-background via-background to-muted/10 py-4 px-5">
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
                            <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-background to-muted/5">
                                {isLoadingHistory ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">
                                            Loading conversation history...
                                        </p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                        <div className="bg-primary/10 rounded-full p-4 mb-3">
                                            <MessageSquare className="h-6 w-6 text-primary/60" />
                                        </div>
                                        <p className="text-sm text-foreground font-medium">
                                            No messages yet
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">Messages will appear here when the customer sends their first message</p>
                                    </div>
                                ) : (
                                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                                        <div className="flex flex-col gap-3 p-5">
                                            {messages.map((msg, i) => (
                                                <MessageBubble
                                                    key={msg.id || i}
                                                    msg={msg}
                                                    index={i}
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
                                    <Separator className="bg-border/30" />
                                    <CardFooter className="p-4 bg-gradient-to-r from-amber-500/8 to-background border-t border-amber-500/20">
                                        <div className="flex w-full items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold flex-shrink-0 bg-amber-500/15 px-2 py-1 rounded-full">
                                                <Headset className="h-3.5 w-3.5" />
                                                Agent Mode
                                            </div>
                                            <Input
                                                placeholder="Type your response..."
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
                                                className="flex-1 rounded-lg h-9 bg-muted/50 border-muted-foreground/20 focus:bg-background focus:border-primary/50 text-sm"
                                            />
                                            <Button
                                                size="icon"
                                                onClick={handleSendAgentMessage}
                                                disabled={!agentInput.trim()}
                                                className="rounded-lg flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground h-9 w-9"
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
