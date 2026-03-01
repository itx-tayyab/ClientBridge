"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, ArrowLeft, Loader2, FolderKanban } from "lucide-react";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔮 Fetch Single Client Data
  // You will need to create a backend endpoint: GET /clients/:id
  useEffect(() => {
    const fetchClientDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:8000/clients/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setClient(data.client);
        } else {
          console.error("Failed to load client details");
        }
      } catch (error) {
        console.error("Error fetching client details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientDetails();
  }, [params.id]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" className="gap-2 pl-0" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back to Clients
      </Button>

      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b pb-8">
        <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
          <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-lg text-muted-foreground">{client.company}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {client.email}
            </div>
            {client.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Joined: {new Date(client.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
           <Badge variant={client.status === "ACCEPTED" ? "default" : "secondary"} className="text-md px-3 py-1">
             {client.status === "ACCEPTED" ? "Active Client" : "Pending"}
           </Badge>
           <div className="text-sm font-medium text-muted-foreground">
             Total Projects: <span className="text-foreground">{client.totalProjects || 0}</span>
           </div>
        </div>
      </div>

      {/* Client Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderKanban className="h-5 w-5" /> Projects ({client.totalProjects || 0})
        </h2>
        {(!client.projects || client.projects.length === 0) ? (
          <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
            No projects yet. Create one to get started!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {client.projects.map((project: any) => (
              <Card key={project.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => router.push(`/projects/${project.id}`)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>{project.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No Date"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}