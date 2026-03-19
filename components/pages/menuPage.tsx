"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getAvailableMenuItems } from "@/lib/menuService";
import {
  categoryInfo,
  localMenuItemsByCategory,
  MenuDisplayItem,
  menuCategories,
} from "@/data/menuItems";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveFoodOrder, NewFoodOrderData } from "@/lib/foodOrderService";

// ── Must match OrderPage exactly ──────────────────────────────────────────────
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
  customerPhone: string;
  orderType: string;
  roomNumber: string;
  specialInstructions: string;
};

export function MenuClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, items, removeFromCart, updateQuantity, clearCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Beverages");
  const [menuItemsByCategory, setMenuItemsByCategory] = useState<Record<string, MenuDisplayItem[]>>(localMenuItemsByCategory);
  const visibleItems = menuItemsByCategory[selectedCategory] || [];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);

  // ── useEffect 1: existing toast for room booking / prev order success ─────
  useEffect(() => {
    const toastData = localStorage.getItem("orderSuccessToast");
    if (toastData) {
      const { orderId } = JSON.parse(toastData);
      toast.success("Order confirmed!", {
        description: `Order ID: ${orderId}`,
        duration: 3000,
      });
      localStorage.removeItem("orderSuccessToast");
    }
  }, []);

  // ── useEffect 2: NEW — handle Yoco redirect back to /menu ─────────────────
  // Runs once on mount, checks for ?payment=success&id=xxx in the URL
  // Only triggers for food orders (checks sessionStorage for pending draft)
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get("payment");
  const checkoutId = sessionStorage.getItem(PENDING_ORDER_CHECKOUT_ID_KEY);
  const hasPendingDraft = !!sessionStorage.getItem(PENDING_ORDER_KEY);

  if (paymentStatus) {
    window.history.replaceState({}, "", window.location.pathname);
  }

  // ✅ Removed paymentId — Yoco doesn't send it back in URL
  if (paymentStatus === "success" && checkoutId && hasPendingDraft) {
    completePendingOrder(checkoutId);
  } else if (paymentStatus === "cancelled" && hasPendingDraft) {
    toast.error("Payment was cancelled. Your cart has been kept.");
    sessionStorage.removeItem(PENDING_ORDER_CHECKOUT_ID_KEY);
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Complete the pending food order after successful payment ──────────────
  const completePendingOrder = async (checkoutId: string) => {
    try {
      setIsCompletingOrder(true);
      toast.loading("Confirming your order...", { id: "order-processing" });

      
      // Step 1 — Verify payment with backend
      const verifyResponse = await fetch(`/api/payments?checkoutId=${checkoutId}`);
      if (!verifyResponse.ok) {
        toast.error("Payment verification failed. Please contact support.", {
          id: "order-processing",
        });
        return;
      }

      const paymentData = await verifyResponse.json();
      // ✅ Just log it — don't block on status for now
      console.log("[MenuClient] Full payment response:", JSON.stringify(paymentData));

      // Step 2 — Read pending draft from sessionStorage
      const draftJson = sessionStorage.getItem(PENDING_ORDER_KEY);
      if (!draftJson) {
        console.error("[MenuClient] No pending order draft in sessionStorage");
        toast.error("Order data not found. Please contact support.", {
          id: "order-processing",
        });
        return;
      }
      const draft: PendingOrderDraft = JSON.parse(draftJson);

      // Step 3 — Check user is still signed in
      if (!user) {
        toast.error("Session expired. Please sign in again.", {
          id: "order-processing",
        });
        return;
      }

      // Step 4 — Build order payload from draft
      const orderData: NewFoodOrderData = {
        name: draft.userName,
        phone: draft.customerPhone,
        orderType:
          draft.orderType === "Dine-In"
            ? "dine-in"
            : draft.orderType === "Room Service"
            ? "room-service"
            : "take-away",
        items: draft.items,
        specialInstructions: draft.specialInstructions || undefined,
        paymentMethod: "yoco",
        paymentStatus: "succeeded",
        transactionId: checkoutId, // ✅ checkoutId used as payment reference
      };
      // Only add roomNumber if present and not undefined/null
      if (draft.orderType === "Room Service" && draft.roomNumber) {
        (orderData as any).roomNumber = draft.roomNumber;
      }

      console.log("[MenuClient] Saving food order...", orderData);

      // Step 5 — Save to Firestore
      const saveResult = await saveFoodOrder(user.uid, orderData);
      console.log("[MenuClient] Saved. orderId:", saveResult.orderId);

      // Step 6 — Clean up
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      sessionStorage.removeItem(PENDING_ORDER_CHECKOUT_ID_KEY);
      clearCart();

      // Step 7 — Show success toast
      toast.success("Order placed successfully!", {
        id: "order-processing",
        description: `Order ID: ${saveResult.orderId}`,
        duration: 5000,
      });

      // Step 8 — Redirect to /order after delay so user sees the toast
      setTimeout(() => {
        router.push("/order");
      }, 2000);

    } catch (error) {
      console.error("[MenuClient] Error completing food order:", error);
      toast.error("Failed to complete order. Please contact support.", {
        id: "order-processing",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsCompletingOrder(false);
    }
  };

  // ── Load menu items from DB ────────────────────────────────────────────────
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const dbItems = await getAvailableMenuItems();
        if (!dbItems.length) return;

        const grouped: Record<string, MenuDisplayItem[]> = {};
        dbItems.forEach((item) => {
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push({
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
            subcategory: item.subcategory,
            category: item.category,
          });
        });

        setMenuItemsByCategory(grouped);

        if (!grouped[selectedCategory]) {
          const firstCategory = Object.keys(grouped)[0];
          if (firstCategory) setSelectedCategory(firstCategory);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Using local menu fallback:", error);
        }
      }
    };
    loadMenuItems();
  }, []);

  const dynamicCategories = Object.keys(menuItemsByCategory);
  const activeCategories =
    dynamicCategories.length > 0 ? dynamicCategories : menuCategories;

  const groupedBeverages =
    selectedCategory === "Beverages"
      ? visibleItems.reduce(
          (acc: Record<string, MenuDisplayItem[]>, item: MenuDisplayItem) => {
            const subcat = item.subcategory || "Other";
            if (!acc[subcat]) acc[subcat] = [];
            acc[subcat].push(item);
            return acc;
          },
          {}
        )
      : null;

  const handleAddToCart = (item: MenuDisplayItem) => {
    if (!user || user.isAnonymous) {
      toast.error("Please sign in before adding food to cart.");
      return;
    }
    const priceNumber = parseFloat(item.price.replace("R", "").trim());
    addToCart({
      id: `${item.category || selectedCategory}-${item.name}`,
      name: item.name,
      price: priceNumber,
      image: item.image,
      description: item.description,
      quantity: 1,
    });
    setDrawerOpen(true);
  };

  const cartTotal = items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const cartCount = items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0
  );

  const MenuCard = ({ item, index }: { item: MenuDisplayItem; index: number }) => (
    <div
      key={index}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-105"
    >
      <div className="relative h-[60%]">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <span className="absolute top-3 right-3 bg-amber-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
          {item.price}
        </span>
      </div>
      <div className="p-5 h-[40%] flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">
          {item.description}
        </p>
        <Button
          onClick={() => handleAddToCart(item)}
          className="mt-auto bg-amber-600 hover:bg-amber-700 text-white w-full"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">

      {/* ── Processing overlay ─────────────────────────────────────────────── */}
      {isCompletingOrder && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <ShoppingCart className="h-7 w-7 text-amber-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">
              Confirming your order...
            </p>
            <p className="text-sm text-gray-500">
              Please wait, do not close this page.
            </p>
          </div>
        </div>
      )}

      {/* ── Right Cart Drawer ──────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
            {cartCount > 0 && (
              <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="h-9 w-9 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add items from the menu to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-amber-600 font-bold text-sm mt-0.5">
                      R{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start p-1.5 rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-xl font-bold text-gray-900">
                R{cartTotal.toFixed(2)}
              </span>
            </div>
            <Link href="/order" onClick={() => setDrawerOpen(false)} className="block">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 text-base font-semibold">
                Proceed to Order
              </Button>
            </Link>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
            >
              Continue browsing
            </button>
          </div>
        )}
      </div>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative h-75 md:h-100 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=700&fit=crop"
            alt="Restaurant Menu"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3">Fine Dining</h1>
          <p className="text-lg md:text-xl text-gray-100">
            Experience culinary excellence with our chef's carefully curated menu
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Menu</h2>
            <p className="text-base md:text-lg text-gray-600">Fresh ingredients, expertly prepared</p>
          </div>

          <div className="mb-10 flex items-center justify-between">
            <div className="w-full bg-gray-200 rounded-2xl p-1 grid grid-cols-2 md:grid-cols-4 gap-1">
              {activeCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`py-3 px-3 rounded-xl text-sm md:text-base font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="ml-4 relative flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 h-[48px] md:h-[56px] rounded-xl shadow-sm transition-colors text-sm md:text-base font-medium"
              style={{ minWidth: "110px" }}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline align-middle">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {selectedCategory === "Beverages" && groupedBeverages ? (
            <div className="space-y-8">
              {Object.entries(groupedBeverages).map(([subcategory, subItems]) => (
                <div key={subcategory}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {subcategory}
                    </h3>
                    <div className="h-0.5 bg-[#EBECEE]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {subItems.map((item, index) => (
                      <MenuCard key={index} item={item} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleItems.map((item, index) => (
                <MenuCard key={index} item={item} index={index} />
              ))}
            </div>
          )}

          {selectedCategory !== "Desserts" && (
            <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedCategory === "Beverages" ? "Note" : `${selectedCategory} Hours`}
              </h3>
              <p className="text-gray-700 font-medium">{categoryInfo[selectedCategory]}</p>
            </div>
          )}

          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Special Dietary Requirements
            </h3>
            <p className="text-gray-700 mb-4">
              We gladly accommodate dietary preferences and restrictions. Please
              inform our team when placing your order.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Dairy-Free", "Nut-Free"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">24/7 Room Service</h3>
            <p className="text-gray-700">
              Enjoy selected menu favorites from the comfort of your room at any time.
              Late-night and early-morning orders are available through our in-room dining team.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}