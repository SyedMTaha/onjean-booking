"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Lock, Globe, Palette, CreditCard, Mail, User, Building, MapPin, Phone, Mail as MailIcon } from "lucide-react";
import { toast } from "sonner";

export function SettingsManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Profile State
  const [adminData, setAdminData] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hotel.com",
    phone: "+1 (555) 987-6543",
  });

  // Hotel Information State
  const [hotelData, setHotelData] = useState({
    hotelName: "Onjean Hotel",
    address: "123 Main Street, New York, NY 10001",
    contactEmail: "contact@onjeahotel.com",
    phone: "+1 (555) 123-4567",
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    desktopNotifications: true,
  });

  // Admin Profile Changes
  const [adminChanges, setAdminChanges] = useState(adminData);
  const [hotelChanges, setHotelChanges] = useState(hotelData);

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access settings.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminChanges((prev) => ({ ...prev, [name]: value }));
  };

  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHotelChanges((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAdminProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAdminData(adminChanges);
      toast.success("Admin profile updated successfully");
      setIsLoading(false);
    }, 500);
  };

  const handleSaveHotelInfo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHotelData(hotelChanges);
      toast.success("Hotel information updated successfully");
      setIsLoading(false);
    }, 500);
  };

  const handleUpdatePassword = () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
      setIsLoading(false);
    }, 500);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
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
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Admin Profile & Security */}
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Profile Section */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <User className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Admin Profile</h2>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xl shrink-0">
                    {getInitials(adminData.firstName, adminData.lastName)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{adminData.firstName} {adminData.lastName}</p>
                    <p className="text-sm text-gray-600">Administrator</p>
                  </div>
                </div>
                <Button className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl h-10 px-4">Change Photo</Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <Input
                      name="firstName"
                      placeholder="Enter first name"
                      value={adminChanges.firstName}
                      onChange={handleAdminChange}
                      className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <Input
                      name="lastName"
                      placeholder="Enter last name"
                      value={adminChanges.lastName}
                      onChange={handleAdminChange}
                      className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={adminChanges.email}
                    onChange={handleAdminChange}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    name="phone"
                    placeholder="Enter phone number"
                    value={adminChanges.phone}
                    onChange={handleAdminChange}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl">Cancel</Button>
                <Button onClick={handleSaveAdminProfile} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Save Changes
                </Button>
              </div>
            </Card>

             {/* Security Section */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <Lock className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUpdatePassword} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Update Password
                </Button>
              </div>
            </Card>

            {/* Hotel Information Section */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <Building className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Hotel Information</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                  <Input
                    name="hotelName"
                    placeholder="Enter hotel name"
                    value={hotelChanges.hotelName}
                    onChange={handleHotelChange}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input
                    name="address"
                    placeholder="Enter hotel address"
                    value={hotelChanges.address}
                    onChange={handleHotelChange}
                    className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                    <Input
                      name="contactEmail"
                      type="email"
                      placeholder="Enter contact email"
                      value={hotelChanges.contactEmail}
                      onChange={handleHotelChange}
                      className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      name="phone"
                      placeholder="Enter phone number"
                      value={hotelChanges.phone}
                      onChange={handleHotelChange}
                      className="bg-gray-50 border-gray-300 placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl">Cancel</Button>
                <Button onClick={handleSaveHotelInfo} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Save Changes
                </Button>
              </div>
            </Card>

           
          </div>

          {/* Right Column - Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Notifications Section */}
            <Card className="p-6 bg-white border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <Bell className="h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive booking updates</p>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      notifications.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                        notifications.emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Desktop Notifications</p>
                      <p className="text-sm text-gray-600">Browser notifications</p>
                    </div>
                    <button
                      onClick={() => setNotifications((prev) => ({ ...prev, desktopNotifications: !prev.desktopNotifications }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        notifications.desktopNotifications ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                          notifications.desktopNotifications ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions Section */}
            <Card className="p-6 bg-white border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>

              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Globe className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Language & Region</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Palette className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Appearance</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Billing & Plans</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <MailIcon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Email Templates</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
