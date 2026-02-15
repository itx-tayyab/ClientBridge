"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, CheckCircle, Plus, UserPlus, Loader2 } from "lucide-react";
import { InviteClientModal } from "@/components/dashboard/InviteClientModal";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import Link from "next/link"; // For the "View All" link

export default function FreelancerDashboard({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalClients: 0,
      activeProjects: 0,
      completedProjects: 0
    },
    recentProjects: [] as any[]
  });

  // 1. Fetch Real Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:8000/dashboard/freelancer", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's your project overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <InviteClientModal 
            trigger={
              <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                <UserPlus className="h-4 w-4" />
                Invite Client
              </Button>
            }
          />
          <CreateProjectModal />
        </div>
      </div>

      {/* 2. Stats Cards (Real Data) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Connected Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground text-green-600 font-medium">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground text-green-600 font-medium">Finished Jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Projects Table (Real Data) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recent Projects</h3>
            <Link href="/projects" className="text-sm text-primary hover:underline">
              View All
            </Link>
        </div>
        
        <Card className="overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Project Name</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Client</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Deadline</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No projects found. Create one to get started!
                    </td>
                  </tr>
                ) : (
                  data.recentProjects.map((project) => (
                    <tr key={project.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{project.name}</td>
                      <td className="p-4">
                          <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                                  {project.client?.name.charAt(0) || "C"}
                              </div>
                              {project.client?.name || "Unknown"}
                          </div>
                      </td>
                      <td className="p-4">
                          <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"} className={
                              project.status === "ACTIVE" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : 
                              project.status === "PENDING" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
                          }>
                              {project.status}
                          </Badge>
                      </td>
                      {/* Simple Date Formatting */}
                      <td className="p-4 text-muted-foreground">
                        {new Date(project.deadline || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}