"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import FreelancerDashboard from "@/components/dashboard/FreelancerDashboard";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Retrieve the real user from LocalStorage
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      // If no user found, redirect to login
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("Failed to parse user data", error);
      localStorage.clear();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 2. Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // 3. Decide which Dashboard to show based on the REAL role
  if (user.role === "FREELANCER") {
    return <FreelancerDashboard user={user} />;
  } 
  
  if (user.role === "CLIENT") {
    return <ClientDashboard user={user} />;
  }

  return <div className="p-4 text-red-500">Access Denied: Unknown User Role</div>;
}