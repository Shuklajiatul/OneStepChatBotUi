import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, MousePointerClick, Zap, MessageCircle, Cloud } from 'lucide-react';

const icons = {
    message: MessageSquare,
    input: MousePointerClick,
    condition: Zap,
    whatsapp: MessageCircle,
    instagram: Cloud,
    default: MessageSquare
}

const colors = {
    message: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    input: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    condition: 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    whatsapp: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    instagram: 'bg-pink-100 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
    default: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
}

export default memo(({ data, type = 'default' }) => {
    const Icon = icons[data.type] || icons.default;
    const colorClass = colors[data.type] || colors.default;

    return (
        <div className={`px-4 py-2 shadow-md rounded-md border-2 bg-card min-w-[150px] ${data.selected ? '!border-primary ring-2 ring-primary/20' : ''}`}>
            <div className="flex items-center">
                <div className={`rounded-full p-1.5 mr-2 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="ml-1">
                    <div className="text-sm font-bold text-card-foreground">{data.label}</div>
                    {data.subtext && <div className="text-xs text-muted-foreground">{data.subtext}</div>}
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-muted-foreground" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />
        </div>
    );
});
