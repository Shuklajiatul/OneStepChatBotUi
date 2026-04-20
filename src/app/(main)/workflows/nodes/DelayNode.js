import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const DelayNode = ({ data, id }) => {
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
                value={data.originalData?.data?.delay_seconds || 0}
                onChange={handleChange}
                className="nodrag text-xs h-8"
                placeholder=""
            />
        </div>
    )
}
