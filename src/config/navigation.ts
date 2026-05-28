import type { UserRole } from "@/types/user";
import * as Icons from "@/components/Layouts/sidebar/icons";

export type NavConfigItem = {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  allowedRoles: UserRole[];
  section?: string;
};

export const NAV_CONFIG: NavConfigItem[] = [
  // Admin
  {
    title: "Dashboard Utama",
    href: "/admin/dashboard",
    icon: Icons.HomeIcon,
    allowedRoles: ["admin"],
    section: "MAIN MENU",
  },
  {
    title: "Manajemen Users",
    href: "/admin/users",
    icon: Icons.User,
    allowedRoles: ["admin"],
    section: "MAIN MENU",
  },
  {
    title: "Manajemen Dataset",
    href: "/admin/dataset",
    icon: Icons.Table,
    allowedRoles: ["admin"],
    section: "MAIN MENU",
  },
  {
    title: "Monitoring Sistem",
    href: "/admin/monitoring",
    icon: Icons.PieChart,
    allowedRoles: ["admin"],
    section: "MAIN MENU",
  },
  {
    title: "Laporan Global",
    href: "/admin/reports",
    icon: Icons.PieChart,
    allowedRoles: ["admin"],
    section: "MAIN MENU",
  },

  // Guru
  {
    title: "Dashboard Guru",
    href: "/guru/dashboard",
    icon: Icons.HomeIcon,
    allowedRoles: ["guru"],
    section: "MAIN MENU",
  },
  {
    title: "Data Siswa & Kelas",
    href: "/guru/students",
    icon: Icons.Table,
    allowedRoles: ["guru"],
    section: "MAIN MENU",
  },
  {
    title: "Hasil Prediksi Siswa",
    href: "/guru/predictions",
    icon: Icons.PieChart,
    allowedRoles: ["guru"],
    section: "MAIN MENU",
  },
  {
    title: "Ekspor Laporan Kelas",
    href: "/guru/reports",
    icon: Icons.Table,
    allowedRoles: ["guru"],
    section: "MAIN MENU",
  },

  // Siswa
  {
    title: "Dashboard Siswa",
    href: "/siswa/dashboard",
    icon: Icons.HomeIcon,
    allowedRoles: ["siswa"],
    section: "MAIN MENU",
  },
  {
    title: "Profil Pribadi",
    href: "/siswa/profile",
    icon: Icons.User,
    allowedRoles: ["siswa"],
    section: "MAIN MENU",
  },
  {
    title: "Update Data",
    href: "/siswa/update-data",
    icon: Icons.Alphabet,
    allowedRoles: ["siswa"],
    section: "MAIN MENU",
  },
  {
    title: "Hasil & Insight Prediksi",
    href: "/siswa/insight",
    icon: Icons.PieChart,
    allowedRoles: ["siswa"],
    section: "MAIN MENU",
  },
];

export default NAV_CONFIG;
