import React, { memo, useCallback, useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { MessageSquare, MousePointerClick, Zap, List, Webhook, Clock, Play, StopCircle, Plus, Headset, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// Import extracted node components
import { MessageNode } from './nodes/MessageNode';
import { QuestionNode } from './nodes/QuestionNode';
import { ButtonsNode } from './nodes/ButtonsNode';
import { ListNode } from './nodes/ListNode';
import { ConditionNode } from './nodes/ConditionNode';
import { WebhookNode } from './nodes/WebhookNode';
import { DelayNode } from './nodes/DelayNode';
import { EndNode } from './nodes/EndNode';
import { PlaceholderNode } from './nodes/PlaceholderNode';
import { TalkToAgentNode } from './nodes/TalkToAgentNode';
import { AiBotNode } from './nodes/AiBotNode';

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
    talk_to_agent: Headset,
    ai_bot: Sparkles,
    placeholder: Plus,
    default: MessageSquare
};

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
    talk_to_agent: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    ai_bot: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    placeholder: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    default: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
};

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
    const isTalkToAgent = data.type === 'talk_to_agent';
    const isAiBot = data.type === 'ai_bot';
    const isPlaceholder = data.type === 'placeholder';
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
                ${isPlaceholder ? 'border-none bg-transparent shadow-none !min-w-0 !p-0 !max-w-none' : ''}
                ${isAiBot ? '!min-w-[420px] !max-w-[550px]' : ''}
                ${!isStart && !isEnd && !isPlaceholder ? 'border px-3 py-3' : ''}
                ${(isStart || isEnd) && !isPlaceholder ? 'px-4 py-3' : ''}
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
                    id="target"
                    className={`!w-5 !h-5 !rounded-full !bg-muted-foreground ${isEnd ? '!bg-red-500' : ''}`}
                />
            )}

            {!isPlaceholder && <NodeHeader data={data} colorClass={colorClass} Icon={Icon} isStart={isStart} isEnd={isEnd} />}

            {/* Interactive Components */}
            {isPlaceholder && <PlaceholderNode data={data} id={id} />}
            {isList && <ListNode data={data} id={id} />}
            {isMessage && <MessageNode data={data} id={id} />}
            {isQuestion && <QuestionNode data={data} id={id} />}
            {isButtons && <ButtonsNode data={data} id={id} />}
            {isCondition && <ConditionNode data={data} id={id} />}
            {isWebhook && <WebhookNode data={data} id={id} />}
            {isDelay && <DelayNode data={data} id={id} />}
            {isTalkToAgent && <TalkToAgentNode data={data} id={id} />}
            {isAiBot && <AiBotNode data={data} id={id} />}
            {isEndWithLogic && <EndNode data={data} id={id} />}

            {!isEnd && !isButtons && !isList && !isCondition && !isPlaceholder && !isTalkToAgent && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="source"
                    className={`!w-5 !h-5 !rounded-full !bg-primary ${isStart ? '!bg-green-500' : ''}`}
                />
            )}
        </div>
    );
});
