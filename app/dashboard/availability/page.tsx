import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { AvailabilityManagementClient } from "@/components/dashboard/availabilityPage";

export default function AvailabilityPage() {
  return (
    <DashboardShell>
      <AvailabilityManagementClient />
    </DashboardShell>
  );
}
