"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { YocoPaymentForm } from "@/components/YocoPaymentForm";

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

export function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Save pending order draft to session storage
  const savePendingOrderDraft = () => {
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
    setShowPaymentForm(true);
  };

  // Complete the order after payment verification
  const completePendingOrder = async (paymentId: string) => {
    try {
      setIsProcessing(true);

      // Get checkout ID from session storage
      const checkoutId = sessionStorage.getItem(PENDING_ORDER_CHECKOUT_ID_KEY);
      if (!checkoutId) {
        throw new Error("No checkout ID found");
      }

      // Verify payment with backend
      const verifyResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Payment verification failed");
      }

      const paymentData = await verifyResponse.json();
      
      if (paymentData.status !== "successful") {
        throw new Error("Payment was not successful");
      }

      // Get pending order draft
      const draftJson = sessionStorage.getItem(PENDING_ORDER_KEY);
      if (!draftJson) {
        throw new Error("No pending order found");
      }

      const draft: PendingOrderDraft = JSON.parse(draftJson);

      // Verify user is still signed in
      if (!user) {
        throw new Error("User not signed in");
      }

      // Save order to Firestore
      const { saveFoodOrder } = await import("@/lib/orderService");
      const orderId = await saveFoodOrder(
        user.uid,
        draft.userEmail,
        draft.userName,
        draft.items,
        draft.totalPrice,
        paymentId
      );

      // Clear session storage
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      sessionStorage.removeItem(PENDING_ORDER_CHECKOUT_ID_KEY);

      // Clear cart
      clearCart();

      // Show success message
      toast.success("Order placed successfully!", {
        description: `Order ID: ${orderId}`,
        duration: 5000,
      });

      // Redirect to orders page (or menu)
      setTimeout(() => {
        router.push("/menu");
      }, 1500);

    } catch (error) {
      console.error("Error completing order:", error);
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
    const status = urlParams.get("status");
    const paymentId = urlParams.get("id");

    if (status === "success" && paymentId) {
      // Payment successful, complete the order
      completePendingOrder(paymentId);
      
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "cancelled") {
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4">My Cart</h1>
          <p className="text-gray-600 text-base md:text-lg mb-8">View and manage your food orders</p>
          
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
            <div className="mb-6">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg mb-8">Your cart is empty</p>
            <Button
              onClick={() => router.push("/menu")}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 text-base"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-2">My Cart</h1>
          <p className="text-gray-600 text-base md:text-lg">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-6 md:p-8 flex flex-col sm:flex-row gap-4 md:gap-6 ${
                    index !== items.length - 1 ? "border-b border-gray-200" : ""
                  }`}
                >
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Item Details - Middle Column */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl md:text-3xl font-bold text-amber-600">
                        R {item.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">each</span>
                    </div>
                  </div>

                  {/* Actions - Right Column */}
                  <div className="flex flex-col items-end gap-4 sm:justify-between">
                    {/* Remove Button */}
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.success(`${item.name} removed from cart`);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700 hover:text-gray-900"
                        title="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="w-12 text-center">
                        <span className="font-bold text-gray-900 text-lg">{item.quantity}</span>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-700 hover:text-gray-900"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                      <p className="text-xl font-bold text-gray-900">
                        R {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 sticky top-24">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
                Order Summary
              </h2>

              {/* Items Breakdown */}
              <div className="space-y-3 mb-8 pb-8 border-b border-gray-200 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} <span className="font-semibold text-gray-900">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      R {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between items-end">
                  <span className="text-xl font-semibold text-gray-900">Total</span>
                  <span className="text-3xl md:text-4xl font-bold text-amber-600">
                    R {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                {!showPaymentForm ? (
                  <>
                    {/* Auth Warning if not signed in */}
                    {!user && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          You need to be signed in to place an order
                        </p>
                      </div>
                    )}

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 md:py-4 text-base md:text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleProceedToPayment}
                      disabled={!user || items.length === 0}
                    >
                      Proceed to Payment
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full font-medium py-3 md:py-4 text-base md:text-lg rounded-lg border-2 border-gray-900 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors"
                      onClick={() => router.push("/menu")}
                    >
                      Continue Shopping
                    </Button>

                    <Button
                      className="w-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white font-medium py-3 md:py-4 text-base md:text-lg rounded-lg transition-colors"
                      onClick={() => {
                        clearCart();
                        toast.success("Cart cleared");
                      }}
                    >
                      Clear Cart
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Payment Form */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Complete Payment
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        You will be redirected to Yoco to complete your payment securely.
                      </p>
                      <YocoPaymentForm
                        amount={totalPrice}
                        email={user?.email || ""}
                        firstName={user?.displayName?.split(" ")[0] || "Guest"}
                        lastName={user?.displayName?.split(" ").slice(1).join(" ") || ""}
                        isProcessing={isProcessing}
                        returnPath="/cart"
                        onError={(error) => {
                          toast.error("Payment failed", {
                            description: error,
                          });
                          setShowPaymentForm(false);
                        }}
                        onCheckoutCreated={(checkoutId) => {
                          sessionStorage.setItem(PENDING_ORDER_CHECKOUT_ID_KEY, checkoutId);
                        }}
                      />
                    </div>

                    <Button
                      variant="outline"
                      className="w-full font-medium py-3 text-base rounded-lg border-2 transition-colors"
                      onClick={() => setShowPaymentForm(false)}
                      disabled={isProcessing}
                    >
                      Back to Cart
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
