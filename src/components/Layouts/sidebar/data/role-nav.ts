import type { UserRole } from "@/types/user";
import type * as Icons from "../icons";
import NAV_CONFIG from "@/config/navigation";

export type NavItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<Icons.PropsType>;
  items: { title: string; url: string }[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

// Build sections from NAV_CONFIG and filter by role
export function getRoleNavData(role?: UserRole | null): NavSection[] {
  const filtered = NAV_CONFIG.filter((i) => {
    if (!i.allowedRoles || i.allowedRoles.length === 0) return true;
    if (!role) return false;
    return i.allowedRoles.includes(role);
  });

  const items: NavItem[] = filtered.map((i) => ({
    title: i.title,
    url: i.href,
    icon: i.icon as unknown as React.ComponentType<Icons.PropsType>,
    items: [],
  }));

  return [
    {
      label: "MAIN MENU",
      items,
    },
  ];
}
