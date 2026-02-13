"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, DollarSign, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateProjectModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    deadline: "",
    budget: "",
    description: "",
  });

  // 1. Fetch Clients when Modal Opens
  useEffect(() => {
    if (open) {
      const fetchClients = async () => {
        const token = localStorage.getItem("token");
        try {
          // Note: Ensure this URL matches your backend setup (e.g. /api/projects/clients)
          const res = await fetch("http://localhost:8000/projects/getclients", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          // Ensure we are setting an array
          setClients(data.clients || (Array.isArray(data) ? data : []));
        } catch (error) {
          console.error("Failed to fetch clients", error);
        }
      };
      fetchClients();
    }
  }, [open]);

  // 2. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const token = localStorage.getItem("token");

    try {
      // 👇 KEY FIX: Create a new payload object and convert clientId to Number
      const payload = {
        ...formData,
        clientId: Number(formData.clientId) // Convert "4" (string) to 4 (number)
      };

      const response = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload) // Send the fixed payload
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the specific error message from the backend
        throw new Error(data.message || "Failed to create project");
      }

      // Success
      alert("Project created successfully!");
      setOpen(false);
      
      // Clear form
      setFormData({ name: "", clientId: "", deadline: "", budget: "", description: "" });
      
      // Refresh page to show new project
      window.location.reload(); 

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error creating project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Start a new project with one of your connected clients.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g. E-commerce Website Redesign"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Client Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="client">Assign Client</Label>
              <Select 
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={clients.length > 0 ? "Select a client" : "No clients found"} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                  <p className="text-[10px] text-red-500">
                    * You need to Invite a client and have them register first.
                  </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="deadline"
                  type="date"
                  className="pl-10 block"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="budget"
                type="text"
                placeholder="0.00"
                className="pl-10"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              placeholder="Outline the project goals, deliverables, and scope..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}