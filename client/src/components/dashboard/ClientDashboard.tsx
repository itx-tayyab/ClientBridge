"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ClientDashboard({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      activeProjects: 0,
      pendingApprovals: 0
    },
    recentProjects: [] as any[]
  });

  // Fetch Real Data from Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        // 👇 Using the Client Endpoint we created
        const res = await fetch("http://localhost:8000/dashboard/client", {
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
        <p className="text-muted-foreground">
          Track your project progress and collaborate with freelancers.
        </p>
      </div>

      {/* 2. Stats Cards (Exact design maintained) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.pendingApprovals}</div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Project Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Projects</h3>
            <Link href="/projects">
              <Button variant="link" className="text-primary">View All</Button>
            </Link>
        </div>
        
        <Card className="overflow-hidden">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Project Name</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Deadline</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data.recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  data.recentProjects.map((project) => (
                    <tr key={project.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{project.name}</td>
                      <td className="p-4">
                          <Badge variant="secondary" className={
                               project.status === "ACTIVE" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : 
                               project.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : 
                               "bg-orange-100 text-orange-700 hover:bg-orange-100"
                          }>
                              {project.status}
                          </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(project.deadline || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
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