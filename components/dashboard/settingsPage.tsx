"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Lock, Globe, Palette, CreditCard, Mail, User, Building, MapPin, Phone, Mail as MailIcon } from "lucide-react";
import { toast } from "sonner";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DEFAULT_SETTINGS,
  getDashboardSettings,
  isPermissionDeniedError,
  updateAdminCredentialPassword,
  updateAdminProfileSettings,
  updateHotelInfoSettings,
  updateNotificationSettings,
} from "@/lib/settingsService";

export function SettingsManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Admin Profile State
  const [adminData, setAdminData] = useState(DEFAULT_SETTINGS.adminProfile);

  // Hotel Information State
  const [hotelData, setHotelData] = useState(DEFAULT_SETTINGS.hotelInfo);

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    ...DEFAULT_SETTINGS.notifications,
  });

  // Admin Profile Changes
  const [adminChanges, setAdminChanges] = useState(adminData);
  const [hotelChanges, setHotelChanges] = useState(hotelData);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getDashboardSettings();
      setAdminData(settings.adminProfile);
      setHotelData(settings.hotelInfo);
      setNotifications(settings.notifications);
      setAdminChanges(settings.adminProfile);
      setHotelChanges(settings.hotelInfo);
    } catch (error) {
      console.error(error);
      if (isPermissionDeniedError(error)) {
        toast.error("Settings collection is blocked by Firestore rules. Using default values.");
      } else {
        toast.error("Failed to load settings from database.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadSettings();
    }
  }, [isAdminAuthenticated]);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminChanges((prev) => ({ ...prev, [name]: value }));
  };

  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHotelChanges((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAdminProfile = async () => {
    setIsLoading(true);
    try {
      await updateAdminProfileSettings(adminChanges);
      setAdminData(adminChanges);
      toast.success("Admin profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update admin profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHotelInfo = async () => {
    setIsLoading(true);
    try {
      await updateHotelInfoSettings(hotelChanges);
      setHotelData(hotelChanges);
      toast.success("Hotel information updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update hotel information.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      if (!auth) {
        throw new Error("Authentication service not available");
      }
      
      const authEmail = auth.currentUser?.email || adminData.email;
      await updateAdminCredentialPassword(authEmail, securityData.currentPassword, securityData.newPassword);

      // Keep Firebase Auth password in sync with adminCredentials collection.
      if (auth.currentUser) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email || authEmail,
          securityData.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, securityData.newPassword);
      } else {
        throw new Error("No authenticated admin session found. Please sign in again.");
      }

      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await updateNotificationSettings(notifications);
      toast.success("Notification settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notification settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || "A"}${lastName?.[0] || "D"}`.toUpperCase();
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

        <div className="grid grid-cols-1 gap-6">
          {/* Left Column - Admin Profile & Security (now full width) */}
          <div className="space-y-6">
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
                {/* <Button className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl h-10 px-4">Change Photo</Button> */}
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
                <Button
                  className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl"
                  onClick={() => setAdminChanges(adminData)}
                >
                  Cancel
                </Button>
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
                <Button
                  className="bg-[#F1F5F9] text-gray-900 hover:bg-gray-200 rounded-xl"
                  onClick={() => setHotelChanges(hotelData)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveHotelInfo} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Save Changes
                </Button>
              </div>
            </Card>

           
          </div>

          {/* Right Column - Notifications & Quick Actions (commented out) */}
          {/**
          <div className="space-y-6">
            ...existing right column code...
          </div>
          */}
        </div>
      </div>
    </div>
  );
}
