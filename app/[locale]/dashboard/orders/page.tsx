import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { OrderPage } from "@/components/dashboard/ordersPage";

export default function DashboardOrdersPage() {
  return (
    <DashboardShell>
      <OrderPage />
    </DashboardShell>
  );
}
