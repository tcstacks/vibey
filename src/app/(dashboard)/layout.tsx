"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Zap,
  Twitter,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Twitter", href: "/twitter", icon: Twitter },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
        <div className="flex h-16 items-center gap-2 px-6 border-b">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Validation Stack</span>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        <div className="h-16 border-b bg-card flex items-center px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Personal Validation Stack
            </span>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
