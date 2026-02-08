"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Briefcase,
  HelpCircle // 👈 Import Help Icon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/dashboard/NotificationBell"; // 👈 Import Bell

const freelancerLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
];

const clientLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "My Projects", href: "/projects" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
];

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const userRole = user?.role || "FREELANCER";
  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  const links = userRole === "CLIENT" ? clientLinks : freelancerLinks;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* 👇 TOP HEADER SECTION UPDATED */}
      <div className="flex h-16 items-center gap-10 border-b px-4">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <span className="hidden md:block">ClientBridge</span>
        </div>

        {/* Right Side: Bell & Help */}
        <div className="flex items-center -mr-2">
           
           
           {/* Notification Bell */}
           <NotificationBell />
        </div>
      </div>

      <div className="flex-1 overflow-auto py-6">
        <nav className="grid items-start px-4 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm overflow-hidden">
            <p className="font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]" title={userEmail}>
              {userEmail}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}