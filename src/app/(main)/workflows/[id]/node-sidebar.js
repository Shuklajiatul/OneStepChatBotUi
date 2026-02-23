import { Card } from "@/components/ui/card"
import { MessageSquare, MousePointerClick, Zap, MessageCircle, Cloud, List, Webhook, Clock, StopCircle, Play } from "lucide-react"

export function NodeSidebar() {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 border-l bg-background p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="font-semibold mb-2">Entry Point</div>
            <div className="grid grid-cols-1 gap-2">
                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'start')}
                    draggable
                >
                    <Play className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Start</span>
                </div>
            </div>

            <div className="font-semibold mb-2">Message Nodes</div>

            <div className="grid grid-cols-1 gap-2">
                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'message')}
                    draggable
                >
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Message</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'question')}
                    draggable
                >
                    <MousePointerClick className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Question</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'buttons')}
                    draggable
                >
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Buttons</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'list')}
                    draggable
                >
                    <List className="h-4 w-4 text-green-500" />
                    <span className="text-sm">List</span>
                </div>
            </div>

            <div className="font-semibold mb-2 mt-4">Logic & Flow</div>
            <div className="grid grid-cols-1 gap-2">
                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'condition')}
                    draggable
                >
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Condition</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'webhook')}
                    draggable
                >
                    <Webhook className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">Webhook</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'delay')}
                    draggable
                >
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Delay</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border cursor-grab hover:bg-muted"
                    onDragStart={(event) => onDragStart(event, 'end')}
                    draggable
                >
                    <StopCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">End</span>
                </div>
            </div>
        </div>
    )
}
