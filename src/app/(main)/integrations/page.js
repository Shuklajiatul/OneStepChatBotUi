"use client"

import { useState } from "react"
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
import { MessageCircle, Cloud, CheckCircle2 } from "lucide-react"

export default function IntegrationsPage() {
    const [whatsappConfig, setWhatsappConfig] = useState(false)
    const [instagramConfig, setInstagramConfig] = useState(false)

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
                            <MessageCircle className={`h-8 w-8 ${whatsappConfig ? "text-green-500" : "text-muted-foreground"}`} />
                            <CardTitle>WhatsApp</CardTitle>
                        </div>
                        <CardDescription>
                            Connect to WhatsApp Business API to send and receive messages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {whatsappConfig ? (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-4 w-4" /> Connected
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">Not connected</div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant={whatsappConfig ? "outline" : "default"}>
                                    {whatsappConfig ? "Manage" : "Connect"}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Configure WhatsApp</DialogTitle>
                                    <DialogDescription>
                                        Enter your WhatsApp Business API credentials.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="wa-id" className="text-right">
                                            Account ID
                                        </Label>
                                        <Input id="wa-id" placeholder="123456789" className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="wa-token" className="text-right">
                                            Token
                                        </Label>
                                        <Input id="wa-token" type="password" placeholder="••••••••" className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => setWhatsappConfig(true)}>Save changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                {/* Instagram Integration */}
                <Card className={instagramConfig ? "border-pink-500/50 bg-pink-500/5 dark:bg-pink-500/10" : ""}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Cloud className={`h-8 w-8 ${instagramConfig ? "text-pink-500" : "text-muted-foreground"}`} />
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
                                    {instagramConfig ? "Manage" : "Connect"}
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
            </div>
        </div>
    )
}
