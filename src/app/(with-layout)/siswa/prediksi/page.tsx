import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PrediksiSiswaRedirectPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=/siswa/prediksi");
  }

  // Arahkan langsung ke halaman detail menggunakan ID user yang sedang login
  redirect(`/siswa/prediksi/${session.user.id}`);
}
