import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            {/* Top bar with notification */}
            <div className="lg:pl-64">
                <div className="fixed top-0 right-0 left-0 lg:left-64 h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 z-30 flex items-center justify-end px-6">
                    <NotificationBell />
                </div>
                <main>
                    <div className="min-h-screen pt-14">{children}</div>
                </main>
            </div>
        </div>
    );
}

