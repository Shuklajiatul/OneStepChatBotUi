"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, MoreHorizontal, Pencil, Trash, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function WorkflowsPage() {
    const router = useRouter()
    const [workflows, setWorkflows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWorkflows()
    }, [])

    const fetchWorkflows = async () => {
        try {
            const response = await fetch('http://10.10.15.194:3006/api/flows', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch workflows');
            }

            const data = await response.json();

            const mappedWorkflows = data.flows.map(flow => {
                let nodeCount = 0;
                try {
                    const flowData = JSON.parse(flow.flow_data);
                    nodeCount = flowData.nodes ? flowData.nodes.length : 0;
                } catch (e) {
                    console.error("Error parsing flow data", e);
                }

                return {
                    id: flow.flow_id,
                    name: flow.flow_name,
                    description: flow.flow_description || "No description",
                    nodes: nodeCount,
                    lastModified: new Date(flow.updated_at).toLocaleDateString(),
                    status: flow.is_published ? "Active" : "Draft",
                };
            });

            setWorkflows(mappedWorkflows);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load workflows");
        } finally {
            setLoading(false);
        }
    }

    const [deleteId, setDeleteId] = useState(null);

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`http://10.10.15.194:3006/api/flows/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete workflow');
            }

            setWorkflows(prev => prev.filter(w => w.id !== deleteId));
            toast.success("Workflow deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete workflow");
        } finally {
            setDeleteId(null);
        }
    }

    const handleCreateWrapper = () => {
        router.push(`/workflows/new`);
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Workflows</h2>
                    <p className="text-muted-foreground">
                        Manage and design your chatbot automation flows.
                    </p>
                </div>
                <Button onClick={handleCreateWrapper}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Workflow
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : workflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border rounded-lg border-dashed">
                    <p className="text-muted-foreground mb-4">No workflows found. Create one to get started.</p>
                    <Button onClick={handleCreateWrapper} variant="outline">
                        Create your first workflow
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map((workflow) => (
                        <Card key={workflow.id}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap">
                                        {workflow.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {workflow.description}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/workflows/${workflow.id}`}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => setDeleteId(workflow.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm text-muted-foreground mt-4">
                                    <span>{workflow.nodes} Nodes</span>
                                    <span>{workflow.lastModified}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${workflow.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                        {workflow.status}
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the workflow
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
