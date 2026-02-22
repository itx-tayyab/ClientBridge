"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, User, Loader2 } from "lucide-react";
// 👇 Import Toast for nice alerts (optional, or use console for now)
// If you don't have toast, we will simple alert()

interface InviteClientModalProps {
  trigger?: React.ReactNode;
}

export function InviteClientModal({ trigger }: InviteClientModalProps) {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token"); // Get auth token

      // 👇 API CALL
      const response = await fetch("http://localhost:8000/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invite");
      }

      alert(data.message); // Success Message
      setOpen(false);
      setClientName("");
      setClientEmail("");

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Client</DialogTitle>
          <DialogDescription>
            If they are new, we'll send a signup link. If they exist, we'll connect them instantly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="clientName"
                  placeholder="Enter client's name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}