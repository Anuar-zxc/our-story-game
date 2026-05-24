import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  return <DashboardContent user={{ name: user.name }} />;
}
