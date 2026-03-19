"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Utensils, BedDouble } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { YocoPaymentForm } from "@/components/YocoPaymentForm";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { saveFoodOrder } from "@/lib/orderService";

const PENDING_ORDER_KEY = "pendingFoodOrderDraft";
const PENDING_ORDER_CHECKOUT_ID_KEY = "pendingFoodOrderYocoCheckoutId";

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
};

export function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Fetch user's completed food orders
  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "foodOrders"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const fetchedOrders: any[] = [];
        snapshot.forEach(doc => {
          fetchedOrders.push({ id: doc.id, ...doc.data() });
        });
        setOrders(fetchedOrders);
      } catch (err) {
        toast.error("Failed to load your orders");
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Save pending order draft to session storage
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
    };

    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(draft));
    if (checkoutId) {
      sessionStorage.setItem(PENDING_ORDER_CHECKOUT_ID_KEY, checkoutId);
    }
    setShowPaymentForm(true);
  };

  // Static import for orderService
  

  // Complete the order after payment verification
  const completePendingOrder = async (paymentId: string, checkoutId: string) => {
    try {
      setIsProcessing(true);
      // Debug log
      console.log("[DEBUG] completePendingOrder called", { paymentId, checkoutId });

      // Verify payment with backend (GET endpoint)
      const verifyResponse = await fetch(`/api/payments?checkoutId=${checkoutId}`);
      if (!verifyResponse.ok) {
        console.error("[DEBUG] Payment verification failed", verifyResponse);
        toast.error("Payment verification failed");
        return;
      }
      const paymentData = await verifyResponse.json();
      if (paymentData.status !== "completed") {
        console.error("[DEBUG] Payment not completed", paymentData);
        toast.error("Payment was not completed");
        return;
      }

      // Get pending order draft
      const draftJson = sessionStorage.getItem(PENDING_ORDER_KEY);
      if (!draftJson) {
        console.error("[DEBUG] No pending order found in sessionStorage");
        toast.error("No pending order found");
        return;
      }
      const draft: PendingOrderDraft = JSON.parse(draftJson);

      // Verify user is still signed in
      if (!user) {
        console.error("[DEBUG] User not signed in", user);
        toast.error("User not signed in");
        return;
      }

      // Log user info and draft before saving
      console.log("[DEBUG] Saving order to Firestore", {
        userId: user.uid,
        userEmail: draft.userEmail,
        userName: draft.userName,
        items: draft.items,
        totalPrice: draft.totalPrice,
        paymentId,
      });

      // Save order to Firestore
      let orderId = "";
      try {
        orderId = await saveFoodOrder(
          user.uid,
          draft.userEmail,
          draft.userName,
          draft.items,
          draft.totalPrice,
          paymentId
        );
        console.log("[DEBUG] Order saved, orderId:", orderId);
      } catch (saveError) {
        console.error("[DEBUG] Error saving food order to Firestore:", saveError);
        toast.error("Failed to save order", {
          description: saveError instanceof Error ? saveError.message : "Unknown error",
        });
        return;
      }

      // Clear session storage
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      sessionStorage.removeItem(PENDING_ORDER_CHECKOUT_ID_KEY);

      // Clear cart
      clearCart();

      // Show order confirmation toast
      toast.success("Order confirmed! Redirecting to menu...", {
        description: `Order ID: ${orderId}`,
        duration: 3000,
      });
      setOrderId(orderId);
      setOrderSuccess(true);
      // Use router for redirect
      setTimeout(() => {
        router.push("/menu");
      }, 1500);

    } catch (error) {
      console.error("[DEBUG] Error completing order:", error);
      toast.error("Failed to complete order", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment return from Yoco
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const paymentId = urlParams.get("id");
    const checkoutId = sessionStorage.getItem(PENDING_ORDER_CHECKOUT_ID_KEY);

    if (paymentStatus === "success" && paymentId && checkoutId) {
      // Payment successful, complete the order
      completePendingOrder(paymentId, checkoutId);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment was cancelled");
      setShowPaymentForm(false);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleProceedToPayment = () => {
    if (!user) {
      toast.error("Please sign in to complete your order", {
        description: "You need to be signed in to place an order",
      });
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    savePendingOrderDraft();
  };

  // Two-section layout: left = customer form, right = order summary
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("Dine-In");
  const [roomNumber, setRoomNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderId, setOrderId] = useState("");

  // ...existing code...

  // Show user's completed orders if redirected after placing an order
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 max-w-md p-10 text-center">
          <span className="text-lg font-semibold text-gray-900">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length > 0 && items.length === 0 && !showPaymentForm && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20 font-sans">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Food Orders</h2>
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-amber-600">Order #{order.id}</span>
                <span className="text-sm text-gray-500">{order.orderStatus}</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-700 font-medium">Placed: </span>
                <span className="text-gray-500">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ""}</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-700 font-medium">Total: </span>
                <span className="text-2xl font-bold text-amber-600">R {order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="mb-4">
                <span className="text-gray-700 font-medium">Items:</span>
                <ul className="mt-2">
                  {order.items.map((item: any) => (
                    <li key={item.id} className="flex items-center gap-3 mb-2">
                      {item.image && (
                        <Image src={item.image} alt={item.name} width={36} height={36} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                      )}
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="text-xs text-gray-500">x{item.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900">R {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-sm text-gray-500">Payment Status: <span className="font-semibold text-green-600">{order.paymentStatus}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 max-w-md p-10 text-center">
          <ShoppingBag className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some items from the menu first.</p>
          <Button
            onClick={() => router.push("/menu")}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 text-base"
          >
            Go to Menu
          </Button>
        </div>
        <style>{`
          ::placeholder { color: #9ca3af !important; opacity: 1 !important; }
          input::placeholder, textarea::placeholder { color: #9ca3af !important; }
        `}</style>
      </div>
    );
  }

  // Order placement handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    setOrderError("");
    try {
      if (!customerName) {
        toast.error("Full Name is required.");
        setPlacingOrder(false);
        return;
      }
      if (!customerPhone) {
        toast.error("Phone Number is required.");
        setPlacingOrder(false);
        return;
      }
      if (orderType === "Room Service" && !roomNumber) {
        toast.error("Room Number is required for Room Service.");
        setPlacingOrder(false);
        return;
      }
      // Instead of saving order directly, open Yoco payment form
      savePendingOrderDraft();
      setShowPaymentForm(true);
      setPlacingOrder(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order.");
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 max-w-md p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12l2 2l4 -4" /><circle cx="12" cy="12" r="10" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-4">Thank you, <span className="font-semibold text-gray-800">{customerName}</span>.</p>
          <p className="text-gray-500 text-sm mb-2">Your order reference number is:</p>
          <div className="text-4xl font-extrabold text-amber-600 tracking-wide mb-4">#{orderId}</div>
          <div className="text-gray-500 text-sm mb-8 leading-relaxed">
            {orderType === "Takeaway" && "Please show this reference number at the restaurant counter when collecting your order."}
            {orderType === "Dine-In" && "Please have a seat — your order will be brought to your table."}
            {orderType === "Room Service" && "Your order will be delivered to your room shortly."}
          </div>
          <Button onClick={() => router.push("/menu")} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-base rounded-xl">Back to Menu</Button>
          <style>{`
            ::placeholder { color: #9ca3af !important; opacity: 1 !important; }
            input::placeholder, textarea::placeholder { color: #9ca3af !important; }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4 md:py-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          {/* Customer Information Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Customer Information</div>
                <div className="text-sm text-gray-500">Your contact details for this order</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="+27 XX XXX XXXX"
                  required
                />
              </div>
            </div>
          </div>
          {/* Order Type Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <Utensils className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Order Type</div>
                <div className="text-sm text-gray-500">How would you like to receive your order?</div>
              </div>
            </div>
            <div className="space-y-4">
              {/* Takeaway */}
              <label className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === "Takeaway" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                htmlFor="order-type-takeaway">
                <input
                  type="radio"
                  id="order-type-takeaway"
                  name="orderType"
                  value="Takeaway"
                  checked={orderType === "Takeaway"}
                  onChange={() => setOrderType("Takeaway")}
                  className="hidden accent-amber-600"
                />
                <ShoppingBag className={`h-5 w-5 ${orderType === "Takeaway" ? "text-amber-600" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Takeaway</div>
                  <div className="text-gray-500 text-xs">Pick up your order at the counter</div>
                </div>
              </label>
              {/* Dine-in */}
              <label className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === "Dine-In" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                htmlFor="order-type-dinein">
                <input
                  type="radio"
                  id="order-type-dinein"
                  name="orderType"
                  value="Dine-In"
                  checked={orderType === "Dine-In"}
                  onChange={() => setOrderType("Dine-In")}
                  className="hidden accent-amber-600"
                />
                <Utensils className={`h-5 w-5 ${orderType === "Dine-In" ? "text-amber-600" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Dine-in</div>
                  <div className="text-gray-500 text-xs">Enjoy your meal in our restaurant</div>
                </div>
              </label>
              {/* Room Service */}
              <label className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${orderType === "Room Service" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                htmlFor="order-type-roomservice">
                <input
                  type="radio"
                  id="order-type-roomservice"
                  name="orderType"
                  value="Room Service"
                  checked={orderType === "Room Service"}
                  onChange={() => setOrderType("Room Service")}
                  className="hidden accent-amber-600"
                />
                <BedDouble className={`h-5 w-5 ${orderType === "Room Service" ? "text-amber-600" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-gray-900 text-sm">Room Service</div>
                  <div className="text-gray-500 text-xs">Order delivered to your room</div>
                </div>
              </label>
              {orderType === "Room Service" && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Room Number <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={e => setRoomNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter your room number"
                    required
                  />
                </div>
              )}
            </div>
          </div>
          {/* Special Instructions Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/></svg>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900">Special Instructions</div>
                <div className="text-sm text-gray-500">Allergies, preferences, or any other notes</div>
              </div>
            </div>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none rows-4"
              placeholder="e.g. No onions, extra sauce, gluten-free if possible..."
              rows={4}
            />
          </div>
          {/* Error Message */}
          {orderError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium mb-6">
              {orderError}
            </div>
          )}
          {/* Mobile Submit Button */}
          <Button
            type="submit"
            className="lg:hidden w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-base rounded-xl disabled:opacity-50"
            disabled={placingOrder}
            onClick={handlePlaceOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Button>
          <style>{`
            ::placeholder { color: #9ca3af !important; opacity: 1 !important; }
            input::placeholder, textarea::placeholder { color: #9ca3af !important; }
          `}</style>
        </div>
        {/* RIGHT SIDE — Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 sticky top-24">
            <div className="text-xl font-semibold text-gray-900 mb-5">Order Summary</div>
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.image && (
                    <Image src={item.image} alt={item.name} width={44} height={44} className="w-11 h-11 rounded-lg object-cover shrink-0 border border-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs text-gray-500">x{item.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 shrink-0">R {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-700">Total</span>
                <span className="text-3xl font-bold text-amber-600">R {totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {/* Desktop Place Order Button */}
            <Button
              type="button"
              className="hidden lg:flex w-full items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-base rounded-xl disabled:opacity-50 mb-3"
              disabled={placingOrder}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </Button>
            {/* Inline Yoco Payment Form */}
            {showPaymentForm && (
              <div className="mt-4">
                <YocoPaymentForm
                  amount={totalPrice}
                  email={customerEmail}
                  firstName={customerName.split(" ")[0] || ""}
                  lastName={customerName.split(" ").slice(1).join(" ") || ""}
                  isProcessing={placingOrder || isProcessing}
                  onError={msg => toast.error(msg)}
                  returnPath={typeof window !== "undefined" ? window.location.pathname : undefined}
                  onCheckoutCreated={checkoutId => {
                    if (checkoutId) {
                      sessionStorage.setItem(PENDING_ORDER_CHECKOUT_ID_KEY, checkoutId);
                    }
                    setShowPaymentForm(false);
                  }}
                />
                <Button
                  type="button"
                  className="w-full mt-2 mb-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-xl"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel Payment
                </Button>
              </div>
            )}
            {/* Back to Menu Button */}
            <Button
              variant="outline"
              className="w-full border-amber-300 text-amber-700 bg-amber-100 hover:bg-amber-200 py-3 text-sm rounded-xl border-2 font-semibold"
              onClick={() => router.push("/menu")}
            >
              Back to Menu
            </Button>
            <style>{`
              ::placeholder { color: #9ca3af !important; opacity: 1 !important; }
              input::placeholder, textarea::placeholder { color: #9ca3af !important; }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
