import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const EndNode = ({ data, id }) => {
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
