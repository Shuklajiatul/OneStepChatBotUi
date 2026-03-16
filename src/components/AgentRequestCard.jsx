import { useState, useEffect } from 'react';

const TIMEOUT_SECONDS = 60;

export function AgentRequestCard({ request, onAccept, onReject }) {
    const [secondsLeft, setSecondsLeft] = useState(() => {
        const elapsed = Math.floor(
            (Date.now() - new Date(request.requestedAt).getTime()) / 1000
        );
        return Math.max(0, TIMEOUT_SECONDS - elapsed);
    });

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const interval = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) { clearInterval(interval); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft]);

    const urgency = secondsLeft <= 15 ? 'urgent' : secondsLeft <= 30 ? 'warning' : 'normal';

    const borderColors = {
        urgent: 'border-red-500 shadow-red-500/20',
        warning: 'border-amber-500 shadow-amber-500/20',
        normal: 'border-blue-500 shadow-blue-500/20'
    };

    const textColors = {
        urgent: 'text-red-500 font-bold',
        warning: 'text-amber-500 font-semibold',
        normal: 'text-blue-500 font-medium'
    };

    return (
        <div className={`flex flex-col gap-3 p-4 mb-3 border bg-card rounded-lg shadow-sm ${borderColors[urgency]} transition-all`}>
            <div className="flex justify-between items-start">
                <div>
                    <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                        {request.customerName || 'Unknown Customer'}
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        {request.customerPhone}
                    </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded bg-secondary ${textColors[urgency]}`}>
                    ⏳ {secondsLeft}s
                </div>
            </div>

            {/* Preview Messages */}
            {request.previewMessages && request.previewMessages.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1 bg-muted/30 p-2 rounded-md text-xs">
                    {request.previewMessages.slice(-2).map((msg, i) => (
                        <div key={i} className="flex gap-1.5">
                            <span className="opacity-70">{msg.sender === 'user' ? '👤' : '🤖'}</span>
                            <span className="text-muted-foreground truncate">{msg.message_text}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex gap-2 mt-1">
                <button
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-1.5 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => onAccept(request.conversationId)}
                    disabled={secondsLeft === 0}
                >
                    Accept
                </button>
                <button
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs py-1.5 rounded-md font-medium transition-colors"
                    onClick={() => onReject(request.conversationId)}
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
