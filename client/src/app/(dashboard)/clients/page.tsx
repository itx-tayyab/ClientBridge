"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreHorizontal, Mail, Phone, Globe } from "lucide-react";
import { InviteClientModal } from "@/components/dashboard/InviteClientModal"; // 👈 Reuse your modal!

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // 🔮 MOCK DATA
  const clients = [
    { 
      id: 1, 
      name: "Sarah Wilson", 
      company: "Glow Cosmetics", 
      email: "sarah@glow.com", 
      status: "Active", 
      projects: 2,
      joined: "Jan 15, 2024"
    },
    { 
      id: 2, 
      name: "Tech Startup Inc", 
      company: "Tech Startup Inc", 
      email: "admin@techstart.io", 
      status: "Active", 
      projects: 1,
      joined: "Feb 02, 2024"
    },
    { 
      id: 3, 
      name: "Pending User", 
      company: "Coffee House", 
      email: "manager@coffee.com", 
      status: "Pending", 
      projects: 0,
      joined: "-"
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and invitations.
          </p>
        </div>
        {/* Reuse the Invite Modal here */}
        <InviteClientModal />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search clients..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Client List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <CardTitle className="text-base truncate">{client.name}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{client.company}</p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{client.email}</span>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Badge variant={client.status === "Active" ? "default" : "outline"} className={
                    client.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-100" : "text-orange-600 border-orange-200 bg-orange-50"
                  }>
                    {client.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {client.projects} Active Project{client.projects !== 1 && 's'}
                  </span>
                </div>

                {client.status === "Pending" && (
                   <Button variant="outline" size="sm" className="w-full mt-4 h-8 text-xs">
                     Resend Invite
                   </Button>
                )}
                {client.status === "Active" && (
                   <Button variant="secondary" size="sm" className="w-full mt-4 h-8 text-xs">
                     View Projects
                   </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}