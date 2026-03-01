import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile - 78 On Jean",
  description: "Manage your profile and bookings.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">My Profile</h1>
          <p className="text-xl text-gray-600">Profile page - coming soon with Firebase authentication</p>
          <p className="text-gray-600 mt-4">
            Once you sign in, you'll be able to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-2">
            <li>View your booking history</li>
            <li>Manage your account details</li>
            <li>Update payment information</li>
            <li>Track upcoming reservations</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
