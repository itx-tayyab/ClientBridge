"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FolderOpen, Calendar, Search, Filter, Loader2 } from "lucide-react";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";

// Define shape of data coming from API
interface Project {
  id: number;
  name: string;
  status: string;
  deadline: string;
  progress: number;
  client?: { name: string };     // If fetched as Freelancer
  freelancer?: { name: string }; // If fetched as Client
}

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedClientId = searchParams.get("clientId");
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState("FREELANCER");

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (!token || !storedUser) return;
      
      const user = JSON.parse(storedUser);
      setUserRole(user.role);

      try {
        const baseUrl = "http://localhost:8000/projects/getallprojects";
        const url = user.role === "FREELANCER" && selectedClientId
          ? `${baseUrl}?clientId=${selectedClientId}`
          : baseUrl;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedClientId]);

  // 2. Filter Logic (Search Bar)
  const filteredProjects = projects.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    // Search by Project Name
    if (project.name.toLowerCase().includes(searchLower)) return true;
    // Search by Client Name (if freelancer)
    if (project.client?.name.toLowerCase().includes(searchLower)) return true;
    // Search by Freelancer Name (if client)
    if (project.freelancer?.name.toLowerCase().includes(searchLower)) return true;
    return false;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userRole === "CLIENT" ? "My Projects" : "Projects"}
          </h1>
          <p className="text-muted-foreground">
            {userRole === "CLIENT" 
              ? "Track the progress of your active projects." 
              : "Manage your active projects and track progress."}
          </p>
        </div>

        {/* Hide Create Button for Clients */}
        {userRole === "FREELANCER" && (
          <CreateProjectModal />
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="cursor-pointer transition-all hover:shadow-md border-muted/60 hover:border-primary/20"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold leading-tight">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {/* Dynamic: Show Client Name if Freelancer, else Freelancer Name */}
                    {userRole === "FREELANCER" 
                      ? project.client?.name 
                      : project.freelancer?.name}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <FolderOpen className="h-4 w-4 text-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"} className={
                    project.status === "ACTIVE" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : 
                    project.status === "COMPLETED" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""
                  }>
                    {project.status}
                  </Badge>
                  <div className="flex items-center text-muted-foreground gap-1">
                    <Calendar className="h-3 w-3" />
                    {project.deadline}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div 
                      className="h-full rounded-full bg-primary transition-all" 
                      style={{ width: `${project.progress}%` }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Empty State */}
          {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
                  <p>No projects found.</p>
                  {userRole === "FREELANCER" && <p className="text-xs mt-1">Click "Create Project" to start one.</p>}
              </div>
          )}
        </div>
      )}
    </div>
  );
}