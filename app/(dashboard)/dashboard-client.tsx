"use client";

import { Suspense, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function DashboardClient({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    
    return (
        <div className="min-h-svh w-full">
            <AppSidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
            />
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetContent side="left" className="p-0 md:hidden">
                    <AppSidebar
                        collapsed={false}
                        onToggle={() => {}}
                        fixed={false}
                        hideToggle
                        className="w-full border-r-0"
                        onNavigate={() => setMobileSidebarOpen(false)}
                    />
                </SheetContent>
            </Sheet>
            <div
                className={`min-h-svh w-full pl-0 transition-[padding] duration-200 ${
                    sidebarCollapsed ? "md:pl-16" : "md:pl-64"
                }`}
            >
                <div className="flex min-h-svh flex-col">
                    <Topbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
                    <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
                        <Suspense
                            fallback={
                                <div className="flex-1 flex flex-col items-center justify-center h-full text-muted-foreground min-h-[50vh] animate-pulse">
                                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                                    <p className="text-sm">Loading workspace...</p>
                                </div>
                            }
                        >
                            {children}
                        </Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}
