"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

const menuCategories = ["Breakfast", "Lunch", "Dinner", "Desserts", "Beverages"];

const categoryInfo: Record<string, string> = {
  Breakfast: "7:00 AM - 11:00 AM daily",
  Lunch: "12:00 PM - 4:00 PM daily",
  Dinner: "6:00 PM - 10:30 PM daily",
  Desserts: "No specific timing",
  Beverages: "Alcoholic beverages available for guests 18 years and older",
};

const menuItemsByCategory: Record<string, Array<{ name: string; price: string; description: string; image: string }>> = {
  Breakfast: [
    { name: "Continental Breakfast", price: "R180", description: "Fresh pastries, fruit, yogurt, and artisan coffee.", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop" },
    { name: "Full English Breakfast", price: "R250", description: "Eggs, bacon, sausage, beans, grilled tomato, and toast.", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop" },
    { name: "Avocado Toast Deluxe", price: "R210", description: "Sourdough toast, smashed avocado, poached egg, and herbs.", image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800&h=600&fit=crop" },
    { name: "Berry Pancake Stack", price: "R195", description: "Fluffy pancakes with berries, cream, and maple syrup.", image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=600&fit=crop" },
    { name: "Healthy Granola Bowl", price: "R170", description: "Toasted granola, greek yogurt, chia seeds, and seasonal fruit.", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&h=600&fit=crop" },
    { name: "Smoked Salmon Bagel", price: "R230", description: "Toasted bagel with cream cheese, smoked salmon, and capers.", image: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&h=600&fit=crop" },
  ],
  Lunch: [
    { name: "Peri-Peri Chicken Bowl", price: "R260", description: "Spiced grilled chicken with fragrant rice and greens.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop" },
    { name: "Grilled Fish & Veg", price: "R280", description: "Fresh daily catch served with seasonal vegetables.", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&h=600&fit=crop" },
    { name: "Chicken Caesar Salad", price: "R220", description: "Crisp romaine, parmesan, croutons, and grilled chicken.", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop" },
    { name: "Gourmet Beef Burger", price: "R240", description: "Juicy beef patty, cheddar, caramelized onion, and fries.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" },
    { name: "Vegetable Stir Fry", price: "R220", description: "Crisp vegetables in house Asian-style sauce with noodles.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop" },
    { name: "Mediterranean Wrap", price: "R210", description: "Grilled chicken, hummus, greens, and feta in warm flatbread.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop" },
  ],
  Dinner: [
    { name: "Prime Rib Steak", price: "R450", description: "Premium cut steak, char-grilled and served with jus.", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop" },
    { name: "Lobster Tail", price: "R500", description: "Fresh lobster tail with lemon butter and herbs.", image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800&h=600&fit=crop" },
    { name: "Duck Confit", price: "R380", description: "Slow-cooked duck leg with berry reduction.", image: "https://images.unsplash.com/photo-1600891963935-c1df7b8f0f4b?w=800&h=600&fit=crop" },
    { name: "Lamb Chops", price: "R420", description: "Herb-crusted lamb chops with roasted vegetables.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
    { name: "Seafood Risotto", price: "R360", description: "Creamy arborio rice with prawns and calamari.", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&h=600&fit=crop" },
    { name: "Grilled Fish Platter", price: "R320", description: "Market fish with citrus glaze and garden vegetables.", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&h=600&fit=crop" },
    { name: "Mushroom Truffle Pasta", price: "R310", description: "Fresh pasta with truffle cream and wild mushrooms.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop" },
    { name: "Chicken Supreme", price: "R340", description: "Pan-seared chicken breast with garlic mash and jus.", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=600&fit=crop" },
  ],
  Desserts: [
    { name: "Chocolate Lava Cake", price: "R140", description: "Warm molten center cake with vanilla bean cream.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop" },
    { name: "Crème Brûlée", price: "R135", description: "Silky vanilla custard with caramelized sugar top.", image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop" },
    { name: "Cheesecake Slice", price: "R125", description: "Classic baked cheesecake with berry compote.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&h=600&fit=crop" },
    { name: "Fruit Pavlova", price: "R130", description: "Meringue shell with whipped cream and fresh fruit.", image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&h=600&fit=crop" },
  ],
  Beverages: [
    { name: "Fresh Citrus Cooler", price: "R95", description: "Refreshing citrus blend with mint and sparkling ice.", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop" },
    { name: "Berry Smoothie", price: "R110", description: "Mixed berry smoothie with yogurt and honey.", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&h=600&fit=crop" },
    { name: "Iced Coffee", price: "R90", description: "Cold brew coffee with milk and vanilla syrup.", image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1f0d5?w=800&h=600&fit=crop" },
    { name: "Signature Mocktail", price: "R120", description: "House tropical blend with citrus and basil.", image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop" },
    { name: "Craft Beer", price: "R105", description: "Locally brewed craft beer selection.", image: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&h=600&fit=crop" },
    { name: "House Wine Glass", price: "R130", description: "Red, white, and rosé options by the glass.", image: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=800&h=600&fit=crop" },
  ],
};

export function MenuClient() {
  const [selectedCategory, setSelectedCategory] = useState("Breakfast");
  const visibleItems = menuItemsByCategory[selectedCategory] || [];

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
            <div className="w-full bg-gray-200 rounded-2xl p-1 grid grid-cols-5 gap-1">
              {menuCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`py-2 px-2 rounded-xl text-sm md:text-base font-medium transition-colors ${
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
                  <Button className="mt-auto bg-amber-600 hover:bg-amber-700 text-white w-full">Add to Order</Button>
                </div>
              </div>
            ))}
          </div>

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
