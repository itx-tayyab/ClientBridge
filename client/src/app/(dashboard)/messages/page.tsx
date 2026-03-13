"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, Loader2 } from "lucide-react";
import { io } from "socket.io-client";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const [isLoadingMsg, setIsLoadingMsg] = useState(false);
  const socketRef = useRef<any>(null);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      try {
        const res = await fetch("http://localhost:8000/messages/conversations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          console.log("✅ Conversations loaded:", data);
          setConversations(data);
        } else {
          console.error("❌ Failed to fetch conversations:", res.status, await res.text());
        }
      } catch (error) {
        console.error("❌ Error fetching conversations:", error);
      } finally {
        setIsLoadingConv(false);
      }
    };
    fetchConversations();
  }, []);

  // Setup socket and fetch messages when selecting a chat
  useEffect(() => {
    if (!activeChat) return;

    const token = localStorage.getItem("token");
    const fetchDM = async () => {
      setIsLoadingMsg(true);
      try {
        const res = await fetch(`http://localhost:8000/messages/direct/${activeChat.otherId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching DM:", error);
      } finally {
        setIsLoadingMsg(false);
      }
    };
    fetchDM();

    // Socket setup for DMs
    const dmRoom = `dm_${Math.min(currentUser?.id, activeChat.otherId)}_${Math.max(currentUser?.id, activeChat.otherId)}`;
    
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:8000", { withCredentials: true });
    }

    socketRef.current.emit("join_dm", dmRoom);
    
    const handleNewMsg = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    socketRef.current.on("receive_dm", handleNewMsg);

    return () => {
      socketRef.current?.off("receive_dm", handleNewMsg);
    };
  }, [activeChat, currentUser?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const token = localStorage.getItem("token");
    try {
      // For DMs, we send to a virtual projectId representing the DM conversation
      const dmProjectId = `dm_${Math.min(currentUser?.id, activeChat.otherId)}_${Math.max(currentUser?.id, activeChat.otherId)}`;
      
      await fetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: dmProjectId,
          text: newMessage
        })
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      
      {/* LEFT SIDEBAR: Chat List */}
      <Card className="w-full md:w-80 flex flex-col overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-9 bg-muted/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingConv ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet</div>
          ) : (
            conversations.map((chat) => (
              <div 
                key={chat.otherId}
                onClick={() => setActiveChat(chat)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                  activeChat?.otherId === chat.otherId ? "bg-muted/50" : ""
                }`}
              >
                <Avatar>
                  <AvatarFallback>{chat.otherUser?.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{chat.otherUser?.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(chat.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.projectName}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">{chat.lastMsg}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* RIGHT SIDE: Chat Window */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
        {/* Chat Header */}
        {activeChat ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{activeChat.otherUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{activeChat.otherUser?.name}</p>
                  <p className="text-xs text-muted-foreground">{activeChat.projectName}</p>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 bg-muted/10 p-4 space-y-4 overflow-y-auto">
              {isLoadingMsg ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm mt-10">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.sender?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`p-3 rounded-lg text-sm max-w-[80%] ${
                        isOwn 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type your message..." 
                  className="flex-1" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </Card>

    </div>
  );
}