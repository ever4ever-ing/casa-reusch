import { AdminPanel } from "@/components/admin/AdminPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Reusch Models",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel />;
}
