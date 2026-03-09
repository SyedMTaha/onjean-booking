import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuManagementClient } from "@/components/dashboard/menuManagementPage";

export default function DashboardMenuPage() {
  return (
    <DashboardShell>
      <MenuManagementClient />
    </DashboardShell>
  );
}
