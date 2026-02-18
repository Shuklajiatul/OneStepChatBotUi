"use client"

import * as React from "react"
import {
    GitGraph,
    LayoutDashboard,
    MessageCircle,
    MessagesSquare,
    Settings,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Workflows",
            url: "/workflows",
            icon: GitGraph,
        },
        {
            title: "Integrations",
            url: "/integrations",
            icon: MessageCircle,
        },
        {
            title: "Chat Preview",
            url: "/chat",
            icon: MessagesSquare,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ],
}

export function AppSidebar({ ...props }) {
    const pathname = usePathname()

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                                    <Image
                                        src="/SlashLogo.svg"
                                        alt="SlashLogo"
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-0.5 leading-none">
                                    <span className="font-sans text-lg font-bold">Slash ChatBot</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.navMain.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span className="font-mono font-bold">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
