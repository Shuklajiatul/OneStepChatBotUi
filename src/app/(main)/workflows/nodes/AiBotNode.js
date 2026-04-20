import React, { useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const AI_MODELS = [
    { value: 'arcee-ai/trinity-large-preview:free', label: 'Arcee Trinity Large Preview (Free)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet' },
    { value: 'google/gemini-pro-1.5', label: 'Gemini 1.5 Pro' },
    { value: 'meta-llama/llama-3-70b-instruct', label: 'Llama 3 70B' },
];

export const AiBotNode = ({ data, id }) => {
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

    let exitKeywords = nodeData.exit_keywords || [];
    if (Array.isArray(exitKeywords)) {
        exitKeywords = exitKeywords.join(', ');
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
                <div className="col-span-1 flex flex-col gap-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">AI Model</Label>
                    <Select
                        value={nodeData.ai_model || 'arcee-ai/trinity-large-preview:free'}
                        onValueChange={(val) => updateField('ai_model', val)}
                    >
                        <SelectTrigger className="h-8 text-xs nodrag">
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="nodrag">
                            {AI_MODELS.map(model => (
                                <SelectItem key={model.value} value={model.value} className="text-xs">
                                    {model.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="col-span-1 flex flex-col gap-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">History Limit</Label>
                    <Input
                        type="number"
                        value={nodeData.history_limit ?? 20}
                        onChange={(e) => updateField('history_limit', parseInt(e.target.value) || 20)}
                        className="nodrag text-xs h-8"
                        placeholder="20"
                        min={1}
                    />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">System Prompt</Label>
                    <Textarea
                        value={nodeData.system_prompt || ''}
                        onChange={(e) => updateField('system_prompt', e.target.value)}
                        className="nodrag text-xs min-h-[70px]"
                        placeholder="You are a helpful assistant..."
                    />
                </div>

                <div className="col-span-1 flex flex-col gap-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Intro Message</Label>
                    <Textarea
                        value={nodeData.intro_message || ''}
                        onChange={(e) => updateField('intro_message', e.target.value)}
                        className="nodrag text-xs min-h-[50px] resize-none"
                        placeholder="Hi! How can I help?"
                    />
                </div>

                <div className="col-span-1 flex flex-col gap-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Fallback Message</Label>
                    <Textarea
                        value={nodeData.fallback_message || ''}
                        onChange={(e) => updateField('fallback_message', e.target.value)}
                        className="nodrag text-xs min-h-[50px] resize-none"
                        placeholder="Sorry, I couldn't understand..."
                    />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Exit Keywords (comma separated)</Label>
                    <Input
                        value={exitKeywords}
                        onChange={(e) => updateField('exit_keywords', e.target.value)}
                        className="nodrag text-xs h-8"
                        placeholder="talk to human, exit"
                    />
                </div>
            </div>

            {/* Branch Handles */}
            <div className="flex flex-col gap-2 border-t pt-2 mt-2">
                <div className="flex items-center justify-between relative h-7">
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wider">Transfer to human</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="exit"
                        className="!w-5 !h-5 !rounded-full !bg-white !border-2 !border-red-500 !right-[-20px]"
                    />
                </div>
            </div>
        </>
    );
};
