"use client";

import * as React from "react";
import {
  GitGraph,
  LayoutDashboard,
  MessageCircle,
  MessagesSquare,
  Radio,
  Settings,
  LogOut,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { toast } from "sonner";

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
} from "@/components/ui/sidebar";

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
      title: "Live Chat",
      url: "/live-chat",
      icon: Radio,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Media",
      url: "/media",
      icon: ImageIcon,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();

  return (
    <Sidebar
      {...props}
      style={{
        "--font-sans": "var(--font-jetbrains-mono)",
        fontFamily: "var(--font-jetbrains-mono)",
      }}
    >
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
                  <span className="font-sans text-lg font-bold">
                    Slash ChatBot
                  </span>
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

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    try {
                      // Attempt server-side logout first for safety
                      await logout().catch(() => { });

                      // Client-side cookie cleanup as fallback/additional safety
                      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                      toast.success("Logged out successfully");
                      window.location.href = "/login";
                    } catch (error) {
                      console.error("Logout error:", error);
                      // Force redirect anyway
                      window.location.href = "/login";
                    }
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-mono font-bold">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
