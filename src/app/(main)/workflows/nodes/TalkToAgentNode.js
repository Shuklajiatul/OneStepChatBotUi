import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const TalkToAgentNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();

    const updateField = useCallback((field, value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: {
                                ...node.data.originalData?.data,
                                [field]: value,
                            }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const nodeData = data.originalData?.data || {};

    return (
        <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Wait Message</Label>
                <Textarea
                    value={nodeData.waitMessage || ''}
                    onChange={(e) => updateField('waitMessage', e.target.value)}
                    className="nodrag text-xs min-h-[54px] resize-none"
                    placeholder="Please wait, connecting you to an agent..."
                />
            </div>
            <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Timeout Message</Label>
                <Textarea
                    value={nodeData.timeoutMessage || ''}
                    onChange={(e) => updateField('timeoutMessage', e.target.value)}
                    className="nodrag text-xs min-h-[54px] resize-none"
                    placeholder="Sorry, no agents available right now..."
                />
            </div>
            <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Timeout (seconds)</Label>
                <Input
                    type="number"
                    value={nodeData.timeoutSeconds ?? 60}
                    onChange={(e) => updateField('timeoutSeconds', parseInt(e.target.value) || 60)}
                    className="nodrag text-xs h-8"
                    placeholder="60"
                    min={5}
                />
            </div>
        </div>
    );
};
