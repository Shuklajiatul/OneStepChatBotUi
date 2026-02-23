import React, { memo, useCallback, useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { MessageSquare, MousePointerClick, Zap, MessageCircle, Cloud, Play, StopCircle, List, Webhook, Clock, Plus, Trash2, X, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const icons = {
    start: Play,
    end: StopCircle,
    message: MessageSquare,
    question: MousePointerClick,
    buttons: MessageSquare,
    list: List,
    condition: Zap,
    webhook: Webhook,
    delay: Clock,
    default: MessageSquare
}

const colors = {
    start: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    end: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    message: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    question: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    buttons: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    list: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    condition: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    webhook: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    delay: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    default: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
}

const NodeHeader = ({ data, colorClass, Icon, isStart, isEnd }) => (
    <div className="flex items-center gap-3 mb-2">
        <div className={`
                    rounded-full p-2
                    ${isStart ? 'bg-green-500 text-white' : ''}
                    ${isEnd ? 'bg-red-500 text-white' : ''}
                    ${!isStart && !isEnd ? colorClass : ''}
                `}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-semibold selection:bg-primary/20">
                {data.label}
            </span>
            {data.subtext && (
                <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {data.subtext}
                </span>
            )}
        </div>
    </div>
);

const MessageNode = ({ data, id }) => {
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

const QUESTION_TEMPLATES = [
    { label: "What is your name?", value: "What is your name?" },
    { label: "What is your email?", value: "What is your email?" },
    { label: "What is your phone number?", value: "What is your phone number?" },
    { label: "How can we help you today?", value: "How can we help you today?" },
];

const QuestionNode = ({ data, id }) => {
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

const ButtonsNode = ({ data, id }) => {
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
                                className="!w-3.5 !h-3.5 !bg-white !border-2 !border-purple-500 !right-[-26px]"
                            />
                        </div>
                    ))}
                    {buttons.length === 0 && <div className="text-xs text-muted-foreground text-center">No buttons</div>}
                </div>
            </div>
        </div>
    )
}

const ListNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const sections = data.originalData?.data?.sections || [{ id: uuidv4(), title: 'Section 1', rows: [] }];

    const totalRows = sections.reduce((sum, s) => sum + (s.rows?.length || 0), 0);
    useEffect(() => {
        updateNodeInternals(id);
    }, [id, totalRows, updateNodeInternals]);

    const updateSections = useCallback((newSections) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, sections: newSections }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleTitleChange = useCallback((e) => {
        const newTitle = e.target.value;
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        message: newTitle,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, message: newTitle }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleAddSection = useCallback(() => {
        if (sections.length >= 3) return;
        const newSection = { id: uuidv4(), title: `Section ${sections.length + 1}`, rows: [] };
        updateSections([...sections, newSection]);
    }, [sections, updateSections]);

    const handleRemoveSection = useCallback((sectionIndex) => {
        updateSections(sections.filter((_, i) => i !== sectionIndex));
    }, [sections, updateSections]);

    const handleSectionTitleChange = useCallback((sectionIndex, value) => {
        const newSections = [...sections];
        newSections[sectionIndex] = { ...newSections[sectionIndex], title: value };
        updateSections(newSections);
    }, [sections, updateSections]);

    const handleAddRow = useCallback((sectionIndex) => {
        const currentRows = sections[sectionIndex].rows || [];
        if (currentRows.length >= 4) return;

        const newRow = { id: uuidv4(), title: "New Item", description: "" };
        const newSections = [...sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            rows: [...currentRows, newRow]
        };
        updateSections(newSections);
    }, [sections, updateSections]);

    const handleRowChange = useCallback((sectionIndex, rowIndex, field, value) => {
        const newSections = [...sections];
        const newRows = [...(newSections[sectionIndex].rows || [])];
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
        newSections[sectionIndex] = { ...newSections[sectionIndex], rows: newRows };
        updateSections(newSections);
    }, [sections, updateSections]);

    const handleRemoveRow = useCallback((sectionIndex, rowIndex) => {
        const newSections = [...sections];
        newSections[sectionIndex] = {
            ...newSections[sectionIndex],
            rows: (newSections[sectionIndex].rows || []).filter((_, i) => i !== rowIndex)
        };
        updateSections(newSections);
    }, [sections, updateSections]);

    return (
        <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`list-title-${id}`} className="text-xs text-muted-foreground">List Title</Label>
                <Input
                    id={`list-title-${id}`}
                    value={data.originalData?.data?.message || data.message || ""}
                    onChange={handleTitleChange}
                    className="nodrag text-xs h-8"
                    placeholder="List Title..."
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground flex justify-between items-center">
                    Sections
                    {sections.length < 3 && (
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={handleAddSection}>
                            <Plus className="h-3 w-3" />
                        </Button>
                    )}
                </Label>
                <div className="flex flex-col gap-3 pl-1 pr-1">
                    {sections.map((section, sectionIndex) => (
                        <div key={section.id || sectionIndex} className="flex flex-col gap-1.5 border rounded-md p-2 bg-muted/30">
                            <div className="flex gap-1 items-center">
                                <Input
                                    value={section.title || ''}
                                    onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                                    className="nodrag text-xs h-6 flex-1 font-medium"
                                    placeholder="Section title"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => handleRemoveSection(sectionIndex)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                {(section.rows || []).length < 4 && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleAddRow(sectionIndex)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {(section.rows || []).map((row, rowIndex) => (
                                    <div key={row.id || rowIndex} className="flex gap-1 items-center relative">
                                        <Input
                                            value={row.title}
                                            onChange={(e) => handleRowChange(sectionIndex, rowIndex, 'title', e.target.value)}
                                            className="nodrag text-xs h-7 flex-1"
                                            placeholder="Item name"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0"
                                            onClick={() => handleRemoveRow(sectionIndex, rowIndex)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            id={`row-${row.id}`}
                                            className="!w-3.5 !h-3.5 !bg-white !border-2 !border-green-500 !right-[-26px]"
                                        />
                                    </div>
                                ))}
                                {(!section.rows || section.rows.length === 0) && (
                                    <div className="text-xs text-muted-foreground text-center py-1 border border-dashed rounded-md">
                                        No items
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {sections.length === 0 && (
                        <div className="text-xs text-muted-foreground text-center py-2 border border-dashed rounded-md">
                            No sections
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const OPERATORS = [
    { value: 'equals', label: 'Equals (==)' },
    { value: 'not_equals', label: 'Not Equals (!=)' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'greater_than', label: 'Greater Than (>)' },
    { value: 'less_than', label: 'Less Than (<)' },
    { value: 'greater_equal', label: 'Greater or Equal (>=)' },
    { value: 'less_equal', label: 'Less or Equal (<=)' },
];

const ConditionNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const [isOpen, setIsOpen] = useState(false);

    const conditions = data.originalData?.data?.conditions || [];
    const logicOperator = data.originalData?.data?.logicOperator || 'and';

    const updateConditionData = useCallback((newConditions, newLogic) => {
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
                                conditions: newConditions,
                                logicOperator: newLogic !== undefined ? newLogic : (node.data.originalData?.data?.logicOperator || 'and'),
                            }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    const handleAddCondition = useCallback(() => {
        const newCondition = { id: uuidv4(), variable: '', operator: 'equals', value: '', next: '' };
        updateConditionData([...conditions, newCondition]);
    }, [conditions, updateConditionData]);

    const handleRemoveCondition = useCallback((condIndex) => {
        updateConditionData(conditions.filter((_, i) => i !== condIndex));
    }, [conditions, updateConditionData]);

    const handleConditionChange = useCallback((condIndex, field, value) => {
        const newConditions = [...conditions];
        newConditions[condIndex] = { ...newConditions[condIndex], [field]: value };
        updateConditionData(newConditions);
    }, [conditions, updateConditionData]);

    const handleLogicChange = useCallback((value) => {
        updateConditionData(conditions, value);
    }, [conditions, updateConditionData]);

    const getOperatorLabel = (op) => OPERATORS.find(o => o.value === op)?.label || op;

    return (
        <>
            <div
                className="flex flex-col gap-2 mt-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
            >
                {conditions.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-md hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <Settings className="h-4 w-4 mx-auto mb-1 opacity-50" />
                        Click to configure conditions
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {conditions.map((cond, i) => (
                            <div key={cond.id || i}>
                                <div className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded px-2 py-1 truncate">
                                    {cond.variable || '?'} <span className="font-semibold">{getOperatorLabel(cond.operator)}</span> {cond.value || '?'}
                                </div>
                                {i < conditions.length - 1 && (
                                    <div className="text-[10px] text-center text-muted-foreground font-semibold uppercase my-0.5">
                                        {logicOperator}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Configure Conditions</DialogTitle>
                        <DialogDescription>
                            Define one or more conditions for this node.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2 max-h-[400px] overflow-y-auto">
                        {conditions.length > 1 && (
                            <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground shrink-0">Match</Label>
                                <Select value={logicOperator} onValueChange={handleLogicChange}>
                                    <SelectTrigger className="h-8 w-24 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="and">AND</SelectItem>
                                        <SelectItem value="or">OR</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-xs text-muted-foreground">of the following</span>
                            </div>
                        )}
                        {conditions.map((cond, index) => (
                            <div key={cond.id || index} className="flex flex-col gap-2 p-3 border rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">Condition {index + 1}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveCondition(index)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                                    <Input
                                        value={cond.value1 || ''}
                                        onChange={(e) => handleConditionChange(index, 'value1', e.target.value)}
                                        className="text-xs h-8"
                                        placeholder="Value 1"
                                    />
                                    <Select
                                        value={cond.operator || 'equals'}
                                        onValueChange={(val) => handleConditionChange(index, 'operator', val)}
                                    >
                                        <SelectTrigger className="h-8 w-[140px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OPERATORS.map(op => (
                                                <SelectItem key={op.value} value={op.value} className="text-xs">
                                                    {op.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={cond.value2 || ''}
                                        onChange={(e) => handleConditionChange(index, 'value2', e.target.value)}
                                        className="text-xs h-8"
                                        placeholder="Value 2"
                                    />
                                </div>
                            </div>
                        ))}
                        {conditions.length === 0 && (
                            <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                                No conditions added yet
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex !justify-between">
                        <Button variant="outline" size="sm" onClick={handleAddCondition}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Condition
                        </Button>
                        <Button size="sm" onClick={() => setIsOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

const WebhookNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const handleChange = useCallback((e) => {
        const newVal = e.target.value;
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, url: newVal }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    return (
        <div className="flex flex-col gap-2 mt-2">
            <Label htmlFor={`url-${id}`} className="text-xs text-muted-foreground">URL</Label>
            <Input
                id={`url-${id}`}
                value={data.originalData?.data?.url || ""}
                onChange={handleChange}
                className="nodrag text-xs h-8"
                placeholder="https://api.example.com"
            />
        </div>
    )
}

const DelayNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const handleChange = useCallback((e) => {
        const newVal = parseInt(e.target.value) || 0;
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, duration: newVal }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    return (
        <div className="flex flex-col gap-2 mt-2">
            <Label htmlFor={`delay-${id}`} className="text-xs text-muted-foreground">Duration (seconds)</Label>
            <Input
                id={`delay-${id}`}
                type="number"
                value={data.originalData?.data?.duration || 0}
                onChange={handleChange}
                className="nodrag text-xs h-8"
                placeholder="0"
            />
        </div>
    )
}

const EndNode = ({ data, id }) => {
    const { setNodes } = useReactFlow();
    const handleChange = useCallback((e) => {
        const newVal = e.target.value;
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        originalData: {
                            ...node.data.originalData,
                            data: { ...node.data.originalData?.data, message: newVal }
                        }
                    }
                };
            }
            return node;
        }));
    }, [id, setNodes]);

    return (
        <div className="flex flex-col gap-2 mt-2">
            <Label htmlFor={`end-${id}`} className="text-xs text-muted-foreground">End Message (Optional)</Label>
            <Input
                id={`end-${id}`}
                value={data.originalData?.data?.message || ""}
                onChange={handleChange}
                className="nodrag text-xs h-8"
                placeholder="Bye!"
            />
        </div>
    )
}


export default memo(({ id, data }) => {
    const { setNodes } = useReactFlow();
    const [isHovered, setIsHovered] = useState(false);

    const Icon = icons[data.type] || icons.default;
    const colorClass = colors[data.type] || colors.default;
    const isStart = data.type === 'start';
    const isEnd = data.type === 'end';

    const isList = data.type === 'list';
    const isMessage = data.type === 'message';
    const isQuestion = data.type === 'question';
    const isButtons = data.type === 'buttons';
    const isCondition = data.type === 'condition';
    const isWebhook = data.type === 'webhook';
    const isDelay = data.type === 'delay';
    const isEndWithLogic = isEnd;

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
    }, [id, setNodes]);

    const handleExecute = useCallback((e) => {
        e.stopPropagation();
        console.log("Execute workflow from start node");
    }, []);

    return (
        <div
            className={`
                relative shadow-md rounded-md bg-card min-w-[200px] max-w-[250px] transition-all group
                ${data.selected ? 'ring-2 ring-primary' : ''}
                ${isStart ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                ${isEnd ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                ${!isStart && !isEnd ? 'border px-3 py-3' : 'px-4 py-3'}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {!isStart && (
                <div className={`absolute -top-3 -right-3 z-50 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full shadow-sm"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {isStart && (
                <div className={`absolute -top-3 -right-3 z-50 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity flex`}>
                    <Button
                        variant='destructive'
                        size='icon'
                        className="h-6 w-6 rounded-full shadow-sm justify-self-center"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        className="h-6 w-6 rounded-full shadow-sm bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleExecute}
                    >
                        <Play className="h-3 w-3 fill-current" />
                    </Button>
                </div>
            )}

            {!isStart && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className={`w-3 h-3 !bg-muted-foreground ${isEnd ? '!bg-red-500' : ''}`}
                />
            )}

            <NodeHeader data={data} colorClass={colorClass} Icon={Icon} isStart={isStart} isEnd={isEnd} />

            {/* Interactive Components */}
            {isList && <ListNode data={data} id={id} />}
            {isMessage && <MessageNode data={data} id={id} />}
            {isQuestion && <QuestionNode data={data} id={id} />}
            {isButtons && <ButtonsNode data={data} id={id} />}
            {isCondition && <ConditionNode data={data} id={id} />}
            {isWebhook && <WebhookNode data={data} id={id} />}
            {isDelay && <DelayNode data={data} id={id} />}
            {isEndWithLogic && <EndNode data={data} id={id} />}

            {!isEnd && !isButtons && !isList && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={`w-3 h-3 !bg-primary ${isStart ? '!bg-green-500' : ''}`}
                />
            )}
        </div>
    );
});
