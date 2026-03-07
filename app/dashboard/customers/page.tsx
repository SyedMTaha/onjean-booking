import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CustomersManagementClient } from "@/components/dashboard/customersPage";

export default function CustomersPage() {
  return (
    <DashboardShell>
      <CustomersManagementClient />
    </DashboardShell>
  );
}
