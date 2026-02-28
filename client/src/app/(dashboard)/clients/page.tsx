"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Mail, Loader2, Trash, Eye, RefreshCw } from "lucide-react";
import { InviteClientModal } from "@/components/dashboard/InviteClientModal";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:8000/clients/getclients", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setClients(data.clients || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Filter Logic
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships and invitations.</p>
        </div>
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
        {filteredClients.map((client) => (
          <Card key={client.inviteId || client.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              {/* Initials Avatar with random color based on name */}
              <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                  <AvatarFallback>{client.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              
              <div className="flex-1 overflow-hidden">
                <CardTitle className="text-base truncate">{client.name}</CardTitle>
              </div>
              
              {/* 3 Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {client.status === "ACCEPTED" && (
                    <DropdownMenuItem onClick={() => router.push(`/clients/${client.userId}`)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                  )}
                  {client.status !== "ACCEPTED" && (
                    <DropdownMenuItem>
                      <RefreshCw className="mr-2 h-4 w-4" /> Resend Invite
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 mt-2">
                {/* Email Row */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{client.email}</span>
                </div>
                
                {/* Status & Count Row */}
                <div className="flex items-center justify-between">
                  {client.status === "ACCEPTED" ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 px-3">
                      Pending
                    </Badge>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {/* Ensure your API returns project count, otherwise defaults to 0 */}
                    {client.projectCount || 0} Active Projects
                  </span>
                </div>

                {/* Bottom Button Action */}
                {client.status === "ACCEPTED" ? (
                   <Button 
     variant="secondary" 
     className="w-full mt-4 h-8 text-xs"
     // 👇 Only navigate if userId exists
     onClick={() => client.userId && router.push(`/projects?clientId=${client.userId}`)}
   >
     View Projects
   </Button>
                ) : (
                   <Button variant="outline" className="w-full">
                     Resend Invite
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