"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Cloud, CheckCircle2, Loader2, Plus, ArrowLeft, Trash2, Globe, Copy, Check, Code } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function IntegrationsPage() {
    const [whatsappConfig, setWhatsappConfig] = useState(false)
    const [instagramConfig, setInstagramConfig] = useState(false)

    const [workflows, setWorkflows] = useState([])
    const [loadingFlows, setLoadingFlows] = useState(false)
    const [selectedFlowId, setSelectedFlowId] = useState("")
    const [whatsappNumber, setWhatsappNumber] = useState("")
    const [isSaving, setIsSaving] = useState(false)
    const [dialogView, setDialogView] = useState("list")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Web Chat Widget state
    const [webChatDialogOpen, setWebChatDialogOpen] = useState(false)
    const [webChatFlowId, setWebChatFlowId] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchWorkflows()
    }, [])

    const fetchWorkflows = async () => {
        setLoadingFlows(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch workflows');

            const data = await response.json();
            const flows = data.flows || [];
            setWorkflows(flows);

            // Check if any flow is already published
            const hasPublished = flows.some(f => f.is_published);
            setWhatsappConfig(hasPublished);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load workflows");
        } finally {
            setLoadingFlows(false)
        }
    }

    const publishedWorkflows = workflows.filter(f => f.is_published);

    const handlePublish = async () => {
        if (!selectedFlowId) {
            toast.error("Please select a workflow");
            return;
        }

        if (!whatsappNumber) {
            toast.error("Please enter a WhatsApp number to publish");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows/${selectedFlowId}/publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    whatsapp_number: whatsappNumber
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            toast.success("Workflow published successfully!");
            await fetchWorkflows();
            setDialogView("list");
            setSelectedFlowId("");
            setWhatsappNumber("");
        } catch (error) {
            console.error(error);
            toast.error(error.message ? error.message : "Failed to publish workflow");
        } finally {
            setIsSaving(false);
        }
    }

    const handleUnpublish = async (flowId) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/flows/${flowId}/unpublish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Unpublish endpoint not found. Please contact support.');
                }
                throw new Error('Failed to unpublish workflow');
            }

            toast.success("Workflow unpublished successfully!");
            fetchWorkflows();
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to unpublish workflow");
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
                <p className="text-muted-foreground">
                    Connect your chatbot to third-party messaging platforms.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* WhatsApp Integration */}
                <Card className={whatsappConfig ? "border-green-500/50 bg-green-500/5 dark:bg-green-500/10" : ""}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/whatsapp-icon.svg"
                                alt="WhatsApp"
                                width={32}
                                height={32}
                            />
                            <CardTitle>WhatsApp</CardTitle>
                        </div>
                        <CardDescription>
                            Connect to WhatsApp Business API to send and receive messages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {whatsappConfig ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" /> Connected ({publishedWorkflows.length} active)
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Not connected</div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (open) setDialogView("list");
                        }}>
                            <DialogTrigger asChild>
                                <Button variant={whatsappConfig ? "outline" : "default"}>
                                    View WhatsApp
                                </Button>
                            </DialogTrigger>
                            <DialogContent className={dialogView === "list" ? "sm:max-w-[1000px]" : "sm:max-w-[600px]"}>
                                <DialogHeader>
                                    <div className="flex items-center justify-between pr-8">
                                        <div>
                                            <DialogTitle>
                                                {dialogView === "list" ? "WhatsApp Integrations" : "Add New Integration"}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {dialogView === "list"
                                                    ? "Manage your published WhatsApp workflows."
                                                    : "Connect a workflow to a WhatsApp number."}
                                            </DialogDescription>
                                        </div>
                                        {dialogView === "list" && (
                                            <Button size="sm" onClick={() => setDialogView("form")}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Publish
                                            </Button>
                                        )}
                                    </div>
                                </DialogHeader>

                                {dialogView === "list" ? (
                                    <div className="py-4">
                                        {loadingFlows ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : publishedWorkflows.length === 0 ? (
                                            <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                                                <p className="text-sm text-muted-foreground mb-4">No published integrations found.</p>
                                                <Button variant="outline" size="sm" onClick={() => setDialogView("form")}>
                                                    <Plus className="mr-2 h-4 w-4" /> Publish your first workflow
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="border rounded-md">
                                                <Table className="w-full">
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Workflow Name</TableHead>
                                                            <TableHead>WhatsApp Number</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {publishedWorkflows.map((flow) => (
                                                            <TableRow key={flow.flow_id}>
                                                                <TableCell className="font-medium">{flow.flow_name}</TableCell>
                                                                <TableCell>{flow.whatsapp_number || "N/A"}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                                                                        onClick={() => handleUnpublish(flow.flow_id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Unpublish
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="workflow" className="text-right">
                                                Workflow
                                            </Label>
                                            <div className="col-span-3">
                                                <Select value={selectedFlowId} onValueChange={setSelectedFlowId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select workflow" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {workflows.filter(f => !f.is_published).map((flow) => (
                                                            <SelectItem key={flow.flow_id} value={flow.flow_id}>
                                                                {flow.flow_name}
                                                            </SelectItem>
                                                        ))}
                                                        {workflows.filter(f => !f.is_published).length === 0 && (
                                                            <div className="p-2 text-xs text-muted-foreground text-center">
                                                                All workflows are published or no workflows found.
                                                            </div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="wa-number" className="text-right">
                                                WhatsApp Number
                                            </Label>
                                            <Input
                                                id="wa-number"
                                                placeholder="Enter Whatsapp Number"
                                                className="col-span-3"
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <DialogFooter>
                                    {dialogView === "form" ? (
                                        <div className="flex w-full justify-between items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setDialogView("list")}>
                                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
                                            </Button>
                                            <Button size="sm" onClick={handlePublish} disabled={isSaving}>
                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Publish
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Close</Button>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                {/* Instagram Integration */}
                <Card className={instagramConfig ? "border-pink-500/50 bg-pink-500/5 dark:bg-pink-500/10" : ""}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Image
                                src="/instagram.svg"
                                alt="Instagram"
                                width={32}
                                height={32}
                            />
                            <CardTitle>Instagram</CardTitle>
                        </div>
                        <CardDescription>
                            Automate replies and manage DMs on Instagram.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {instagramConfig ? (
                            <div className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400">
                                <CheckCircle2 className="h-4 w-4" /> Connected
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Not connected</div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant={instagramConfig ? "outline" : "default"}>
                                    Manage
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Configure Instagram</DialogTitle>
                                    <DialogDescription>
                                        Link your Instagram Business account.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="ig-user" className="text-right">
                                            Username
                                        </Label>
                                        <Input id="ig-user" placeholder="@username" className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => setInstagramConfig(true)}>Connect Account</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                {/* Web Chat Widget Integration */}
                <Card className={webChatFlowId ? "border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10" : ""}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle>Web Chat</CardTitle>
                        </div>
                        <CardDescription>
                            Embed a chat widget on any website with a simple script tag.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {webChatFlowId ? (
                            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                <CheckCircle2 className="h-4 w-4" /> Widget configured
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Not configured</div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Dialog open={webChatDialogOpen} onOpenChange={(open) => {
                            setWebChatDialogOpen(open)
                            if (!open) setCopied(false)
                        }}>
                            <DialogTrigger asChild>
                                <Button variant={webChatFlowId ? "outline" : "default"}>
                                    <Code className="mr-2 h-4 w-4" />
                                    {webChatFlowId ? "View Embed Code" : "Configure"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[650px]">
                                <DialogHeader>
                                    <DialogTitle>Web Chat Widget</DialogTitle>
                                    <DialogDescription>
                                        Select a workflow and copy the embed code to add a chat widget to your website.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="widget-flow" className="text-right">
                                            Workflow
                                        </Label>
                                        <div className="col-span-3">
                                            <Select value={webChatFlowId} onValueChange={(val) => { setWebChatFlowId(val); setCopied(false); }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a workflow" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {workflows.map((flow) => (
                                                        <SelectItem key={flow.flow_id} value={flow.flow_id}>
                                                            {flow.flow_name}
                                                        </SelectItem>
                                                    ))}
                                                    {workflows.length === 0 && (
                                                        <div className="p-2 text-xs text-muted-foreground text-center">
                                                            No workflows found.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {webChatFlowId && (
                                        <div className="space-y-3">
                                            <Label>Embed Code</Label>
                                            <div className="relative">
                                                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border">{`<!-- Chat Widget -->
<script>
  window.ChatWidgetConfig = {
    flowId: "${webChatFlowId}",
    serverUrl: "${(process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3006/api').replace(/\/+$/, '')}",
    title: "Chat Support",
    primaryColor: "#e85d04"
  };
</script>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/chat-widget.js"></script>`}</pre>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="absolute top-2 right-2 gap-1.5"
                                                    onClick={() => {
                                                        const code = `<!-- Chat Widget -->\n<script>\n  window.ChatWidgetConfig = {\n    flowId: "${webChatFlowId}",\n    serverUrl: "${(process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3006/api').replace(/\/+$/, '')}",\n    title: "Chat Support",\n    primaryColor: "#e85d04"\n  };\n</script>\n<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/chat-widget.js"></script>`;
                                                        navigator.clipboard.writeText(code);
                                                        setCopied(true);
                                                        toast.success("Embed code copied to clipboard!");
                                                        setTimeout(() => setCopied(false), 3000);
                                                    }}
                                                >
                                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                    {copied ? "Copied" : "Copy"}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Paste this code just before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag on your website.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" size="sm" onClick={() => setWebChatDialogOpen(false)}>Close</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
