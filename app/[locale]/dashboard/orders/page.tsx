import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrdersPage } from "@/components/dashboard/ordersPage";

export default function DashboardOrdersPage() {
  return (
    <DashboardShell>
      <OrdersPage />
    </DashboardShell>
  );
}
