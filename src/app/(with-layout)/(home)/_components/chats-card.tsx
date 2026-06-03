import { DotIcon } from "@/assets/icons";
import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { getChatsData } from "../fetch";

export async function ChatsCard() {
  const data = await getChatsData();

  return (
    <div className="col-span-12 rounded-[10px] bg-white py-6 shadow-1 xl:col-span-4 dark:bg-gray-dark dark:shadow-card">
      <h2 className="mb-5.5 px-7.5 text-body-2xlg font-bold text-dark dark:text-white">
        Chats
      </h2>

      <ul>
        {data.map((chat, key) => (
          <li key={key}>
            <Link
              href="/"
              className="flex items-center gap-4.5 px-7.5 py-3 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-2 dark:focus-visible:bg-dark-2"
            >
              <div className="relative shrink-0">
                <Image
                  src={chat.profile}
                  width={56}
                  height={56}
                  className="size-14 rounded-full object-cover"
                  alt={"Avatar for " + chat.name}
                />

                <span
                  className={cn(
                    "absolute right-0 bottom-0 size-3.5 rounded-full ring-2 ring-white dark:ring-dark-2",
                    chat.isActive ? "bg-green" : "bg-orange-light",
                  )}
                />
              </div>

              <div className="relative grow">
                <h3 className="font-medium text-dark dark:text-white">
                  {chat.name}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "truncate text-sm font-medium xl:max-w-32 dark:text-dark-5",
                      chat.unreadCount && "text-dark-4 dark:text-dark-6",
                    )}
                  >
                    {chat.lastMessage.content}
                  </span>

                  <DotIcon />

                  <time
                    className="text-xs"
                    dateTime={chat.lastMessage.timestamp}
                  >
                    {formatMessageTime(chat.lastMessage.timestamp)}
                  </time>
                </div>

                {!!chat.unreadCount && (
                  <div className="pointer-events-none absolute top-1/2 right-0 aspect-square max-w-fit -translate-y-1/2 rounded-full bg-primary px-2 py-0.5 text-sm font-medium text-white select-none">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
