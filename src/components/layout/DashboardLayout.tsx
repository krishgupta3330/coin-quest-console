import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  Gamepad2,
  History,
  Settings,
  Users,
  BarChart3,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  variant: "user" | "admin";
}

const userNavItems = [
  { href: "/user", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/wallet", label: "Wallet", icon: Wallet },
  { href: "/user/games", label: "Games", icon: Gamepad2 },
  { href: "/user/history", label: "History", icon: History },
];

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/games", label: "Games", icon: Gamepad2 },
  { href: "/admin/transactions", label: "Transactions", icon: History },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/logs", label: "System Logs", icon: Activity },
];

export function DashboardLayout({ children, variant }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navItems = variant === "user" ? userNavItems : adminNavItems;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              {variant === "user" ? (
                <Sparkles className="h-6 w-6 text-primary" />
              ) : (
                <Shield className="h-6 w-6 text-primary" />
              )}
              <span className="text-lg font-bold gradient-text">
                {variant === "user" ? "GameHub" : "Admin"}
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Switch Panel Button */}
        <div className="border-t border-sidebar-border p-2">
          <Link
            to={variant === "user" ? "/admin" : "/user"}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent"
          >
            {variant === "user" ? (
              <Shield className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {!collapsed && (
              <span>Switch to {variant === "user" ? "Admin" : "User"}</span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="min-h-screen p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
