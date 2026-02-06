"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Clock, ArrowRight } from "lucide-react";

// Mock Data for the Client
const myProjects = [
  { id: 1, name: "E-commerce Website Redesign", status: "Active", deadline: "Mar 15, 2024" },
  { id: 2, name: "Mobile App Development", status: "In Progress", deadline: "Apr 02, 2024" },
  { id: 3, name: "Brand Identity Package", status: "Pending", deadline: "Feb 28, 2024" },
];

export default function ClientDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
        <p className="text-muted-foreground">
          Track your project progress and collaborate with freelancers.
        </p>
      </div>

      {/* 2. Stats Cards (Only 2 cards as per image) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
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
            <div className="text-3xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Project Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Projects</h3>
            <Button variant="link" className="text-primary">View All</Button>
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
                {myProjects.map((project) => (
                  <tr key={project.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{project.name}</td>
                    <td className="p-4">
                        <Badge variant="secondary" className={
                             project.status === "Active" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : 
                             project.status === "In Progress" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : 
                             "bg-orange-100 text-orange-700 hover:bg-orange-100"
                        }>
                            {project.status}
                        </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{project.deadline}</td>
                    <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </td>
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