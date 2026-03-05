import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const QuestionNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();

    const handleQuestionChange = useCallback((value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                let displayLabel = value || "Question";
                if (displayLabel.length > 30) displayLabel = displayLabel.substring(0, 30) + "...";

                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: displayLabel,
                        question: value,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, question: value }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleVariableChange = useCallback((e) => {
        const newVal = e.target.value;
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        subtext: `Var: ${newVal || 'N/A'}`,
                        variable_name: newVal,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, variable_name: newVal }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleValidationChange = useCallback((value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        validation_type: value,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, validation_type: value }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const question = data.originalData?.data?.question || data.question || "";
    const variableName = data.originalData?.data?.variable_name || data.variable_name || "";
    const validationType = data.originalData?.data?.validation_type || data.validation_type || "text";

    return (
        <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`q-text-${id}`} className="text-xs text-muted-foreground">Question Text</Label>
                <Textarea
                    id={`q-text-${id}`}
                    value={question}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    className="nodrag text-xs min-h-[60px]"
                    placeholder="Type your question..."
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`q-var-${id}`} className="text-xs text-muted-foreground">Save Answer In (Variable)</Label>
                <Input
                    id={`q-var-${id}`}
                    value={variableName}
                    onChange={handleVariableChange}
                    className="nodrag text-xs h-8"
                    placeholder="e.g. user_name"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Validation Type</Label>
                <Select value={validationType} onValueChange={handleValidationChange}>
                    <SelectTrigger className="nodrag h-8 text-xs">
                        <SelectValue placeholder="Select validation..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text" className="text-xs">Text</SelectItem>
                        <SelectItem value="number" className="text-xs">Number</SelectItem>
                        <SelectItem value="email" className="text-xs">Email</SelectItem>
                        <SelectItem value="phone" className="text-xs">Phone</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
