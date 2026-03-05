import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, MousePointerClick, List, Zap, Webhook, Clock, StopCircle } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export const PlaceholderNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();

    const options = [
        { type: 'message', label: 'Message', Icon: MessageSquare, color: 'text-blue-500' },
        { type: 'question', label: 'Question', Icon: MousePointerClick, color: 'text-purple-500' },
        { type: 'buttons', label: 'Buttons', Icon: MessageSquare, color: 'text-purple-500' },
        { type: 'list', label: 'List', Icon: List, color: 'text-green-500' },
        { type: 'condition', label: 'Condition', Icon: Zap, color: 'text-yellow-500' },
        { type: 'webhook', label: 'Webhook', Icon: Webhook, color: 'text-pink-500' },
        { type: 'delay', label: 'Delay', Icon: Clock, color: 'text-gray-500' },
        { type: 'end', label: 'End', Icon: StopCircle, color: 'text-red-500' },
    ];

    const onSelect = (type, label) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            type,
                            label,
                        },
                    };
                }
                return node;
            })
        );
    };

    return (
        <div className="flex items-center justify-center h-full w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border-2 border-dashed border-primary/50"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="center">
                    <div className="grid grid-cols-1 gap-1">
                        <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
                            Select Node Type
                        </div>
                        {options.map((opt) => (
                            <Button
                                key={opt.type}
                                variant="ghost"
                                className="w-full justify-start gap-3 h-9 text-xs"
                                onClick={() => onSelect(opt.type, opt.label)}
                            >
                                <div className={`p-1.5 rounded-full bg-muted ${opt.color}`}>
                                    <opt.Icon className="h-3.5 w-3.5" />
                                </div>
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
