"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";  
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, CircleDollarSign, Calendar, User, Clock, Upload, FileText, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddMilestoneModal } from "@/components/dashboard/AddMilestoneModal";
import { io } from "socket.io-client";

export default function ProjectDetailsPage() {
  const params = useParams();
  
  // Handle array or string param safely
  const rawId = params?.id || params?.projectId;
  const projectId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [project, setProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // 1. Fetch Project Data
  const fetchProjectData = async () => {
    if (!projectId) return;

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // Extract project from response wrapper
        setProject(data.project || data);
      } else {
        console.error("Failed to load project");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Milestone Status Update
  const handleStatusUpdate = async (milestoneId: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/milestone/${milestoneId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        // console.log(`Milestone updated: ${data.message}`);
        // console.log(`Project progress: ${data.projectProgress}%`);
        await fetchProjectData(); // Refresh UI
      } else {
        const error = await res.json();
        alert(`Failed to update: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating milestone status");
    }
  };

  // 3. Handle File Upload
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowed = ["image/png", "image/jpeg", "application/pdf", "application/zip"];
    
    if (!allowed.includes(file.type) && !file.name.endsWith('.zip')) {
      alert("Invalid file type. Only Images, PDF, and ZIP allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }

    setIsUploading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        await fetchProjectData(); // Refresh list
        alert("File uploaded successfully!");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("token");
    
    try {
      await fetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          text: newMessage
        })
      });
      // We don't manually add to 'messages' state here. 
      // We wait for the socket 'receive_message' event to do it for us.
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send", error);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // 4. Handle Chat (Socket & API)

  useEffect(() => {
    if (!projectId) return;

    // A. Fetch Chat History via API (REST)
    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        // ⚠️ CHECK PORT HERE: 5000 or 8000?
        const res = await fetch(`http://localhost:8000/messages/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchChatHistory();

    // B. Connect Socket
    // ⚠️ CHECK PORT HERE: 5000 or 8000?
    const socketInstance = io("http://localhost:8000", {
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 Connected to Socket:", socketInstance.id);
      socketInstance.emit("join_project", projectId); // Join the specific room
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 Socket Connection Error:", err);
    });

    // Listen for new messages
    socketInstance.on("receive_message", (message: any) => {
      console.log("📩 New Message Received:", message);
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup: Disconnect when user leaves the page
    return () => {
      socketInstance.disconnect();
      console.log("🔴 Disconnected from Socket");
    };
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-10">Project not found or access denied.</div>;
  }

  const isFreelancer = currentUser?.role === "FREELANCER";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1️⃣ PROJECT HEADER */}
      <div className="flex flex-col gap-6 border-b pb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              {project.description || "No description provided."}
            </p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${
            project.status === "ACTIVE" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : "bg-gray-100 text-gray-700"
          }`}>
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No Date"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>
              {isFreelancer ? `Client: ${project.client?.name}` : `Freelancer: ${project.freelancer?.name}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Progress: {project.progress || 0}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Project Completion</span>
            <span className="text-primary font-semibold">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-purple-600 h-full transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2️⃣ TABS */}
      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        {/* === TAB 1: MILESTONES === */}
        <TabsContent value="milestones" className="space-y-4">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Project Milestones</h3>
            {isFreelancer && projectId && (
              <AddMilestoneModal 
                projectId={projectId as string} 
                onSuccess={fetchProjectData} 
              />
            )}
          </div>

          {project.milestones.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
              No milestones created yet. 
              {isFreelancer && " Click the button to add one."}
            </div>
          )}

          {project.milestones.map((milestone: any) => (
            <Card key={milestone.id} className="transition-all hover:shadow-sm">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Left: Info */}
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                    milestone.status === "COMPLETED" ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                  }`}>
                    {milestone.status === "COMPLETED" ? <CheckCircle className="h-6 w-6" /> : <CircleDollarSign className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{milestone.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{milestone.price}</span>
                      {milestone.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {milestone.status === "COMPLETED" && (
                     <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1">Completed</Badge>
                  )}

                  {milestone.status === "ACTIVE" && (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>
                      {isFreelancer ? (
                         <Button size="sm" onClick={() => handleStatusUpdate(milestone.id, "COMPLETED")}>
                           Mark Complete
                         </Button>
                      ) : (
                         <Button size="sm" variant="outline" disabled>Awaiting Work</Button>
                      )}
                    </div>
                  )}

                  {milestone.status === "PENDING" && (
                    <div className="flex items-center gap-3">
                       <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Pending</Badge>
                       {isFreelancer ? (
                         <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(milestone.id, "ACTIVE")}>
                           Start Work
                         </Button>
                       ) : (
                         <Button variant="ghost" size="sm" disabled className="text-muted-foreground">Waiting</Button>
                       )}
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* === TAB 2: FILES === */}
        <TabsContent value="files" className="space-y-6 mt-6">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors bg-white/50">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Upload files</h3>
            <p className="text-muted-foreground mb-6 text-sm">Drag and drop files here</p>
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            
            <Button 
              variant="outline" 
              className="min-w-[150px]" 
              disabled={isUploading} 
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Choose Files"}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Files</h3>
            <Card>
              <CardContent className="p-0">
                {(!project.files || project.files.length === 0) ? (
                   <div className="p-8 text-center text-muted-foreground text-sm">No files uploaded yet.</div>
                ) : (
                  project.files.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{file.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>By {file.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="font-medium text-primary hover:text-primary/80">Download</Button>
                      </a>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === TAB 3: CHAT === */}
        <TabsContent value="chat" className="mt-6">
          <Card className="flex flex-col h-[600px] shadow-sm">
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      {msg.sender?.name?.charAt(0) || "U"}
                    </div>
                    <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm ${
                        isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
            
            {/* Input Area */}
            <div className="p-4 border-t bg-background rounded-b-xl">
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Type a message..." 
                  className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}