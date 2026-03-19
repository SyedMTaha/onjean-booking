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

export function MenuClient() {
  const [selectedCategory, setSelectedCategory] = useState("Beverages");
  const [menuItemsByCategory, setMenuItemsByCategory] = useState<Record<string, MenuDisplayItem[]>>(localMenuItemsByCategory);
  const { addToCart, items, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const visibleItems = menuItemsByCategory[selectedCategory] || [];
  const [drawerOpen, setDrawerOpen] = useState(false);

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
  const activeCategories = dynamicCategories.length > 0 ? dynamicCategories : menuCategories;

  // Group beverages by subcategory
  const groupedBeverages =
    selectedCategory === "Beverages"
      ? visibleItems.reduce((acc: Record<string, MenuDisplayItem[]>, item: MenuDisplayItem) => {
          const subcat = item.subcategory || "Other";
          if (!acc[subcat]) acc[subcat] = [];
          acc[subcat].push(item);
          return acc;
        }, {})
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

    // ✅ Open drawer instead of toast
    setDrawerOpen(true);
  };

  // Cart total
  const cartTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const cartCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Reusable menu item card
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
        <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-2">{item.description}</p>
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

      {/* ── Right Cart Drawer ── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
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

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            // ✅ Empty cart state
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="h-9 w-9 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add items from the menu to get started</p>
              </div>
            </div>
          ) : (
            // ✅ Cart items list
            <div className="space-y-4">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3"
                >
                  {/* Item image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-amber-600 font-bold text-sm mt-0.5">
                      R{(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Quantity controls */}
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

                  {/* Remove button */}
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

        {/* Drawer Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-xl font-bold text-gray-900">R{cartTotal.toFixed(2)}</span>
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

      {/* ── Hero Section ── */}
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

          {/* Category tabs + Cart button */}
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

            {/* ✅ Cart icon button — opens drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="ml-4 relative flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 h-[48px] md:h-[56px] rounded-xl shadow-sm transition-colors text-sm md:text-base font-medium"
              style={{ minWidth: '110px' }}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline align-middle">Cart</span>
              {/* Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Menu Items */}
          {selectedCategory === "Beverages" && groupedBeverages ? (
            <div className="space-y-8">
              {Object.entries(groupedBeverages).map(([subcategory, items]) => (
                <div key={subcategory}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{subcategory}</h3>
                    <div className="h-0.5 bg-[#EBECEE]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item, index) => (
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
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Special Dietary Requirements</h3>
            <p className="text-gray-700 mb-4">
              We gladly accommodate dietary preferences and restrictions. Please inform our team when placing your order.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Dairy-Free", "Nut-Free"].map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">24/7 Room Service</h3>
            <p className="text-gray-700">
              Enjoy selected menu favorites from the comfort of your room at any time. Late-night and early-morning orders
              are available through our in-room dining team.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}