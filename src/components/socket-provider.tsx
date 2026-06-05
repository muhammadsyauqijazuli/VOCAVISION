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
        prev.map((n) => (n.id === id ? { ...n, is_read: true } as any : n))
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
        // We need the backend student_id. The session user.id is the User ID.
        // The backend `__init__.py` expects `student_id`. Wait, we should send the User ID or let the backend look up the student ID.
        // Wait, interventions.py emits to `student_id`, not `user_id`.
        // Let's send the user_id, and let the backend handle the join, or modify the frontend.
        // We will just emit the join event with user_id, and we should modify the backend `on_join` to find the student_id!
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
