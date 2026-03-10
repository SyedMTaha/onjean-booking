import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RevenueManagementClient } from "@/components/dashboard/revenuePage";

export default function RevenuePage() {
  return (
    <DashboardShell>
      <RevenueManagementClient />
    </DashboardShell>
  );
}
