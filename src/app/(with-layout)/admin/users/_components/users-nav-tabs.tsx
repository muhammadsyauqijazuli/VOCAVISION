"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Manajemen Siswa", href: "/admin/users/siswa" },
  { label: "Manajemen Guru", href: "/admin/users/guru" },
];

export function UsersNavTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-stroke bg-white p-2 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              isActive
                ? "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                : "rounded-lg px-4 py-2 text-sm font-semibold text-dark transition-colors hover:bg-gray-2 dark:text-white dark:hover:bg-dark-2"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
