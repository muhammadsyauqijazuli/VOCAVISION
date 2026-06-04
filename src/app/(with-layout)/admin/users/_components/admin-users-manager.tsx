"use client";

import { Alert } from "@/components/ui-elements/alert";
import {
  type UserFormValues,
  type UserRecord,
  type UserRole,
} from "@/types/user";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const DEFAULT_FORM: UserFormValues = {
  nama: "",
  email: "",
  password: "",
  role: "siswa",
};

type AdminUsersManagerProps = {
  scopeRole?: Extract<UserRole, "guru" | "siswa">;
  title?: string;
  description?: string;
  showStudentSyncPanel?: boolean;
};

type UserApiRecord = UserRecord & {
  name?: string;
};

function formatRole(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AdminUsersManager({
  scopeRole,
  title = "Registered Users",
  description = "User dikelola pada halaman ini. Hanya role sesuai halaman yang ditampilkan.",
  showStudentSyncPanel = true,
}: AdminUsersManagerProps) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingStudents, setIsSyncingStudents] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{
    total_students: number;
    linked_students: number;
    orphan_students: number;
  } | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(scopeRole ?? "");
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(25);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<UserRecord | null>(
    null,
  );
  const [formData, setFormData] = useState<UserFormValues>({
    ...DEFAULT_FORM,
    role: scopeRole ?? DEFAULT_FORM.role,
  });

  async function fetchUsers() {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (scopeRole) {
        params.set("role", scopeRole);
      } else if (roleFilter) {
        params.set("role", roleFilter);
      }

      // pagination params
      if (perPage && perPage > 0) {
        params.set("page", String(page));
        params.set("page_size", String(perPage));
      } else {
        // perPage === 0 means 'All'
        params.set("page_size", "0");
      }

      const response = await fetch(
        `/api/users${params.toString() ? `?${params.toString()}` : ""}`,
        {
          credentials: "include",
        },
      );

      const payload = (await response.json()) as
        | UserApiRecord[]
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          (payload as { message?: string }).message || "Gagal memuat user",
        );
      }

      // payload may be either paged object or legacy array
      if (Array.isArray(payload)) {
        const normalizedUsers: UserRecord[] = (payload as UserApiRecord[]).map(
          (user) => ({
            id: user.id,
            nama: user.nama ?? user.name ?? "Tanpa Nama",
            email: user.email,
            role: user.role,
          }),
        );
        setUsers(
          scopeRole
            ? normalizedUsers.filter((u: UserRecord) => u.role === scopeRole)
            : normalizedUsers,
        );
        setTotalItems(normalizedUsers.length);
      } else {
        const pagePayload = payload as any;
        const normalizedUsers: UserRecord[] = (pagePayload.items ?? []).map(
          (user: UserApiRecord) => ({
            id: user.id,
            nama: user.nama ?? user.name ?? "Tanpa Nama",
            email: user.email,
            role: user.role,
          }),
        );
        setUsers(
          scopeRole
            ? normalizedUsers.filter((u: UserRecord) => u.role === scopeRole)
            : normalizedUsers,
        );
        setTotalItems(pagePayload.total ?? normalizedUsers.length);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat user");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function fetchStudentSyncSummary() {
    try {
      // backend exposes /api/users/sync/student-summary and also root?action=student-sync-summary
      let response = await fetch("/api/users/sync/student-summary", {
        credentials: "include",
      });

      if (!response.ok) {
        // fallback to action-based endpoint
        response = await fetch("/api/users?action=student-sync-summary", {
          credentials: "include",
        });
      }

      const payload = (await response.json()) as
        | {
            total_students: number;
            linked_students: number;
            orphan_students: number;
          }
        | { message?: string };

      if (!response.ok) {
        throw new Error(
          (payload as { message?: string }).message ||
            "Gagal memuat ringkasan sinkronisasi",
        );
      }

      setSyncSummary(
        payload as {
          total_students: number;
          linked_students: number;
          orphan_students: number;
        },
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memuat ringkasan sinkronisasi",
      );
    }
  }

  // Auto-search (debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, search]);

  useEffect(() => {
    if (scopeRole) {
      setRoleFilter(scopeRole);
      setFormData((current) => ({ ...current, role: scopeRole }));
    }
  }, [scopeRole]);

  useEffect(() => {
    void fetchUsers();
  }, [search, roleFilter, page, scopeRole]); // Trigger fetch when any dependency changes



  useEffect(() => {
    if (!showStudentSyncPanel) {
      return;
    }

    void fetchStudentSyncSummary();
  }, [showStudentSyncPanel]);

  const isEditing = Boolean(editingUserId);

  function closeFormModal() {
    setIsFormModalOpen(false);
    setEditingUserId(null);
    setFormData({
      ...DEFAULT_FORM,
      role: scopeRole ?? DEFAULT_FORM.role,
    });
  }

  function startCreateMode() {
    setEditingUserId(null);
    setIsFormModalOpen(true);
    setFormData({
      ...DEFAULT_FORM,
      role: scopeRole ?? DEFAULT_FORM.role,
    });
  }

  function startEditMode(user: UserRecord) {
    setEditingUserId(user.id);
    setIsFormModalOpen(true);
    setFormData({
      nama: user.nama,
      email: user.email,
      password: "",
      role: user.role,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.nama.trim() || !formData.email.trim() || !formData.role) {
      toast.error("Nama, email, dan role wajib diisi");
      return;
    }

    if (!isEditing && !formData.password.trim()) {
      toast.error("Password wajib diisi untuk user baru");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        editingUserId ? `/api/users/${editingUserId}` : "/api/users",
        {
          method: editingUserId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            nama: formData.nama.trim(),
            email: formData.email.trim(),
            role: formData.role,
            ...(formData.password.trim()
              ? { password: formData.password.trim() }
              : {}),
          }),
        },
      );

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal menyimpan user");
      }

      toast.success(
        editingUserId ? "User berhasil diperbarui" : "User berhasil dibuat",
      );
      closeFormModal();
      await fetchUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan user",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(user: UserRecord) {
    setPendingDeleteUser(user);
  }

  async function confirmDeleteUser() {
    if (!pendingDeleteUser) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${pendingDeleteUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal menghapus user");
      }

      toast.success("User berhasil dihapus");
      setPendingDeleteUser(null);
      await fetchUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus user",
      );
    }
  }

  async function handleSyncStudentAccounts() {
    setIsSyncingStudents(true);

    try {
      const response = await fetch("/api/users/sync-students", {
        method: "POST",
        credentials: "include",
      });

      const payload = (await response.json()) as {
        message?: string;
        created_users?: number;
        linked_students?: number;
        orphan_students?: number;
        login_note?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal sinkron akun siswa");
      }

      toast.success(payload.message || "Akun siswa berhasil disinkronisasi");
      if (payload.login_note) {
        toast.message(payload.login_note);
      }

      await Promise.all([fetchUsers(), fetchStudentSyncSummary()]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal sinkron akun siswa",
      );
    } finally {
      setIsSyncingStudents(false);
    }
  }

  const formModal = isFormModalOpen
    ? createPortal(
        <div className="fixed inset-0 z-99999 flex h-screen w-screen items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={closeFormModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={isEditing ? "Edit User" : "Create User"}
            className="relative z-100000 w-full max-w-2xl overflow-hidden rounded-2xl border border-stroke bg-white shadow-6 dark:border-dark-3 dark:bg-gray-dark"
          >
            <div className="flex items-start justify-between border-b border-stroke px-5 py-4 dark:border-dark-3">
              <div>
                <h3 className="text-heading-6 font-bold text-dark dark:text-white">
                  {isEditing ? "Edit User" : "Create User"}
                </h3>
                <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                  {isEditing
                    ? "Perubahan berlaku setelah disimpan. Password boleh dikosongkan jika tidak diganti."
                    : "Buat akun admin, guru, atau siswa dari sini. Password tidak disimpan di frontend."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">
                  Nama
                </label>
                <input
                  value={formData.nama}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      nama: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 transition-all duration-200 ease-out outline-none placeholder:text-dark-4/60 hover:border-primary/40 hover:shadow-sm focus:border-primary focus:shadow-md dark:border-dark-3 dark:hover:border-primary/50"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">
                  Email
                </label>
                <input
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 transition-all duration-200 ease-out outline-none placeholder:text-dark-4/60 hover:border-primary/40 hover:shadow-sm focus:border-primary focus:shadow-md dark:border-dark-3 dark:hover:border-primary/50"
                  placeholder="nama@sekolah.id"
                  type="email"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">
                  Password
                </label>
                <input
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 transition-all duration-200 ease-out outline-none placeholder:text-dark-4/60 hover:border-primary/40 hover:shadow-sm focus:border-primary focus:shadow-md dark:border-dark-3 dark:hover:border-primary/50"
                  placeholder={
                    isEditing ? "Kosongkan jika tidak diubah" : "Password awal"
                  }
                  type="password"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark dark:text-white">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      role: event.target.value as UserRole,
                    }))
                  }
                  disabled={Boolean(scopeRole)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 transition-all duration-200 ease-out outline-none hover:border-primary/40 hover:shadow-sm focus:border-primary focus:shadow-md dark:border-dark-3 dark:hover:border-primary/50"
                >
                  <option value="admin">Admin</option>
                  <option value="guru">Guru</option>
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-lg border border-stroke px-4 py-2 font-medium text-dark transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-gray-2 hover:shadow-sm active:translate-y-0 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className="grid gap-6">
        <section className="rounded-2xl border border-stroke bg-white p-5 shadow-1 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl dark:border-dark-3 dark:bg-gray-dark dark:hover:shadow-2xl">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-heading-6 font-bold text-dark dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-dark-4 dark:text-dark-6">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={startCreateMode}
              className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
            >
              New User
            </button>
          </div>

          {showStudentSyncPanel && scopeRole !== "guru" && (
            <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="text-lg font-bold text-dark dark:text-white">
                    Sinkron Akun Siswa
                  </h4>
                  <p className="text-sm text-dark-4 dark:text-dark-6">
                    Buat akun website otomatis dari data students yang belum
                    punya user_id. Email login memakai NISN@siswa.local dan
                    password default NISN.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncStudentAccounts}
                  disabled={
                    isSyncingStudents ||
                    Boolean(syncSummary && syncSummary.orphan_students === 0)
                  }
                  className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSyncingStudents
                    ? "Menyinkronkan..."
                    : "Sinkron Akun Siswa"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-dark-2">
                  <p className="text-xs tracking-wide text-dark-4 uppercase dark:text-dark-6">
                    Total Students
                  </p>
                  <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                    {syncSummary?.total_students ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-dark-2">
                  <p className="text-xs tracking-wide text-dark-4 uppercase dark:text-dark-6">
                    Sudah Terhubung
                  </p>
                  <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                    {syncSummary?.linked_students ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-dark-2">
                  <p className="text-xs tracking-wide text-dark-4 uppercase dark:text-dark-6">
                    Belum Punya Akun
                  </p>
                  <p className="mt-1 text-2xl font-bold text-dark dark:text-white">
                    {syncSummary?.orphan_students ?? 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full items-center gap-3"
            >
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari nama atau email"
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 transition-all duration-200 ease-out outline-none placeholder:text-dark-4/60 hover:border-primary/40 hover:shadow-sm focus:border-primary focus:shadow-md dark:border-dark-3 dark:hover:border-primary/50"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-primary px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
              >
                Search
              </button>
            </form>
            {!scopeRole && (
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 transition-all duration-200 ease-out outline-none hover:border-primary/40 hover:shadow-sm focus:border-primary focus:shadow-md sm:max-w-48 dark:border-dark-3 dark:hover:border-primary/50"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
            )}
          </div>

          {pendingDeleteUser && (
            <div className="mb-4 rounded-2xl border border-[#FFB800]/30 bg-[#FEF5DE]/70 p-4 shadow-sm transition-all duration-300 ease-out dark:bg-[#1B1B24]">
              <Alert
                variant="warning"
                title="Konfirmasi hapus user"
                description={`User ${pendingDeleteUser.nama} (${pendingDeleteUser.email}) akan dihapus permanen dari sistem.`}
                className="border-none bg-transparent p-0 shadow-none md:p-0 dark:bg-transparent"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingDeleteUser(null)}
                  className="rounded-lg border border-stroke px-4 py-2 font-medium text-dark transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-gray-2 hover:shadow-sm active:translate-y-0 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md active:translate-y-0"
                >
                  Hapus User
                </button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-stroke transition-shadow duration-300 ease-out hover:shadow-lg dark:border-dark-3">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stroke dark:divide-dark-3">
                <thead className="bg-gray-2 dark:bg-dark-2">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-dark dark:text-white">
                      Role
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-dark dark:text-white">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-stroke transition-opacity dark:divide-dark-3 ${isLoading && users.length > 0 ? "opacity-50" : ""}`}>
                  {isLoading && users.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-dark-4"
                        colSpan={4}
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-dark-4"
                        colSpan={4}
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors duration-200 ease-out hover:bg-gray-1 dark:hover:bg-dark-2/60"
                      >
                        <td className="px-4 py-4 font-medium text-dark dark:text-white">
                          {user.nama}
                        </td>
                        <td className="px-4 py-4 text-dark-4 dark:text-dark-6">
                          {user.email}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-gray-2 px-3 py-1 text-xs font-semibold tracking-wide text-dark uppercase dark:bg-dark-2 dark:text-white">
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditMode(user)}
                              className="rounded-md border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-gray-2 hover:shadow-sm active:translate-y-0 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md active:translate-y-0"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="text-sm text-dark-4 dark:text-dark-6">
              Menampilkan{" "}
              {perPage === 0 ? totalItems : Math.min(totalItems, perPage)} dari{" "}
              {totalItems} entri
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="cursor-pointer rounded-lg border border-stroke px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:hover:bg-dark-4"
              >
                Prev
              </button>
              <div className="px-3 py-2 text-sm">
                Halaman {page} dari{" "}
                {perPage === 0
                  ? 1
                  : Math.max(1, Math.ceil(totalItems / perPage))}
              </div>
              <button
                onClick={() =>
                  setPage((p) => {
                    if (perPage === 0) return p;
                    const last = Math.max(1, Math.ceil(totalItems / perPage));
                    return Math.min(last, p + 1);
                  })
                }
                disabled={
                  perPage !== 0 &&
                  page >= Math.max(1, Math.ceil(totalItems / perPage))
                }
                className="cursor-pointer rounded-lg border border-stroke px-3 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:hover:bg-dark-4"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {formModal}
    </>
  );
}
