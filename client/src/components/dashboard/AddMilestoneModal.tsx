"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Plus, Loader2, Calendar } from "lucide-react";

interface AddMilestoneModalProps {
  projectId: string;
  onSuccess: () => void;
}

export function AddMilestoneModal({ projectId, onSuccess }: AddMilestoneModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("PENDING");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        title,
        price: `$${price}`, // Formatting price
        status,             // Sending selected status (ACTIVE/PENDING)
        dueDate             // Sending date string (YYYY-MM-DD)
      };

      const res = await fetch(`http://localhost:8000/projects/${projectId}/newMilestone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to add milestone");

      // Reset and Close
      setOpen(false);
      setTitle("");
      setPrice("");
      setDueDate("");
      setStatus("PENDING");
      
      onSuccess(); // Refresh the list
      
    } catch (error) {
      alert("Error adding milestone");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {/* 1. Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Frontend Development" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="500" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required 
              />
            </div>

            {/* 3. Due Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input 
                  id="date" 
                  type="date" 
                  className="pl-10 block" // Make space for icon
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          {/* 4. Status Selection */}
          <div className="space-y-2">
            <Label>Initial Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending (Waiting to start)</SelectItem>
                <SelectItem value="ACTIVE">Active (Working on it)</SelectItem>
                <SelectItem value="COMPLETED">Completed (Done)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}