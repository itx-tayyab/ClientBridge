"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2, Calendar } from "lucide-react";

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
  milestoneToEdit?: any | null; // 👇 If passed, modal becomes "Edit Mode"
}

export function AddMilestoneModal({ isOpen, onClose, projectId, onSuccess, milestoneToEdit }: MilestoneModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("PENDING");

  const isEditing = !!milestoneToEdit;

  // 👇 Populate form when opened in "Edit Mode"
  useEffect(() => {
    if (isOpen && milestoneToEdit) {
      setTitle(milestoneToEdit.title);
      setPrice(milestoneToEdit.price.replace(/[^0-9.]/g, "")); // Strip out "$" for input
      setStatus(milestoneToEdit.status);
      setDueDate(milestoneToEdit.dueDate ? new Date(milestoneToEdit.dueDate).toISOString().split('T')[0] : "");
    } else if (isOpen && !milestoneToEdit) {
      // Reset for "Add Mode"
      setTitle("");
      setPrice("");
      setDueDate("");
      setStatus("PENDING");
    }
  },[isOpen, milestoneToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title,
        price: `$${price}`,
        status,
        dueDate
      };

      // 👇 Switch URL & Method based on Add vs Edit
      const url = isEditing 
        ? `http://localhost:8000/projects/${projectId}/milestone/${milestoneToEdit.id}`
        : `http://localhost:8000/projects/${projectId}/newMilestone`;
        
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save milestone");

      onSuccess(); // Refresh the list
      onClose();   // Close modal
      
    } catch (error) {
      alert(isEditing ? "Error updating milestone" : "Error adding milestone");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Milestone" : "Add New Milestone"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label htmlFor="date">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input 
                  id="date" 
                  type="date" 
                  className="pl-10 block" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (isEditing ? "Save Changes" : "Add Milestone")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}