import React, { useCallback, useEffect } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ButtonsNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const buttons = data.originalData?.data?.buttons || [];

    useEffect(() => {
        updateNodeInternals(id);
    }, [id, buttons.length, updateNodeInternals]);

    const handleMessageChange = useCallback((e) => {
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

    const handleAddButton = useCallback((e) => {
        e.stopPropagation();
        if (buttons.length >= 3) return;
        const newButtons = [...buttons, { id: uuidv4(), title: "New Button" }];
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, buttons: newButtons }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, buttons, setNodes]);

    const handleButtonChange = useCallback((index, value) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], title: value };
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, buttons: newButtons }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, buttons, setNodes]);

    const handleRemoveButton = useCallback((index) => {
        const newButtons = buttons.filter((_, i) => i !== index);
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, buttons: newButtons }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, buttons, setNodes]);

    return (
        <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`btn-msg-${id}`} className="text-xs text-muted-foreground">Message Body</Label>
                <Textarea
                    id={`btn-msg-${id}`}
                    value={data.originalData?.data?.message || data.message || ""}
                    onChange={handleMessageChange}
                    className="nodrag text-xs min-h-[60px]"
                    placeholder="Message..."
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground flex justify-between items-center">
                    Buttons
                    {buttons.length < 3 && (
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={handleAddButton}>
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}
                </Label>
                <div className="flex flex-col gap-2 pl-1 pr-1">
                    {buttons.map((btn, index) => (
                        <div key={btn.id || index} className="flex gap-2 items-center relative">
                            <Input
                                value={btn.title}
                                onChange={(e) => handleButtonChange(index, e.target.value)}
                                className="nodrag text-xs h-7 flex-1"
                                placeholder="Button label"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                onClick={() => handleRemoveButton(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`btn-${btn.id}`}
                                className="!w-5 !h-5 !rounded-full !bg-white !border-2 !border-purple-500 !right-[-20px]"
                            />
                        </div>
                    ))}
                    {buttons.length === 0 && <div className="text-xs text-muted-foreground text-center">No buttons</div>}
                </div>
            </div>
        </div>
    )
}
