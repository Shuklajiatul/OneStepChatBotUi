import React, { useCallback, useEffect, useState } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const ListNode = ({ data, id }) => {
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
                                            className="!w-5 !h-5 !rounded-full !bg-white !border-2 !border-green-500 !right-[-20px]"
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
