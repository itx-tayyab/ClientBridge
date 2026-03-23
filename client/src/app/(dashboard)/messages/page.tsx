"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Phone, Video, Loader2, MessageSquare } from "lucide-react";
import { io } from "socket.io-client";

let socket: any;

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      try {
        const res = await fetch("http://localhost:8000/projects/getallprojects", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const projectList = Array.isArray(data) ? data : data.projects || [];
          setProjects(projectList);

          if (projectList.length > 0) {
            setActiveProjectId(projectList[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!activeProjectId) return;

    setIsLoadingMessages(true);
    const token = localStorage.getItem("token");

    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8000/messages/${activeProjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchChatHistory();

    socket = io("http://localhost:8000");
    socket.emit("join_project", activeProjectId);

    socket.on("receive_message", (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeProjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeProjectId) return;

    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: activeProjectId,
          text: newMessage,
        }),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const isFreelancer = currentUser?.role === "FREELANCER";

  const filteredProjects = projects.filter((p) => {
    const searchTarget = isFreelancer ? p.client?.name : p.freelancer?.name;
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchTarget?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const activeProject = projects.find((p) => p.id === activeProjectId);

  if (isLoadingProjects) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      {/* LEFT SIDEBAR */}
      <Card className="w-full md:w-80 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-4 text-lg">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              className="pl-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No chats found.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const displayName = isFreelancer
                ? project.client?.name
                : project.freelancer?.name;

              const isActive = activeProjectId === project.id;

              return (
                <div
                  key={project.id}
                  onClick={() => setActiveProjectId(project.id)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-muted/80 transition-colors border-b ${
                    isActive
                      ? "bg-muted/80 border-l-4 border-l-primary"
                      : "border-l-4 border-l-transparent"
                  }`}
                >
                  <Avatar>
                    <AvatarFallback
                      className={isActive ? "bg-primary text-primary-foreground" : ""}
                    >
                      {displayName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 overflow-hidden">
                    <span className="font-medium text-sm truncate">
                      {project.name}
                    </span>
                    <p className="text-xs text-muted-foreground truncate">
                      {displayName || "Unknown User"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* RIGHT CHAT */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {!activeProjectId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 text-muted/50" />
            <p>Select a project to start chatting</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between">
              <div>
                <p className="font-medium text-sm">
                  {activeProject?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFreelancer
                    ? activeProject?.client?.name
                    : activeProject?.freelancer?.name}
                </p>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[70%]">
                      <div
                        className={`px-4 py-2 rounded-xl ${
                          isMe
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* ✅ FIXED TIME */}
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}