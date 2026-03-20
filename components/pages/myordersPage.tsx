"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Utensils, BedDouble, LogIn, UtensilsCrossed, ClipboardList, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { YocoPaymentForm } from "@/components/YocoPaymentForm";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { saveFoodOrder, NewFoodOrderData } from "@/lib/foodOrderService";

// ── Session storage keys ───────────────────────────────────────────────────────
const PENDING_ORDER_KEY = "pendingFoodOrderDraft";
const PENDING_ORDER_CHECKOUT_ID_KEY = "pendingFoodOrderYocoCheckoutId";

// ── Types ──────────────────────────────────────────────────────────────────────
type PendingOrderDraft = {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    description: string;
  }>;
  totalPrice: number;
  userEmail: string;
  userName: string;
  customerPhone: string;
  orderType: string;
  roomNumber: string;
  specialInstructions: string;
};

type FoodOrder = {
  id: string;
  name?: string;
  phone?: string;
  orderType?: "dine-in" | "take-away" | "room-service";
  roomNumber?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  specialInstructions?: string;
  paymentMethod?: string;
  paymentStatus?: "succeeded" | "pending" | "failed";
  transactionId?: string;
  createdAt?: any;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(value: any) {
  if (!value) return "-";
  if (value?.toDate) return value.toDate().toLocaleString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function getOrderTypeLabel(orderType?: string) {
  if (orderType === "dine-in") return "Dine-in";
  if (orderType === "room-service") return "Room Service";
  return "Takeaway";
}

function getPaymentStatusClass(status?: string) {
  if (status === "succeeded") return "bg-green-100 text-green-700 border-green-200";
  if (status === "failed") return "bg-red-100 text-red-700 border-red-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

function getOrderTypeBadgeClass(orderType?: string) {
  if (orderType === "dine-in") return "bg-blue-100 text-blue-700 border-blue-200";
  if (orderType === "room-service") return "bg-purple-100 text-purple-700 border-purple-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { items, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // ✅ Change 1: added showOrderHistory state
  // true = show past orders view, false = show order form
  // defaults to true so returning customers always see their history first
  const [showOrderHistory, setShowOrderHistory] = useState(items.length === 0);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("Takeaway");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // ── Fetch user food orders ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "foodOrders"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const fetched: FoodOrder[] = [];
        snapshot.forEach(doc =>
          fetched.push({ id: doc.id, ...doc.data() } as FoodOrder)
        );
        fetched.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });
        setOrders(fetched);
      } catch {
        toast.error("Failed to load your orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // ── Summary totals ─────────────────────────────────────────────────────────
  const totalSpent = useMemo(
    () =>
      orders
        .filter(o => o.paymentStatus === "succeeded")
        .reduce(
          (sum, o) =>
            sum + (o.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0),
          0
        ),
    [orders]
  );

  // ── Save pending order draft ───────────────────────────────────────────────
  const savePendingOrderDraft = (checkoutId?: string) => {
    if (!user) {
      toast.error("Please sign in to complete your order");
      return;
    }
    const draft: PendingOrderDraft = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description,
      })),
      totalPrice,
      userEmail: user.email || "",
      userName: user.displayName || user.email?.split("@")[0] || "Guest",
      customerPhone,
      orderType,
      roomNumber,
      specialInstructions,
    };
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(draft));
    if (checkoutId) {
      sessionStorage.setItem(PENDING_ORDER_CHECKOUT_ID_KEY, checkoutId);
    }
    setShowPaymentForm(true);
  };

  // ── Place order handler ────────────────────────────────────────────────────
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");
    if (!customerName.trim()) { toast.error("Full name is required."); return; }
    if (!customerPhone.trim()) { toast.error("Phone number is required."); return; }
    if (orderType === "Room Service" && !roomNumber.trim()) {
      toast.error("Room number is required for Room Service.");
      return;
    }
    setPlacingOrder(true);
    try {
      savePendingOrderDraft();
      setShowPaymentForm(true);
    } catch (err: any) {
      setOrderError(err?.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">Track your food order history</p>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
            <LogIn className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <p className="text-gray-600 text-lg mb-8">Please sign in to view your orders</p>
            <Button onClick={() => router.push("/")} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 text-base">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Past orders view ───────────────────────────────────────────────────────
  // ✅ Change 2: condition updated — no longer blocked by items.length
  // shows whenever customer has orders AND showOrderHistory is true
  if (orders.length > 0 && showOrderHistory && !showPaymentForm) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20">
        <div className="max-w-7xl mx-auto">

          {/* Header — with Place New Order button */}
          <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600 text-base md:text-lg">
                {orders.length} {orders.length === 1 ? "order" : "orders"} found
              </p>
            </div>
            {/* ✅ Switch to order form */}
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shrink-0"
              onClick={() => {
                clearCart();
                setCustomerName(user?.displayName || "");
                setCustomerEmail(user?.email || "");
                setCustomerPhone("");
                setOrderType("Takeaway");
                setRoomNumber("");
                setSpecialInstructions("");
                setPlacingOrder(false);
                setOrderError("");
                setShowOrderHistory(false);
              }}
            >
              <Plus className="h-4 w-4" />
              Place New Order
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* LEFT — Order cards */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className={`p-6 md:p-8 ${index !== orders.length - 1 ? "border-b border-gray-200" : ""}`}
                  >
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <p className="text-xl font-semibold text-gray-900">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <span className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full border ${getPaymentStatusClass(order.paymentStatus)}`}>
                            {order.paymentStatus === "succeeded" ? "Paid" : order.paymentStatus || "Pending"}
                          </span>
                          <span className={`text-xs uppercase tracking-wide px-2.5 py-1 rounded-full border ${getOrderTypeBadgeClass(order.orderType)}`}>
                            {getOrderTypeLabel(order.orderType)}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-700">
                          <p><span className="font-medium text-gray-900">Order ID: </span>{order.id}</p>
                          <p><span className="font-medium text-gray-900">Name: </span>{order.name || "-"}</p>
                          <p><span className="font-medium text-gray-900">Phone: </span>{order.phone || "-"}</p>
                          {order.orderType === "room-service" && order.roomNumber && (
                            <p><span className="font-medium text-gray-900">Room: </span>{order.roomNumber}</p>
                          )}
                          {order.specialInstructions && (
                            <p><span className="font-medium text-gray-900">Instructions: </span>{order.specialInstructions}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-amber-600">
                          R {(order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-5">
                      <p className="text-sm font-medium text-gray-900 mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            {item.image && (
                              <Image src={item.image} alt={item.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 shrink-0">
                              R {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date + Payment Method */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="font-medium text-gray-900 text-xs mb-1">Date Placed</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="font-medium text-gray-900 text-xs mb-1">Payment Method</p>
                        <p className="text-sm text-gray-600 capitalize">{order.paymentMethod || "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 sticky top-24">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">Summary</h2>
                <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Total Orders</span>
                    <span className="font-semibold text-gray-900">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Paid</span>
                    <span className="font-semibold text-gray-900">{orders.filter(o => o.paymentStatus === "succeeded").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Pending</span>
                    <span className="font-semibold text-gray-900">{orders.filter(o => o.paymentStatus === "pending").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Takeaway</span>
                    <span className="font-semibold text-gray-900">{orders.filter(o => o.orderType === "take-away").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Dine-in</span>
                    <span className="font-semibold text-gray-900">{orders.filter(o => o.orderType === "dine-in").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Room Service</span>
                    <span className="font-semibold text-gray-900">{orders.filter(o => o.orderType === "room-service").length}</span>
                  </div>
                </div>
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-semibold text-gray-900">Total Spent</span>
                    <span className="text-2xl md:text-3xl font-bold text-amber-600">R {totalSpent.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* ✅ Order Again now switches to form instead of going to /menu */}
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 md:py-4 text-base md:text-lg rounded-lg transition-colors"
                    onClick={() => setShowOrderHistory(false)}
                  >
                    Order Again
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full font-medium py-3 md:py-4 text-base md:text-lg rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                    onClick={() => router.push("/")}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── No orders + empty cart ─────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">Track your food order history</p>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <p className="text-gray-600 text-lg mb-8">No food orders found yet</p>
            <Button onClick={() => router.push("/menu")} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 text-base">
              Explore Menu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main order form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20">
      <style>{`
        ::placeholder { color: #9ca3af !important; opacity: 1 !important; }
        input::placeholder, textarea::placeholder { color: #9ca3af !important; }
      `}</style>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — Form sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* ✅ Change 3: back to orders link — only shown if customer has previous orders */}
          {orders.length > 0 && (
            <button
              onClick={() => setShowOrderHistory(true)}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              View my previous orders ({orders.length})
            </button>
          )}

          {/* Section 1 — Customer Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Customer Information</div>
                <div className="text-sm text-gray-500">Your contact details for this order</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2 — Order Type */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Utensils className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Order Type</div>
                <div className="text-sm text-gray-500">How would you like to receive your order?</div>
              </div>
            </div>
            <div className="space-y-3">
              <label className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === "Takeaway" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <input type="radio" name="orderType" value="Takeaway" checked={orderType === "Takeaway"} onChange={() => setOrderType("Takeaway")} className="accent-amber-600" />
                <ShoppingBag className={`h-5 w-5 ${orderType === "Takeaway" ? "text-amber-600" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Takeaway</div>
                  <div className="text-gray-500 text-xs">Pick up your order at the counter</div>
                </div>
              </label>
              <label className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === "Dine-In" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <input type="radio" name="orderType" value="Dine-In" checked={orderType === "Dine-In"} onChange={() => setOrderType("Dine-In")} className="accent-amber-600" />
                <Utensils className={`h-5 w-5 ${orderType === "Dine-In" ? "text-amber-600" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Dine-in</div>
                  <div className="text-gray-500 text-xs">Enjoy your meal in our restaurant</div>
                </div>
              </label>
              <label className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === "Room Service" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <input type="radio" name="orderType" value="Room Service" checked={orderType === "Room Service"} onChange={() => setOrderType("Room Service")} className="accent-amber-600" />
                <BedDouble className={`h-5 w-5 ${orderType === "Room Service" ? "text-amber-600" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Room Service</div>
                  <div className="text-gray-500 text-xs">Order delivered to your room</div>
                </div>
              </label>
              {orderType === "Room Service" && (
                <div className="mt-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    placeholder="Enter your room number"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3 — Special Instructions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Special Instructions</div>
                <div className="text-sm text-gray-500">Allergies, preferences, or any other notes</div>
              </div>
            </div>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              rows={4}
              placeholder="e.g. No onions, extra sauce, gluten-free if possible..."
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all"
            />
          </div>


          <Button
            type="button"
            className="lg:hidden w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-base rounded-xl disabled:opacity-50"
            disabled={placingOrder}
            onClick={handlePlaceOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Button>
        </div>

        {/* RIGHT — Order Summary */}
        <div className="lg:col-span-1 lg:mt-11">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 sticky top-24">
            <div className="text-xl font-semibold text-gray-900 mb-5">Order Summary</div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 mb-5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image && (
                    <Image src={item.image} alt={item.name} width={44} height={44} className="w-11 h-11 rounded-lg object-cover shrink-0 border border-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">x{item.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 shrink-0">
                    R {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-700">Total</span>
                <span className="text-3xl font-bold text-amber-600">R {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button
              type="button"
              className="hidden lg:flex w-full items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-base rounded-xl disabled:opacity-50 mb-3"
              disabled={placingOrder || isProcessing}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </Button>
            {showPaymentForm && (
              <div className="mt-4">
                <YocoPaymentForm
                  amount={totalPrice}
                  email={customerEmail}
                  firstName={customerName.split(" ")[0] || ""}
                  lastName={customerName.split(" ").slice(1).join(" ") || ""}
                  isProcessing={placingOrder || isProcessing}
                  onError={msg => toast.error(msg)}
                  returnPath="/menu"
                  onCheckoutCreated={checkoutId => {
                    if (checkoutId) {
                      sessionStorage.setItem(PENDING_ORDER_CHECKOUT_ID_KEY, checkoutId);
                    }
                    setShowPaymentForm(false);
                  }}
                />
                <Button
                  type="button"
                  className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel Payment
                </Button>
              </div>
            )}
              <Button
                className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-base rounded-xl border-2 border-red-600"
                onClick={() => {
                  clearCart();
                  sessionStorage.removeItem(PENDING_ORDER_KEY);
                  sessionStorage.removeItem(PENDING_ORDER_CHECKOUT_ID_KEY);
                  setCustomerName(user?.displayName || "");
                  setCustomerEmail(user?.email || "");
                  setCustomerPhone("");
                  setOrderType("Takeaway");
                  setRoomNumber("");
                  setSpecialInstructions("");
                  setPlacingOrder(false);
                  setOrderError("");
                  setShowPaymentForm(false);
                  setShowOrderHistory(true);
                  toast.success("Order cancelled and cart cleared.");
                }}
              >
                Clear Order
              </Button>
            <Button
              variant="outline"
              className="w-full mt-3 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 py-3 text-sm rounded-xl border-2 font-semibold"
              onClick={() => router.push("/menu")}
            >
              Back to Menu
            </Button>
          
          </div>
        </div>
      </div>
    </div>
  );
}