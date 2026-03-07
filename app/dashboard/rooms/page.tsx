import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { RoomsManagementClient } from "@/components/dashboard/roomsPage";

export default function RoomsPage() {
  return (
    <DashboardShell>
      <RoomsManagementClient />
    </DashboardShell>
  );
}
