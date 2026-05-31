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
    title: "Prediksi Siswa",
    href: "/admin/predictions",
    icon: Icons.PieChart,
    allowedRoles: ["admin"],
    section: "MAIN MENU",
  },
  {
    title: "Analisis & Laporan",
    href: "/admin/analytics",
    icon: Icons.FourCircle,
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
    title: "Analisis dan laporan",
    href: "/guru/analytics",
    icon: Icons.FourCircle,
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
