import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { auth } from "@/lib/auth";
import { getRoleHomePath } from "@/lib/auth/backend-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminUsersManager } from "../_components/admin-users-manager";
import { UsersNavTabs } from "../_components/users-nav-tabs";

export default async function AdminSiswaUsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/admin/users/siswa");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHomePath(session.user.role));
  }

  return (
    <div className="mx-auto w-full max-w-270">
      <Breadcrumb pageName="Manajemen Siswa" />
      <UsersNavTabs />
      <AdminUsersManager
        scopeRole="siswa"
        title="Daftar Akun Siswa"
        description="Kelola akun siswa melalui fitur CRUD: tambah, ubah, dan hapus akun siswa."
        showStudentSyncPanel={false}
      />
    </div>
  );
}
