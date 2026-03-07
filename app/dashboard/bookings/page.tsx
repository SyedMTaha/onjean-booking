import { BookingsManagementClient } from "@/components/dashboard/bookingsPage";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardBookingsPage() {
  return (
    <DashboardShell>
      <BookingsManagementClient />
    </DashboardShell>
  );
}
