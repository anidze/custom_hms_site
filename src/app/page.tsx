
import { redirect } from "next/navigation";

// ✅ Root page — რედირექტი login-ზე
export default function RootPage() {
  redirect("/login");
}
