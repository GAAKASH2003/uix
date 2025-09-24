"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  User,
  Settings,
  Home,
  Shield,
  Users,
  BarChart3,
  ChevronDown,
  Mail,
  Globe,
  Send,
  File,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Shield },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Email Templates", href: "/dashboard/email-templates", icon: Mail },
  { name: "Attachments", href: "/dashboard/attachments", icon: File },
  { name: "Sender Profiles", href: "/dashboard/sender-profiles", icon: Send },
  { name: "Phishlets", href: "/dashboard/phishlets", icon: Globe },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  // { name: "Users", href: "/dashboard/users", icon: Users },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  // console.log("Sentry DSN:", process.env.NEXT_PUBLIC_SENTRY_DSN);
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground font-mono">
            HeroX
          </h1>
          <ThemeToggle />
        </div>

        <nav className="flex-1 mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (pathname !== item.href) {
                      setIsNavigating(true);
                    }
                  }}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded transition-colors font-mono ${
                    pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  } ${isNavigating ? "pointer-events-none opacity-50" : ""}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section at bottom of sidebar */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto"
              >
                <div className="flex items-center w-full">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate font-mono text-wrap">
                      {user?.full_name || user?.username}
                    </p>
                    <p className="text-xs text-sidebar-accent-foreground truncate font-mono">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-accent-foreground ml-2" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
