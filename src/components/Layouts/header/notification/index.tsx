"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "./icons";
import { useSocket } from "@/components/socket-provider";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useRouter } from "next/navigation";

const notificationList = [
  {
    image: "/images/user/user-15.png",
    title: "Piter Joined the Team!",
    subTitle: "Congratulate him",
  },
  {
    image: "/images/user/user-03.png",
    title: "New message",
    subTitle: "Devid sent a new message",
  },
  {
    image: "/images/user/user-26.png",
    title: "New Payment received",
    subTitle: "Check your earnings",
  },
  {
    image: "/images/user/user-28.png",
    title: "Jolly completed tasks",
    subTitle: "Assign new task",
  },
  {
    image: "/images/user/user-27.png",
    title: "Roman Joined the Team!",
    subTitle: "Congratulate him",
  },
];

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useSocket();
  const isMobile = useIsMobile();
  const router = useRouter();

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => {
        setIsOpen(open);
      }}
    >
      <DropdownTrigger
        className="grid size-12 cursor-pointer place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-2 dark:text-white dark:hover:bg-dark-3 dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute top-0 right-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className="border border-stroke bg-white px-3.5 py-3 shadow-md min-[350px]:min-w-[20rem] dark:border-dark-3 dark:bg-gray-dark"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-2.25 py-0.5 text-xs font-medium text-white">
              {unreadCount} new
            </span>
          )}
        </div>

        <ul className="mb-3 max-h-92 space-y-1.5 overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="px-2 py-3 text-center text-sm text-dark-5 dark:text-dark-6">
              Tidak ada notifikasi
            </li>
          ) : (
            notifications.map((item, index) => {
              const dateString = item.created_at.endsWith("Z") ? item.created_at : `${item.created_at}Z`;
              return (
              <li key={index} role="menuitem">
                <button
                  onClick={() => {
                    if (!item.is_read) markAsRead(item.id);
                    setIsOpen(false);
                    router.push('/siswa/catatan-guru');
                  }}
                  className={cn("flex w-full items-start gap-4 rounded-lg px-2 py-1.5 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3 text-left", !item.is_read && "bg-gray-1 dark:bg-dark-2")}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BellIcon />
                  </div>

                  <div>
                    <strong className="block text-sm font-medium text-dark dark:text-white">
                      {item.message}
                    </strong>

                    <span className="text-xs font-medium text-dark-5 dark:text-dark-6">
                      {formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: idLocale })}
                    </span>
                  </div>
                </button>
              </li>
              );
            })
          )}
        </ul>

        <Link
          href="#"
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary transition-colors outline-none hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
        >
          See all notifications
        </Link>
      </DropdownContent>
    </Dropdown>
  );
}
