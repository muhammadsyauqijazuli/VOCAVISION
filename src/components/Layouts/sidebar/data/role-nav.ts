import type { UserRole } from "@/types/user";
import * as Icons from "../icons";

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

const ADMIN_NAV: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Manajemen Users",
        url: "/admin/users",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Upload Dataset",
        url: "/admin/dataset",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Hasil Prediksi Siswa",
        url: "/admin/predictions",
        icon: Icons.PieChart,
        items: [],
      },
      {
        title: "Analisis Data",
        url: "/analytics",
        icon: Icons.PieChart,
        items: [],
      },
    ],
  },
];

const GURU_NAV: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/guru/dashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Kelas Anda",
        url: "/guru/shap",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Nilai Siswa",
        url: "/guru/shap-insights",
        icon: Icons.Alphabet,
        items: [],
      },
      {
        title: "Analisis Data",
        url: "/analytics",
        icon: Icons.PieChart,
        items: [],
      },
    ],
  },
];

const SISWA_NAV: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/siswa/dashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Jadwal",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Tugas",
        url: "/tables",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Nilai",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
    ],
  },
];

export function getRoleNavData(role?: UserRole | null): NavSection[] {
  switch (role) {
    case "admin":
      return ADMIN_NAV;
    case "guru":
      return GURU_NAV;
    case "siswa":
    default:
      return SISWA_NAV;
  }
}
