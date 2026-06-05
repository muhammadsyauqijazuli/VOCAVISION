"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { Notification } from "./notification";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const pathname = usePathname();

  const title = pathname.startsWith("/admin")
    ? "Admin Dashboard"
    : pathname.startsWith("/guru")
      ? "Guru Dashboard"
      : pathname.startsWith("/siswa")
        ? "Murid Dashboard"
        : "Dashboard";

  const subtitle = pathname.startsWith("/admin")
    ? "Kelola user, dataset, dan ringkasan sistem"
    : pathname.startsWith("/guru")
      ? "Pantau siswa, prediksi, dan intervensi"
      : pathname.startsWith("/siswa")
        ? "Lihat prediksi dan insight personal"
        : "Next.js Admin Dashboard Solution";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 md:px-5 2xl:px-10 dark:border-stroke-dark dark:bg-gray-dark">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border px-1.5 py-1 lg:hidden dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A]"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden 2xsm:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
          {title}
        </h1>
        <p className="font-medium">{subtitle}</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 2xsm:gap-4">
        {pathname.startsWith("/siswa") && <Notification />}
        <ThemeToggleSwitch />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
