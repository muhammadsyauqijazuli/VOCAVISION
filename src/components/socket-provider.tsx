"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/auth-client";

type Notification = {
  id: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
};

type SocketContextType = {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  fetchNotifications: () => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  fetchNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/read/${id}`, {
        method: "PUT",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    if (session?.user?.id && session?.user?.role === "siswa") {
      fetchNotifications();

      const socketInstance = io("http://localhost:5000", {
        withCredentials: true,
      });

      socketInstance.on("connect", () => {
        // Emit join event using user_id; the backend will resolve the corresponding student_id.
        socketInstance.emit("join", { user_id: session.user.id });
      });

      socketInstance.on("notification", (notif: Notification) => {
        toast.info("Notifikasi Baru", { description: notif.message });
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [session?.user?.id, session?.user?.role]);

  return (
    <SocketContext.Provider
      value={{ socket, notifications, unreadCount, markAsRead, fetchNotifications }}
    >
      {children}
    </SocketContext.Provider>
  );
}
