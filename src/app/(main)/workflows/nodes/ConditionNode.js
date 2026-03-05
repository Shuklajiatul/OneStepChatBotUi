import React, { useCallback, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, Plus } from 'lucide-react';
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

export const ConditionNode = ({ data, id }) => {
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
                                    {cond.value1 || '?'} <span className="font-semibold">{getOperatorLabel(cond.operator)}</span> {cond.value2 || '?'}
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

            {/* Branch Handles */}
            <div className="flex flex-col gap-2 border-t pt-3 mt-1">
                <div className="flex items-center justify-between relative h-7">
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider">True</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="true"
                        className="!w-5 !h-5 !bg-white !rounded-full !border-2 !border-green-500 !right-[-20px]"
                    />
                </div>
                <div className="flex items-center justify-between relative h-7">
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase tracking-wider">False</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="false"
                        className="!w-5 !h-5 !rounded-full !bg-white !border-2 !border-red-500 !right-[-20px]"
                    />
                </div>
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
