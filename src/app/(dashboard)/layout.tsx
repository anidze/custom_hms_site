// Dashboard layout — sidebar + header + content
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import Sidebar from "@/components/navbar/Sidebar";
import TopHeader from "@/components/navbar/TopHeader";

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
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopHeader userFullName={session?.fullName} role="Admin" />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

