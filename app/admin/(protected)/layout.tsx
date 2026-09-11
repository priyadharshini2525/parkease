
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/adminAuth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}

