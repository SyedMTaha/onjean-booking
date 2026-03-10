import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { MenuManagementClient } from "@/components/dashboard/menuPage";

export default function DashboardMenuPage() {
  return (
    <DashboardShell>
      <MenuManagementClient />
    </DashboardShell>
  );
}
