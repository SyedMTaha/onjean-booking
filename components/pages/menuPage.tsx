"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const menuCategories = ["Light Meals", "Dinner", "Desserts", "Beverages"];

const categoryInfo: Record<string, string> = {
  // Breakfast: "7:00 AM - 11:00 AM daily",
  // Lunch: "12:00 PM - 4:00 PM daily",
  "Light Meals": "All day dining",
  Dinner: "6:00 PM - 10:30 PM daily",
  Desserts: "No specific timing",
  Beverages: "Alcoholic beverages available for guests 18 years and older",
};

const menuItemsByCategory: Record<string, Array<{ name: string; price: string; description: string; image: string; subcategory?: string }>> = {
  // Breakfast: [
  //   { name: "Continental Breakfast", price: "R180", description: "Fresh pastries, fruit, yogurt, and artisan coffee.", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop" },
  //   { name: "Full English Breakfast", price: "R250", description: "Eggs, bacon, sausage, beans, grilled tomato, and toast.", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop" },
  //   { name: "Avocado Toast Deluxe", price: "R210", description: "Sourdough toast, smashed avocado, poached egg, and herbs.", image: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800&h=600&fit=crop" },
  //   { name: "Berry Pancake Stack", price: "R195", description: "Fluffy pancakes with berries, cream, and maple syrup.", image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=600&fit=crop" },
  //   { name: "Healthy Granola Bowl", price: "R170", description: "Toasted granola, greek yogurt, chia seeds, and seasonal fruit.", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&h=600&fit=crop" },
  //   { name: "Smoked Salmon Bagel", price: "R230", description: "Toasted bagel with cream cheese, smoked salmon, and capers.", image: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800&h=600&fit=crop" },
  // ],
  // Lunch: [
  //   { name: "Peri-Peri Chicken Bowl", price: "R260", description: "Spiced grilled chicken with fragrant rice and greens.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop" },
  //   { name: "Grilled Fish & Veg", price: "R280", description: "Fresh daily catch served with seasonal vegetables.", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&h=600&fit=crop" },
  //   { name: "Chicken Caesar Salad", price: "R220", description: "Crisp romaine, parmesan, croutons, and grilled chicken.", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop" },
  //   { name: "Gourmet Beef Burger", price: "R240", description: "Juicy beef patty, cheddar, caramelized onion, and fries.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" },
  //   { name: "Vegetable Stir Fry", price: "R220", description: "Crisp vegetables in house Asian-style sauce with noodles.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop" },
  //   { name: "Mediterranean Wrap", price: "R210", description: "Grilled chicken, hummus, greens, and feta in warm flatbread.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop" },
  // ],
  "Light Meals": [
    { name: "Classic Beef Burger", price: "R85", description: "Juicy beef patty with lettuce, tomato, and fries.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" },
    { name: "Chicken Burger", price: "R80", description: "Grilled chicken breast with mayo and fries.", image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=800&h=600&fit=crop" },
    { name: "Veggie Burger", price: "R75", description: "Plant-based patty with fresh toppings.", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&h=600&fit=crop" },
    { name: "Chicken Wrap", price: "R70", description: "Grilled chicken, lettuce, and sauce in a wrap.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop" },
    { name: "Mediterranean Wrap", price: "R75", description: "Feta, olives, hummus, and veggies in a wrap.", image: "https://images.unsplash.com/photo-1674405660406-cdb1fc8c2487?w=800&h=600&fit=crop" },
    { name: "Beef Wrap", price: "R80", description: "Seasoned beef strips with fresh vegetables.", image: "https://images.unsplash.com/photo-1599932133652-e0cd0a7ee7f3?w=800&h=600&fit=crop" },
    { name: "Classic Fries", price: "R35", description: "Crispy golden french fries.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop" },
    { name: "Cheese Fries", price: "R45", description: "Fries topped with melted cheese.", image: "https://images.unsplash.com/photo-1630431341973-02e1d5281d74?w=800&h=600&fit=crop" },
    { name: "Loaded Fries", price: "R55", description: "Fries with cheese, bacon, and sour cream.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&h=600&fit=crop" },
    { name: "Chicken Wings", price: "R65", description: "Crispy wings with choice of sauce.", image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&h=600&fit=crop" },
    { name: "Chicken Strips", price: "R60", description: "Breaded chicken tenders with dipping sauce.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop" },
    { name: "Onion Rings", price: "R40", description: "Crispy battered onion rings.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&h=600&fit=crop" },
    { name: "Fish & Chips", price: "R90", description: "Battered fish with crispy fries.", image: "https://images.unsplash.com/photo-1580217593608-61931cefc821?w=800&h=600&fit=crop" },
    { name: "Chicken Quesadilla", price: "R75", description: "Chicken, cheese, and peppers in a tortilla.", image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=800&h=600&fit=crop" },
    { name: "Nachos Supreme", price: "R70", description: "Tortilla chips with cheese, salsa, and guacamole.", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&h=600&fit=crop" },
    { name: "Club Sandwich", price: "R85", description: "Triple-decker with chicken, bacon, and veggies.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop" },
    { name: "Grilled Cheese Sandwich", price: "R50", description: "Toasted bread with melted cheese.", image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&h=600&fit=crop" },
    { name: "Caesar Salad", price: "R65", description: "Crisp romaine with caesar dressing and croutons.", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop" },
  ],
  Dinner: [
    { name: "Boerewors, Chakalaka & Pap", price: "R68", description: "Traditional boerewors served with chakalaka and pap.", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop" },
    { name: "Steak, Egg & Chips", price: "R98", description: "Grilled steak topped with egg and served with chips.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
    { name: "Mash, Sirloin, Honey Glazed Carrots", price: "R190", description: "Sirloin with creamy mash and honey glazed carrots.", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=600&fit=crop" },
    { name: "Beef Stew with Rice or Pap", price: "R150", description: "Slow-cooked beef stew with your choice of rice or pap.", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop" },
    { name: "Chicken A'la King with Rice or Ciabatta", price: "R140", description: "Creamy chicken a'la king served with rice or ciabatta.", image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&h=600&fit=crop" },
    { name: "Macaroni & Cheese", price: "R45", description: "Classic creamy baked macaroni and cheese.", image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&h=600&fit=crop" },
    { name: "Creamy Mushroom Penne Pasta", price: "R110", description: "Penne pasta in a rich creamy mushroom sauce.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop" },
    { name: "Beef Lasagna & Salad", price: "R110", description: "Layered beef lasagna served with a fresh side salad.", image: "https://images.unsplash.com/photo-1619895092538-128341789043?w=800&h=600&fit=crop" },
    { name: "Butter Chicken with Naan or Rice & Carrot Salad", price: "R160", description: "Butter chicken with naan or rice, served with carrot salad.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop" },
    { name: "Chicken & Mushroom Pie & Salad", price: "R70", description: "Golden chicken and mushroom pie with side salad.", image: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=800&h=600&fit=crop" },
    { name: "Spaghetti Bolognaise", price: "R110", description: "Spaghetti with rich beef bolognaise sauce.", image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800&h=600&fit=crop" },
    { name: "Basil Pesto & Cherry Tomato Pasta", price: "R86", description: "Pasta tossed in basil pesto with cherry tomatoes.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop" },
    { name: "Alfredo (Chicken/Ham)", price: "R115", description: "Creamy Alfredo pasta with your choice of chicken or ham.", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop" },
    { name: "78 Specialty - Stir-fry Rice, Chicken & Avo", price: "R110", description: "House specialty stir-fry rice with chicken and avocado.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop" },
    { name: "Stir-fry Rice, Avo Halloumi", price: "R99", description: "Stir-fry rice with avocado and grilled halloumi.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop" },
    { name: "Stir-fry Rice or Pap with Quarter Chicken", price: "R95", description: "Quarter chicken served with stir-fry rice or pap.", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop" },
    { name: "Lamb Chops, Couscous & Veggies", price: "R260", description: "Lamb chops with couscous and seasonal vegetables.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
    { name: "Beef Ribs, Chips/Salad", price: "R165", description: "Tender beef ribs with your choice of chips or salad.", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop" },
    { name: "Chicken Bunny & Carrot Salad", price: "R120", description: "Chicken bunny chow served with carrot salad.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop" },
    { name: "Lamb Curry with Roti or Rice & Tomato Salad", price: "R210", description: "Lamb curry with roti or rice and tomato salad.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop" },
  ],
  Desserts: [
    { name: "Chocolate Brownie & Ice Cream", price: "R54", description: "Warm chocolate brownie served with vanilla ice cream.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop" },
    { name: "Fruit Compost", price: "R48", description: "Seasonal fruit mix served chilled.", image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&h=600&fit=crop" },
    { name: "Malva Pudding & Custard", price: "R70", description: "Classic South African malva pudding with warm custard.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop" },
    { name: "Strawberry Cheese Cake", price: "R65", description: "Creamy cheesecake topped with strawberry glaze.", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&h=600&fit=crop" },
    { name: "Lemon Cheese Cake", price: "R65", description: "Smooth lemon cheesecake with a citrus finish.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop" },
    { name: "Vanilla Ice Cream with Chocolate Sauce", price: "R36", description: "Vanilla ice cream drizzled with rich chocolate sauce.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop" },
    { name: "Cinnamon & Sugar Pancakes", price: "R32", description: "Soft pancakes dusted with cinnamon sugar.", image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&h=600&fit=crop" },
    { name: "Waffle with Ice Cream/ Cream", price: "R40", description: "Golden waffle served with ice cream or cream.", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&h=600&fit=crop" },
  ],
  Beverages: [
    // Hot Drinks
    { name: "Five Roses Tea", price: "R22", description: "Classic South African black tea blend.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Rooibos Tea", price: "R22", description: "Naturally caffeine-free South African rooibos tea.", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Filter Coffee", price: "R26", description: "Freshly brewed filter coffee.", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Chai Tea", price: "R32", description: "Aromatic spiced tea with milk.", image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Cappuccino", price: "R33", description: "Espresso with steamed milk and foam.", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Cappuccino & Cream", price: "R36", description: "Cappuccino topped with whipped cream.", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Hot Chocolate", price: "R38", description: "Rich and creamy hot chocolate.", image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Decaf", price: "R5", description: "Decaffeinated coffee option (add-on).", image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Almond Milk", price: "R6", description: "Dairy-free almond milk alternative (add-on).", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    // Smoothies
    { name: "Banana Smoothie", price: "R46", description: "Banana, Oats, Dates & Cinnamon", image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&h=600&fit=crop", subcategory: "Smoothies" },
    { name: "Green Smoothie", price: "R52", description: "Apple, Cucumber, Banana, Spinach & Chia Seeds", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&h=600&fit=crop", subcategory: "Smoothies" },
    { name: "Orange Smoothie", price: "R50", description: "Orange, Carrots, Honey, Avocado", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop", subcategory: "Smoothies" },
    { name: "Beets Smoothie", price: "R49", description: "Beetroot, Mixed Berries, Milk, Banana, Yoghurt", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop", subcategory: "Smoothies" },
    { name: "Blueberry Smoothie", price: "R52", description: "Blueberries, Almonds, Chia Seeds, Oats", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&h=600&fit=crop", subcategory: "Smoothies" },
    // Fresh Juices
    { name: "Orange Juice", price: "R38", description: "Freshly squeezed orange juice.", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Apple Juice", price: "R28", description: "Crisp and refreshing apple juice.", image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Orange & Pineapple", price: "R30", description: "Tropical blend of orange and pineapple.", image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Carrot & Orange", price: "R32", description: "Healthy combination of carrot and orange.", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Naartjie & Apple", price: "R30", description: "Sweet naartjie and apple blend.", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Mixed Berries Juice", price: "R46", description: "Assorted fresh berries juice blend.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Mixed Fruits Juice", price: "R46", description: "Variety of fresh fruits juice blend.", image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Iced Coffee", price: "R38", description: "Chilled coffee with ice.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
  ],
};

export function MenuClient() {
  const [selectedCategory, setSelectedCategory] = useState("Light Meals");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const visibleItems = menuItemsByCategory[selectedCategory] || [];

  // Group beverages by subcategory
  const groupedBeverages = selectedCategory === "Beverages" 
    ? visibleItems.reduce((acc: any, item: any) => {
        const subcat = item.subcategory || "Other";
        if (!acc[subcat]) acc[subcat] = [];
        acc[subcat].push(item);
        return acc;
      }, {})
    : null;

  const handleAddToCart = (item: any) => {
    if (!user) {
      toast.error("Please sign in before adding food to cart.");
      return;
    }

    // Extract price as number (remove "R" and convert to float)
    const priceNumber = parseFloat(item.price.replace("R", "").trim());
    
    addToCart({
      id: `${selectedCategory}-${item.name}`,
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
            <div className="w-full bg-gray-200 rounded-2xl p-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
              {menuCategories.map((category) => (
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
              {Object.entries(groupedBeverages).map(([subcategory, items]: [string, any]) => (
                <div key={subcategory}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{subcategory}</h3>
                    <div className="h-0.5 bg-[#EBECEE]"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item: any, index: number) => (
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
