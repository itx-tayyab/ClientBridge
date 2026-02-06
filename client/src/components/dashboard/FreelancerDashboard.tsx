"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, CheckCircle, Plus, UserPlus } from "lucide-react";
import { InviteClientModal } from "@/components/dashboard/InviteClientModal";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";

// Mock Data for the table
const recentProjects = [
  { id: 1, name: "E-commerce Website Redesign", client: "Sarah Wilson", status: "Active", deadline: "Mar 15, 2024" },
  { id: 2, name: "Mobile App Development", client: "Tech Startup Inc", status: "In Progress", deadline: "Apr 02, 2024" },
  { id: 3, name: "Brand Identity Package", client: "Coffee House", status: "Pending", deadline: "Feb 28, 2024" },
];

export default function FreelancerDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, Alex! Here's your project overview.
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
          {/* Create Project Here */}
          <CreateProjectModal />
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground text-green-600 font-medium">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground text-green-600 font-medium">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground text-green-600 font-medium">
              +4% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recent Projects</h3>
            <Button variant="link" className="text-primary">View All</Button>
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
                {recentProjects.map((project) => (
                  <tr key={project.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{project.name}</td>
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                                {project.client.charAt(0)}
                            </div>
                            {project.client}
                        </div>
                    </td>
                    <td className="p-4">
                        <Badge variant={project.status === "Active" ? "default" : "secondary"} className={
                            project.status === "Active" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : 
                            project.status === "In Progress" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""
                        }>
                            {project.status}
                        </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{project.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}