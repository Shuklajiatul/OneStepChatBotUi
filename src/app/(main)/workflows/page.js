"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { PlusCircle, MoreHorizontal, Pencil, Trash, Loader2, Search, ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const SORT_OPTIONS = [
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'status', label: 'Status (Active first)' },
    { value: 'nodes-desc', label: 'Most Nodes' },
];

export default function WorkflowsPage() {
    const router = useRouter()
    const [workflows, setWorkflows] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("date-desc")
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const searchRef = useRef(null)

    useEffect(() => {
        fetchWorkflows()
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchWorkflows = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows`, {
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
                    updatedAt: new Date(flow.updated_at).getTime(),
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

    // Filter + sort workflows
    const filteredWorkflows = useMemo(() => {
        let result = [...workflows];

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(w =>
                w.name.toLowerCase().includes(query) ||
                w.description.toLowerCase().includes(query)
            );
        }

        // Sort
        switch (sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date-desc':
                result.sort((a, b) => b.updatedAt - a.updatedAt);
                break;
            case 'date-asc':
                result.sort((a, b) => a.updatedAt - b.updatedAt);
                break;
            case 'status':
                result.sort((a, b) => (a.status === 'Active' ? -1 : 1) - (b.status === 'Active' ? -1 : 1));
                break;
            case 'nodes-desc':
                result.sort((a, b) => b.nodes - a.nodes);
                break;
        }

        return result;
    }, [workflows, searchQuery, sortBy]);

    // Live search dropdown list
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return workflows
            .filter(workflow => workflow.name.toLowerCase().includes(query) || workflow.description.toLowerCase().includes(query))
            .slice(0, 5);
    }, [workflows, searchQuery]);

    const [deleteId, setDeleteId] = useState(null);

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows/${deleteId}`, {
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

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort';

    return (
        <div className="flex flex-col gap-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Workflows</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage and design your chatbot automation flows.
                    </p>
                </div>
                <Button onClick={handleCreateWrapper} className="shadow-sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Workflow
                </Button>
            </div>

            {/* Search + Sort Bar */}
            {!loading && workflows.length > 0 && (
                <div className="flex items-center gap-3">
                    {/* Search Input with Dropdown */}
                    <div className="relative flex-1 max-w-sm" ref={searchRef}>
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="pl-9 pr-8 h-9 text-sm"
                            placeholder="Search workflows..."
                        />
                        {searchQuery && (
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => { setSearchQuery(""); setIsSearchFocused(false); }}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}

                        {/* Live Search Dropdown */}
                        {isSearchFocused && searchQuery.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 overflow-hidden">
                                {searchResults.length > 0 ? (
                                    <ul className="py-1">
                                        {searchResults.map(workflow => (
                                            <li key={workflow.id}>
                                                <Link
                                                    href={`/workflows/${workflow.id}`}
                                                    className="flex items-center justify-between px-3 py-2 hover:bg-muted transition-colors cursor-pointer"
                                                    onClick={() => setIsSearchFocused(false)}
                                                >
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium truncate">{workflow.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate">{workflow.description}</span>
                                                    </div>
                                                    <span className={`shrink-0 ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${workflow.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                        {workflow.status}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                        No workflows match "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs shrink-0">
                                <ArrowUpDown className="h-3.5 w-3.5" />
                                {currentSortLabel}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {SORT_OPTIONS.map(option => (
                                <DropdownMenuItem
                                    key={option.value}
                                    className={`text-xs cursor-pointer ${sortBy === option.value ? 'bg-muted font-medium' : ''}`}
                                    onClick={() => setSortBy(option.value)}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Result count */}
                    {searchQuery && (
                        <span className="text-xs text-muted-foreground shrink-0">
                            {filteredWorkflows.length} result{filteredWorkflows.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

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
            ) : filteredWorkflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center border rounded-lg border-dashed">
                    <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground text-sm">No workflows match your search.</p>
                    <Button variant="link" size="sm" className="mt-1" onClick={() => setSearchQuery("")}>
                        Clear search
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkflows.map((workflow) => (
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
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the workflow. All connected data, metrics, and integrations for this flow will be lost. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Flow
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
