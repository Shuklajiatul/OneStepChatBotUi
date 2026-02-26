"use client"

import { v4 as uuidv4 } from 'uuid';
import { useRouter, useParams } from "next/navigation"
import { useCallback, useRef, useState, useMemo, useEffect, use } from 'react';
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Panel,
    ReactFlowProvider,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NodeSidebar } from './node-sidebar';
import { Save, Trash, Loader2, ArrowLeft, Plus, MessageSquare, MousePointerClick, Zap, List, Webhook, Clock, StopCircle, Play } from 'lucide-react';
import CustomNode from '../custom-node';
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialNodes = [];

function FlowEditor({ params }) {
    const { id } = use(params);
    const router = useRouter()
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const connectingNodeId = useRef(null);
    const connectingHandleId = useRef(null);
    const [loading, setLoading] = useState(true);
    const [workflowName, setWorkflowName] = useState("New Workflow");
    const [workflowDescription, setWorkflowDescription] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [isNewWorkflow, setIsNewWorkflow] = useState(false);
    const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
    const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    useEffect(() => {
        if (id === 'new') {
            // Handle new workflow
            setIsNewWorkflow(true);
            setWorkflowName("New Workflow");
            setIsMetadataDialogOpen(true);
            setLoading(false);
        } else if (id) {
            fetchWorkflow(id);
        }
    }, [id]);

    const fetchWorkflow = async (workflowId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows/${workflowId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch workflow');
            }

            const data = await response.json();
            setWorkflowName(data.flow.flow_name);
            setWorkflowDescription(data.flow.flow_description || "");
            setWhatsappNumber(data.flow.whatsapp_number || "");

            try {
                const flowData = JSON.parse(data.flow.flow_data);
                processGraph(flowData);
            } catch (e) {
                console.error("Error parsing flow data", e);
                toast.error("Error parsing flow data");
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load workflow");
        } finally {
            setLoading(false);
        }
    }

    const processGraph = (flowData) => {
        if (!flowData || !flowData.nodes) return;

        const backendNodes = flowData.nodes;
        const newNodes = [];
        const newEdges = [];
        const nodeMap = new Map();

        // 1. Create Nodes
        backendNodes.forEach(node => {
            let label = node.id;
            let subtext = node.type;
            let type = 'default';

            if (node.type === 'message') {
                label = node.data.message || "Message";
                if (label.length > 30) label = label.substring(0, 30) + "...";
                type = 'message';
            } else if (node.type === 'question') {
                label = node.data.question || "Question";
                subtext = `Var: ${node.data.variable_name || 'N/A'}`;
                type = 'question';
            } else if (node.type === 'buttons') {
                label = node.data.message || "Buttons";
                if (label.length > 30) label = label.substring(0, 30) + "...";
                subtext = `${node.data.buttons?.length || 0} options`;
                type = 'buttons';
            } else if (node.type === 'list') {
                label = node.data.message || "List";
                if (label.length > 30) label = label.substring(0, 30) + "...";
                const rowCount = node.data.sections?.reduce((acc, section) => acc + (section.rows?.length || 0), 0) || 0;
                subtext = `${rowCount} items`;
                type = 'list';
            } else if (node.type === 'condition') {
                label = "Condition";
                subtext = node.data.condition || "If/Else";
                type = 'condition';
            } else if (node.type === 'webhook') {
                label = "Webhook";
                subtext = node.data.url ? (node.data.url.startsWith('http') ? new URL(node.data.url).hostname : node.data.url) : "API Call";
                type = 'webhook';
            } else if (node.type === 'delay') {
                label = "Delay";
                subtext = `${node.data.duration || 0}s`;
                type = 'delay';
            } else if (node.type === 'start' || node.id === 'start') {
                label = "Start";
                subtext = "Flow entry";
                type = 'start';
            } else if (node.type === 'end') {
                label = "End";
                subtext = node.data.message ? "With message" : "Flow exit";
                type = 'end';
            }

            const reactFlowNode = {
                id: node.id,
                type: 'custom',
                position: node.position || { x: 0, y: 0 },
                data: { label, type, subtext, originalData: node },
            };

            newNodes.push(reactFlowNode);
            nodeMap.set(node.id, reactFlowNode);
        });

        // 2. Create Edges
        backendNodes.forEach(node => {
            if (node.next) {
                newEdges.push({
                    id: `e-${node.id}-${node.next}`,
                    source: node.id,
                    target: node.next,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }

            // Handle Buttons
            if (node.type === 'buttons' && node.data.buttons) {
                node.data.buttons.forEach((btn, index) => {
                    if (btn.next) {
                        newEdges.push({
                            id: `e-${node.id}-${btn.next}-${index}`,
                            source: node.id,
                            sourceHandle: `btn-${btn.id}`,
                            target: btn.next,
                            label: btn.title,
                            type: 'smoothstep',
                            markerEnd: { type: MarkerType.ArrowClosed },
                            style: { strokeDasharray: '5,5' },
                        });
                    }
                });
            }

            // Handle Lists
            if (node.type === 'list' && node.data.sections) {
                node.data.sections.forEach(section => {
                    if (section.rows) {
                        section.rows.forEach((row, index) => {
                            if (row.next) {
                                newEdges.push({
                                    id: `e-${node.id}-${row.next}-${index}`,
                                    source: node.id,
                                    sourceHandle: `row-${row.id}`,
                                    target: row.next,
                                    label: row.title,
                                    type: 'smoothstep',
                                    markerEnd: { type: MarkerType.ArrowClosed },
                                    style: { strokeDasharray: '5,5' },
                                });
                            }
                        });
                    }
                });
            }

            // Handle Conditions
            if (node.type === 'condition') {
                // True branch (from any condition since they all share the same true handle)
                const trueTarget = node.data.conditions?.find(c => c.next)?.next;
                if (trueTarget) {
                    newEdges.push({
                        id: `e-${node.id}-${trueTarget}-true`,
                        source: node.id,
                        sourceHandle: 'true',
                        target: trueTarget,
                        label: 'True',
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#22c55e', strokeWidth: 2 },
                    });
                }
                // False branch (default_next)
                if (node.data.default_next) {
                    newEdges.push({
                        id: `e-${node.id}-${node.data.default_next}-false`,
                        source: node.id,
                        sourceHandle: 'false',
                        target: node.data.default_next,
                        label: 'False',
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed },
                        style: { stroke: '#ef4444', strokeWidth: 2 },
                    });
                }
            }
        });

        const hasPositions = backendNodes.some(n => n.position && (n.position.x !== 0 || n.position.y !== 0));

        let layoutNodes = newNodes;
        if (!hasPositions && newNodes.length > 0) {
            layoutNodes = calculateLayout(newNodes, newEdges);
        }

        setNodes(layoutNodes);
        setEdges(newEdges);

        // Fit view after a small delay to allow node rendering
        setTimeout(() => {
            if (reactFlowInstance) reactFlowInstance.fitView();
        }, 100);
    };

    const calculateLayout = (nodes, edges) => {
        const adjacency = {};
        nodes.forEach(n => adjacency[n.id] = []);
        edges.forEach(e => {
            if (adjacency[e.source]) adjacency[e.source].push(e.target);
        });

        const distinctLevels = {};
        const queue = [{ id: 'start', level: 0 }];
        const visited = new Set(['start']);

        // BFS to determine levels
        while (queue.length > 0) {
            const { id, level } = queue.shift();
            distinctLevels[id] = level;

            const neighbors = adjacency[id] || [];
            neighbors.forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push({ id: neighbor, level: level + 1 });
                }
            });
        }

        // Handle disconnected nodes or cycles by assigning them a level if missed
        nodes.forEach(node => {
            if (distinctLevels[node.id] === undefined) {
                distinctLevels[node.id] = 0;
            }
        });


        // Group by level
        const levels = {};
        Object.entries(distinctLevels).forEach(([id, level]) => {
            if (!levels[level]) levels[level] = [];
            levels[level].push(id);
        });

        // Assign positions
        const HORIZONTAL_SPACING = 350;
        const VERTICAL_SPACING = 150;

        return nodes.map(node => {
            const level = distinctLevels[node.id];
            const levelNodes = levels[level];
            const indexInLevel = levelNodes.indexOf(node.id);

            // Center the level vertically
            const startY = -((levelNodes.length - 1) * VERTICAL_SPACING) / 2;

            return {
                ...node,
                position: {
                    x: level * HORIZONTAL_SPACING,
                    y: startY + indexInLevel * VERTICAL_SPACING,
                },
            };
        });
    };

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
        }, eds)),
        [],
    );

    const onConnectStart = useCallback((_, { nodeId, handleId }) => {
        connectingNodeId.current = nodeId;
        connectingHandleId.current = handleId;
    }, []);

    const onConnectEnd = useCallback((event) => {
        if (!connectingNodeId.current) return;

        const targetIsPane = event.target.classList.contains('react-flow__pane');
        if (targetIsPane && reactFlowInstance) {
            const newId = uuidv4();
            const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
            const position = reactFlowInstance.screenToFlowPosition({
                x: clientX,
                y: clientY,
            });

            const newNode = {
                id: newId,
                type: 'custom',
                position,
                data: { label: 'Add Node', type: 'placeholder' },
            };

            const newEdge = {
                id: `e-${connectingNodeId.current}-${newId}-${connectingHandleId.current || 'default'}`,
                source: connectingNodeId.current,
                sourceHandle: connectingHandleId.current,
                target: newId,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed },
            };

            setNodes((nds) => nds.concat(newNode));
            setEdges((eds) => eds.concat(newEdge));
        }

        connectingNodeId.current = null;
        connectingHandleId.current = null;
    }, [reactFlowInstance, setNodes, setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // projected position from screen to flow coordinates
            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            let label = 'New Node';
            if (type === 'start') label = 'Start';
            if (type === 'message') label = 'Message';
            if (type === 'question') label = 'Question';
            if (type === 'buttons') label = 'Buttons';
            if (type === 'list') label = 'List';
            if (type === 'condition') label = 'Condition';
            if (type === 'webhook') label = 'Webhook';
            if (type === 'delay') label = 'Delay';
            if (type === 'end') label = 'End';

            const newNode = {
                id: uuidv4(),
                type: 'custom',
                position,
                data: { label: `${label}`, type: type },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const deleteSelected = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    }, [setNodes, setEdges]);

    const handleSaveWorkflow = async () => {
        if (!reactFlowInstance) return;

        try {
            const flow = reactFlowInstance.toObject();
            const currentNodes = reactFlowInstance.getNodes();

            const backendNodes = currentNodes.map(node => {
                const nodeType = node.data.originalData?.type || node.data.type || 'message';
                const originalData = node.data.originalData?.data || { message: node.data.label };

                const backendNode = {
                    id: node.id,
                    type: nodeType,
                    data: JSON.parse(JSON.stringify(originalData)),
                    position: node.position,
                    measured: node.measured || { height: 56, width: 150 }
                };

                // Handle single output nodes (start, message, question, etc.)
                const standardOutgoingEdge = edges.find(edge => edge.source === node.id && !edge.sourceHandle && !edge.label);
                if (standardOutgoingEdge) {
                    backendNode.next = standardOutgoingEdge.target;
                }

                // Handle Buttons output
                if (nodeType === 'buttons' && backendNode.data.buttons) {
                    backendNode.data.buttons = backendNode.data.buttons.map(btn => {
                        const btnEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === `btn-${btn.id}`);
                        return { ...btn, next: btnEdge ? btnEdge.target : null };
                    });
                }

                // Handle List output
                if (nodeType === 'list' && backendNode.data.sections) {
                    backendNode.data.sections = backendNode.data.sections.map(section => ({
                        ...section,
                        rows: (section.rows || []).map(row => {
                            const rowEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === `row-${row.id}`);
                            return { ...row, next: rowEdge ? rowEdge.target : null };
                        })
                    }));
                }

                // Handle Question output
                if (nodeType === 'question') {
                    backendNode.data.question = node.data.question || (typeof node.data.label === 'string' ? node.data.label : "") || "";
                    backendNode.data.variable_name = node.data.variable_name || "";
                    backendNode.data.validation_type = node.data.validation_type || "text";
                }

                // Handle Condition output
                if (nodeType === 'condition') {
                    const trueEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'true');
                    const falseEdge = edges.find(edge => edge.source === node.id && edge.sourceHandle === 'false');

                    if (backendNode.data.conditions) {
                        backendNode.data.conditions = backendNode.data.conditions.map(cond => ({
                            ...cond,
                            next: trueEdge ? trueEdge.target : null
                        }));
                    }
                    backendNode.data.default_next = falseEdge ? falseEdge.target : null;
                    backendNode.data.logicOperator = (backendNode.data.logicOperator || 'and').toUpperCase();
                    backendNode.next = null;
                }

                return backendNode;
            });

            const payload = {
                flow_name: workflowName,
                flow_description: workflowDescription,
                channel: "whatsapp",
                whatsapp_number: whatsappNumber,
                flow_data: {
                    nodes: backendNodes,
                    edges: flow.edges,
                    viewport: flow.viewport,
                    settings: {}
                }
            };

            const url = isNewWorkflow
                ? `${process.env.NEXT_PUBLIC_URL}/flows`
                : `${process.env.NEXT_PUBLIC_URL}/flows/${id}`;

            const method = isNewWorkflow ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to save workflow');
            }

            const data = await response.json();

            console.log("Workflow Data", data)

            if (isNewWorkflow) {
                const flowId = data.flow?.flow_id || data.flow_id;
                if (flowId) {
                    toast.success("Workflow created successfully!");
                    router.push(`/workflows/${flowId}`);
                    setIsNewWorkflow(false);
                } else {
                    throw new Error('No flow ID returned');
                }
            } else {
                toast.success("Workflow saved successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save workflow");
        }
    };

    const handleSaveMetadata = () => {
        setIsMetadataDialogOpen(false);
    }

    const nodeTypeList = [
        { type: 'start', label: 'Start', icon: Play, color: 'text-green-500' },
        { type: 'message', label: 'Message', icon: MessageSquare, color: 'text-blue-500' },
        { type: 'question', label: 'Question', icon: MousePointerClick, color: 'text-purple-500' },
        { type: 'buttons', label: 'Buttons', icon: MessageSquare, color: 'text-purple-500' },
        { type: 'list', label: 'List', icon: List, color: 'text-green-500' },
        { type: 'condition', label: 'Condition', icon: Zap, color: 'text-yellow-500' },
        { type: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-pink-500' },
        { type: 'delay', label: 'Delay', icon: Clock, color: 'text-gray-500' },
        { type: 'end', label: 'End', icon: StopCircle, color: 'text-red-500' },
    ];

    const handleAddNodeFromPlaceholder = useCallback((type, label) => {
        const position = reactFlowInstance
            ? reactFlowInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
            : { x: 250, y: 200 };

        const newNode = {
            id: uuidv4(),
            type: 'custom',
            position,
            data: { label, type },
        };

        setNodes((nds) => nds.concat(newNode));
        setIsAddNodeOpen(false);
    }, [reactFlowInstance, setNodes]);

    if (loading) {
        return (
            <div className="flex bg-background h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="border-b bg-background p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/workflows')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold cursor-pointer hover:underline" onClick={() => setIsMetadataDialogOpen(true)}>
                            {workflowName}
                        </h2>
                        <p className="text-xs text-muted-foreground">{workflowDescription || "No description"}</p>
                    </div>
                </div>
                <div className="flex gap-2">

                    {/* <Button size="sm" variant="outline" onClick={() => router.push('/workflows')}>
                        Clear Workflow
                    </Button> */}

                    <Button
                        size="sm"
                        onClick={handleSaveWorkflow}
                    >
                        <Save className="mr-2 h-4 w-4" /> Save Workflow
                    </Button>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 h-full w-full" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        deleteKeyCode={['Backspace', 'Delete']}
                        fitView
                    >
                        <Controls />
                        <Background gap={12} size={1} />
                        {nodes.length === 0 && (
                            <Panel position="top-center" className="!top-1/2 !-translate-y-1/2">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-muted-foreground text-sm font-medium">No nodes yet</div>
                                    <Popover open={isAddNodeOpen} onOpenChange={setIsAddNodeOpen}>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                                            >
                                                <Plus className="h-7 w-7 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-52 p-2" align="center">
                                            <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Add a node</div>
                                            <div className="flex flex-col gap-0.5">
                                                {nodeTypeList.map(({ type, label, icon: Icon, color }) => (
                                                    <button
                                                        key={type}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors cursor-pointer text-left w-full"
                                                        onClick={() => handleAddNodeFromPlaceholder(type, label)}
                                                    >
                                                        <Icon className={`h-4 w-4 ${color}`} />
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <p className="text-xs text-muted-foreground/50">Click to add or drag from sidebar</p>
                                </div>
                            </Panel>
                        )}
                    </ReactFlow>
                </div>
                <NodeSidebar />
            </div>

            <Dialog open={isMetadataDialogOpen} onOpenChange={setIsMetadataDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isNewWorkflow ? "Create New Workflow" : "Edit Workflow Details"}</DialogTitle>
                        <DialogDescription>
                            Enter the name and description for your workflow.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={workflowDescription}
                                onChange={(e) => setWorkflowDescription(e.target.value)}
                                className="col-span-3"
                                resize="none"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="whatsapp" className="text-right">
                                WhatsApp
                            </Label>
                            <Input
                                id="whatsapp"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                className="col-span-3"
                                placeholder="Enter WhatsApp number"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveMetadata}>
                            {isNewWorkflow ? "Start Building" : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function WorkflowEditorPage(props) {
    return (
        <ReactFlowProvider>
            <div className="h-[calc(100vh-8rem)] w-full rounded-lg border bg-background shadow overflow-hidden">
                <FlowEditor params={props.params} />
            </div>
        </ReactFlowProvider>
    )
}
