import { DashboardClient } from "@/components/dashboard/dashboardPage";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardClient />
    </DashboardShell>
  );
}
