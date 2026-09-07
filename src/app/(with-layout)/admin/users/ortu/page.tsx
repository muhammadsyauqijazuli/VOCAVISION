import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminUsersManager } from "../_components/admin-users-manager";
import { UsersNavTabs } from "../_components/users-nav-tabs";

export default async function AdminOrangTuaUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/users/ortu");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270">
      <Breadcrumb pageName="Manajemen Orang Tua" />
      <UsersNavTabs />
      <AdminUsersManager
        scopeRole="orang_tua"
        title="Daftar Akun Orang Tua"
        description="Kelola akun orang tua melalui fitur CRUD: tambah, ubah, dan hapus akun orang tua."
      />
    </div>
  );
}
