"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // 👇 FIX 2: Store the full user object, not just the role
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      // Parse the full user object (contains id, name, email, role)
      setUser(JSON.parse(storedUser));
    } catch (e) {
      localStorage.clear();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* 👇 FIX 3: Pass the full 'user' object to the Sidebar */}
      <Sidebar user={user} />
      
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}