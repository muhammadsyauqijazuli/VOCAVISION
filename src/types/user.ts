export type UserRole = "admin" | "guru" | "siswa";

export type UserRecord = {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
};

export type UserFormValues = {
  nama: string;
  email: string;
  password: string;
  role: UserRole;
};
