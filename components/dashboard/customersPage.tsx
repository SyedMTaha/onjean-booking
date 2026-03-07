"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Search, Users, TrendingUp, Plus, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

type CustomerTier = "gold" | "silver" | "platinum" | "bronze";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  tier: CustomerTier;
  bookings: number;
  totalSpent: number;
  lastVisit: string;
}

// Mock customer data
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    tier: "gold",
    bookings: 12,
    totalSpent: 5400,
    lastVisit: "2026-03-06",
  },
  {
    id: "2",
    name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, USA",
    tier: "silver",
    bookings: 8,
    totalSpent: 3200,
    lastVisit: "2026-03-07",
  },
  {
    id: "3",
    name: "James Rodriguez",
    email: "james.r@email.com",
    phone: "+1 (555) 345-6789",
    location: "Miami, USA",
    tier: "platinum",
    bookings: 15,
    totalSpent: 7800,
    lastVisit: "2026-03-05",
  },
  {
    id: "4",
    name: "Sofia Anderson",
    email: "sofia.a@email.com",
    phone: "+1 (555) 456-7890",
    location: "Chicago, USA",
    tier: "bronze",
    bookings: 5,
    totalSpent: 2100,
    lastVisit: "2026-03-10",
  },
  {
    id: "5",
    name: "David Kim",
    email: "david.kim@email.com",
    phone: "+1 (555) 567-8901",
    location: "Seattle, USA",
    tier: "gold",
    bookings: 10,
    totalSpent: 4500,
    lastVisit: "2026-03-08",
  },
  {
    id: "6",
    name: "Isabella Martinez",
    email: "isabella.m@email.com",
    phone: "+1 (555) 678-9012",
    location: "Boston, USA",
    tier: "platinum",
    bookings: 18,
    totalSpent: 9200,
    lastVisit: "2026-03-08",
  },
];

function getTierColor(tier: CustomerTier): { bg: string; text: string; initials: string } {
  switch (tier) {
    case "gold":
      return { bg: "bg-blue-500", text: "text-blue-600", initials: "bg-blue-100" };
    case "silver":
      return { bg: "bg-slate-500", text: "text-slate-600", initials: "bg-slate-100" };
    case "platinum":
      return { bg: "bg-gray-900", text: "text-gray-900", initials: "bg-gray-100" };
    case "bronze":
      return { bg: "bg-orange-500", text: "text-orange-600", initials: "bg-orange-100" };
    default:
      return { bg: "bg-gray-500", text: "text-gray-600", initials: "bg-gray-100" };
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function CustomersManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Simulate loading
      setTimeout(() => {
        setCustomers(mockCustomers);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch customers.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access customers.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchCustomers();
    }
  }, [isAdminAuthenticated]);

  const filteredCustomers = customers.filter((customer) => {
    const needle = search.trim().toLowerCase();
    if (needle.length === 0) return true;

    return (
      customer.name.toLowerCase().includes(needle) ||
      customer.email.toLowerCase().includes(needle) ||
      customer.phone.toLowerCase().includes(needle)
    );
  });

  const totals = {
    total: customers.length,
    activeThisMonth: customers.filter((c) => {
      const lastVisit = new Date(c.lastVisit);
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return lastVisit >= monthAgo;
    }).length,
    newCustomers: Math.floor(customers.length * 0.065),
    avgLifetimeValue: Math.round(
      customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
    ),
  };

  const exportList = () => {
    const rows = filteredCustomers.map((customer) => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
      tier: customer.tier,
      bookings: customer.bookings,
      totalSpent: customer.totalSpent,
      lastVisit: customer.lastVisit,
    }));

    const header = ["Name", "Email", "Phone", "Location", "Tier", "Bookings", "Total Spent", "Last Visit"];
    const csvBody = rows.map((row) => [
      row.name,
      row.email,
      row.phone,
      row.location,
      row.tier,
      row.bookings,
      row.totalSpent,
      row.lastVisit,
    ]);

    const csv = [header, ...csvBody]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] py-6 md:py-8">
      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer information and booking history</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, email, or phone..."
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>

          <Button onClick={exportList} className="h-10 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-xl lg:ml-auto border">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.total.toLocaleString()}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Active This Month</p>
                <p className="text-3xl font-semibold text-blue-600 mt-2">{totals.activeThisMonth}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">New Customers</p>
                <p className="text-3xl font-semibold text-teal-600 mt-2">{totals.newCustomers}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Lifetime Value</p>
                <p className="text-3xl font-semibold text-purple-600 mt-2">${totals.avgLifetimeValue.toLocaleString()}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No customers found.</div>
          ) : (
            filteredCustomers.map((customer) => {
              const tierColor = getTierColor(customer.tier);
              const initials = getInitials(customer.name);

              return (
                <Card
                  key={customer.id}
                  className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header with Avatar and Tier */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`h-12 w-12 rounded-lg ${tierColor.bg} text-white flex items-center justify-center font-bold text-lg shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <Badge variant="outline" className={`mt-1 capitalize text-xs ${tierColor.text}`}>
                            {customer.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-700">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-700">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="text-gray-700">{customer.location}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t border-gray-100 pt-3 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Bookings</p>
                        <p className="font-semibold text-gray-900 mt-1">{customer.bookings}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Spent</p>
                        <p className="font-semibold text-gray-900 mt-1">${(customer.totalSpent / 1000).toFixed(1)}k</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Last Visit</p>
                        <p className="font-semibold text-gray-900 mt-1">{customer.lastVisit.slice(5)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
