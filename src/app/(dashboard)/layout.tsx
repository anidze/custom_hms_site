// Dashboard layout — sidebar + content
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import Sidebar from "@/components/navbar/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar hotelName={session?.hotelName} userFullName={session?.fullName} />
      <main className="flex-1 p-8 ml-64">{children}</main>
    </div>
  );
}

