import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SocketProvider } from "@/components/socket-provider";

export default async function WithLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = session?.user?.role ?? "siswa";

  return (
    <SidebarProvider>
      <SocketProvider>
        <div className="flex min-h-screen">
          <Sidebar role={role} />

          <div className="relative flex flex-1 flex-col overflow-x-hidden bg-gray-2 dark:bg-[#020d1a]">
            <Header />

            <main className="isolate mx-auto w-full max-w-(--breakpoint-2xl) overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </SocketProvider>
    </SidebarProvider>
  );
}
