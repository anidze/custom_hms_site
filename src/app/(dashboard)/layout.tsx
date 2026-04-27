// Dashboard layout — sidebar + header + content
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { getDB } from "@/lib/db";
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

  let hotelLogoSrc: string | undefined;
  if (session?.hotelId) {
    try {
      const pool = await getDB();
      const result = await pool
        .request()
        .input("id", session.hotelId)
        .query("SELECT logoUrl FROM hotels WHERE id = @id");
      hotelLogoSrc = result.recordset[0]?.logoUrl ?? undefined;
    } catch {
      // fallback to default logo
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar hotelName={session?.hotelName} userFullName={session?.fullName} logoSrc={hotelLogoSrc} />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <TopHeader userFullName={session?.fullName} role="Admin" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

