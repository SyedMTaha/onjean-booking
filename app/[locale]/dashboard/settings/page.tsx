import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SettingsManagementClient } from "@/components/dashboard/settingsPage";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <SettingsManagementClient />
    </DashboardShell>
  );
}
