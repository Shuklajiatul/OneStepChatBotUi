import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const MessageNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();

    const handleChange = useCallback((e) => {
        const newMessage = e.target.value;
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        message: newMessage,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, message: newMessage }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const value = data.originalData?.data?.message || data.message || "";

    return (
        <div className="flex flex-col gap-2 mt-2">
            <Label htmlFor={`msg-${id}`} className="text-xs text-muted-foreground">Message Body</Label>
            <Textarea
                id={`msg-${id}`}
                value={value}
                onChange={handleChange}
                className="nodrag text-xs min-h-[60px]"
                placeholder="Type your message..."
            />
        </div>
    );
};
