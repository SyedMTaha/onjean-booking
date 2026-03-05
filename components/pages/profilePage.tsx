import Link from "next/link";

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Profile</h1>
          <p className="text-lg text-gray-600 mb-8">Manage your account, bookings, and orders.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/booking"
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Bookings</h2>
              <p className="text-gray-600">View your room booking history and booking statuses.</p>
            </Link>

            <Link
              href="/cart"
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">My Cart</h2>
              <p className="text-gray-600">Review your saved menu items and continue checkout.</p>
            </Link>
          </div>

          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Coming Soon</h3>
            <p className="text-gray-600 mb-3">Additional profile controls are on the way:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Manage account details</li>
              <li>Update saved payment information</li>
              <li>Track upcoming reservations in one timeline</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
