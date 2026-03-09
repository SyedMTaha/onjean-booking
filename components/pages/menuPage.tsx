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

export function MenuClient() {
  const [selectedCategory, setSelectedCategory] = useState("Light Meals");
  const [menuItemsByCategory, setMenuItemsByCategory] = useState<Record<string, MenuDisplayItem[]>>(localMenuItemsByCategory);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const visibleItems = menuItemsByCategory[selectedCategory] || [];

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const dbItems = await getAvailableMenuItems();

        if (!dbItems.length) {
          return;
        }

        const grouped: Record<string, MenuDisplayItem[]> = {};
        dbItems.forEach((item) => {
          if (!grouped[item.category]) {
            grouped[item.category] = [];
          }
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
          if (firstCategory) {
            setSelectedCategory(firstCategory);
          }
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
  const groupedBeverages = selectedCategory === "Beverages"
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

    // Extract price as number (remove "R" and convert to float)
    const priceNumber = parseFloat(item.price.replace("R", "").trim());
    
    addToCart({
      id: `${item.category || selectedCategory}-${item.name}`,
      name: item.name,
      price: priceNumber,
      image: item.image,
      description: item.description,
      quantity: 1,
    });

    toast.success("Item added to cart! Check your profile to view your cart.", {
      description: `${item.name} has been added.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden flex items-center justify-center">
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
          <p className="text-lg md:text-xl text-gray-100">Experience culinary excellence with our chef's carefully curated menu</p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Menu</h2>
            <p className="text-base md:text-lg text-gray-600">Fresh ingredients, expertly prepared</p>
          </div>

          <div className="mb-10">
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
          </div>

          {selectedCategory === "Beverages" && groupedBeverages ? (
            <div className="space-y-8">
              {Object.entries(groupedBeverages).map(([subcategory, items]) => (
                <div key={subcategory}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{subcategory}</h3>
                    <div className="h-0.5 bg-[#EBECEE]"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-[420px]"
                      >
                        <div className="relative h-[60%]">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute top-3 right-3 bg-amber-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
                            {item.price}
                          </span>
                        </div>
                        <div className="p-5 h-[40%] flex flex-col">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                          <p className="text-gray-600 text-sm md:text-base mb-4">{item.description}</p>
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="mt-auto bg-amber-600 hover:bg-amber-700 text-white w-full"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-[420px]"
                >
                  <div className="relative h-[60%]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-amber-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
                      {item.price}
                    </span>
                  </div>
                  <div className="p-5 h-[40%] flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm md:text-base mb-4">{item.description}</p>
                    <Button
                      onClick={() => handleAddToCart(item)}
                      className="mt-auto bg-amber-600 hover:bg-amber-700 text-white w-full"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCategory !== "Desserts" && (
            <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedCategory === "Beverages" ? " Note" : `${selectedCategory} Hours`}
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
              {[
                "Vegetarian",
                "Vegan",
                "Gluten-Free",
                "Halal",
                "Dairy-Free",
                "Nut-Free",
              ].map((badge) => (
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
