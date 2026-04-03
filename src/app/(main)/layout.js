import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext"
import { Breadcrumbs } from "@/components/breadcrumbs"

export default function DashboardLayout({ children }) {
    return (
        <BreadcrumbProvider>
            <SidebarProvider>

                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumbs />
                    </header>
                    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
                        <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min animate-enter">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </BreadcrumbProvider>
    )
}