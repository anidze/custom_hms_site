// Server component — checks that the signed-in user has roleId === 4 (Housekeeping)
// before rendering the client-side UI.
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import HousekeepingClient from "@/components/housekeeping/HousekeepingClient";

export default async function HousekeepingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hms-session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) redirect("/login");
  if (session.roleId !== 4) redirect("/dashboard");

  return <HousekeepingClient />;
}
