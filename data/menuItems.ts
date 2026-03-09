export interface MenuDisplayItem {
  name: string;
  price: string;
  description: string;
  image: string;
  subcategory?: string;
  category?: string;
}

export const menuCategories = ["Light Meals", "Dinner", "Desserts", "Beverages"];

export const categoryInfo: Record<string, string> = {
  "Light Meals": "All day dining",
  Dinner: " 17:30 PM - 19:30 PM daily",
  Desserts: "No specific timing",
  Beverages: "Alcoholic beverages available for guests 18 years and older",
};

export const localMenuItemsByCategory: Record<string, MenuDisplayItem[]> = {
  "Light Meals": [
    { name: "Cheese & Tomato", price: "R40", description: "Toasted sandwich with melted cheese and fresh tomato.", image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&h=600&fit=crop" },
    { name: "Chicken & Mayo", price: "R58", description: "Chicken mayo sandwich served fresh.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop" },
    { name: "Ham & Cheese", price: "R45", description: "Classic ham and cheese toasted sandwich.", image: "/menu/light-meal/ham-cheese.png" },
    { name: "Bacon, Egg & Cheese", price: "R56", description: "Hearty breakfast sandwich with bacon, egg, and cheese.", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop" },
    { name: "Tuna & Mayo", price: "R48", description: "Creamy tuna mayo sandwich.", image: "/menu/light-meal/tuna-mayo.png" },
    { name: "Lettuce, Cucumber, Tomato, Cheese & Mayo", price: "R56", description: "Fresh veggie and cheese sandwich with mayo.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop" },
    { name: "French Toast with Berries", price: "R62", description: "Golden French toast topped with seasonal berries.", image: "/menu/light-meal/french-toast.png" },
    { name: "Chicken Wings & Chips", price: "R85", description: "Crispy chicken wings served with chips.", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&h=600&fit=crop" },
    { name: "Chicken Wrap & Salad", price: "R98", description: "Chicken wrap served with a fresh side salad.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop" },
    { name: "Beef, Chili & Avo Wrap with Salad", price: "R110", description: "Spiced beef wrap with chili, avocado, and salad.", image: "/menu/light-meal/beef-chilli-avo.png" },
    { name: "Lekker Fish & Chips", price: "R75", description: "Crispy battered fish with golden chips.", image: "https://images.unsplash.com/photo-1579208030886-b937da0925dc?w=800&h=600&fit=crop" },
    { name: "Halloumi Wrap & Salad", price: "R80", description: "Grilled halloumi wrap served with salad.", image: "/menu/light-meal/halloumi-wrap.png" },
    { name: "Chicken & Chili Avo Wrap with Salad", price: "R98", description: "Chicken wrap with chili avocado and side salad.", image: "/menu/light-meal/chicken-chilli-avo.png" },
    { name: "Tuna Pasta Salad", price: "R68", description: "Cold pasta salad with tuna and herbs.", image: "/menu/light-meal/tuna-pasta-salad.png" },
    { name: "Chicken Burger & Chips", price: "R98", description: "Chicken burger served with crispy chips.", image: "https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=800&h=600&fit=crop" },
    { name: "Beef Burger & Chips", price: "R109", description: "Beef burger served with crispy chips.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop" },
    { name: "Cheese Burger & Chips", price: "R115", description: "Cheeseburger served with crispy chips.", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop" },
    { name: "Veg Burger & Chips", price: "R85", description: "Vegetarian burger served with crispy chips.", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&h=600&fit=crop" },
  ],
  Dinner: [
    { name: "Boerewors, Chakalaka & Pap", price: "R68", description: "Traditional boerewors served with chakalaka and pap.", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop" },
    { name: "Steak, Egg & Chips", price: "R98", description: "Grilled steak topped with egg and served with chips.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
    { name: "Mash, Sirloin, Honey Glazed Carrots", price: "R190", description: "Sirloin with creamy mash and honey glazed carrots.", image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&h=600&fit=crop" },
    { name: "Beef Stew with Rice or Pap", price: "R150", description: "Slow-cooked beef stew with your choice of rice or pap.", image: "/menu/dinner/beef-stew-with-rice.png" },
    { name: "Chicken A'la King with Rice or Ciabatta", price: "R140", description: "Creamy chicken a'la king served with rice or ciabatta.", image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&h=600&fit=crop" },
    { name: "Macaroni & Cheese", price: "R45", description: "Classic creamy baked macaroni and cheese.", image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&h=600&fit=crop" },
    { name: "Creamy Mushroom Penne Pasta", price: "R110", description: "Penne pasta in a rich creamy mushroom sauce.", image: "/menu/dinner/creamy-mushroom-penne.png" },
    { name: "Beef Lasagna & Salad", price: "R110", description: "Layered beef lasagna served with a fresh side salad.", image: "https://images.unsplash.com/photo-1619895092538-128341789043?w=800&h=600&fit=crop" },
    { name: "Butter Chicken with Naan or Rice & Carrot Salad", price: "R160", description: "Butter chicken with naan or rice, served with carrot salad.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop" },
    { name: "Chicken & Mushroom Pie & Salad", price: "R70", description: "Golden chicken and mushroom pie with side salad.", image: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=800&h=600&fit=crop" },
    { name: "Spaghetti Bolognaise", price: "R110", description: "Spaghetti with rich beef bolognaise sauce.", image: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=800&h=600&fit=crop" },
    { name: "Basil Pesto & Cherry Tomato Pasta", price: "R86", description: "Pasta tossed in basil pesto with cherry tomatoes.", image: "/menu/dinner/basil-pesto-cherry.png" },
    { name: "Alfredo (Chicken/Ham)", price: "R115", description: "Creamy Alfredo pasta with your choice of chicken or ham.", image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop" },
    { name: "78 Specialty Stir-fry Rice, Chicken & Avo", price: "R110", description: "House specialty stir-fry rice with chicken and avocado.", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop" },
    { name: "Stir-fry Rice, Avo Halloumi", price: "R99", description: "Stir-fry rice with avocado and grilled halloumi.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop" },
    { name: "Stir-fry Rice or Pap with Quarter Chicken", price: "R95", description: "Quarter chicken served with stir-fry rice or pap.", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&h=600&fit=crop" },
    { name: "Lamb Chops, Couscous & Veggies", price: "R260", description: "Lamb chops with couscous and seasonal vegetables.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop" },
    { name: "Beef Ribs, Chips/Salad", price: "R165", description: "Tender beef ribs with your choice of chips or salad.", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop" },
    { name: "Chicken Bunny & Carrot Salad", price: "R120", description: "Chicken bunny chow served with carrot salad.", image: "/menu/dinner/chicken-bunny-carrot.png" },
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
    { name: "Five Roses Tea", price: "R22", description: "Classic South African black tea blend.", image: "/menu/beverages/hot-drinks/roses-tea.jpeg", subcategory: "Hot Drinks" },
    { name: "Rooibos Tea", price: "R22", description: "Naturally caffeine-free South African rooibos tea.", image: "/menu/beverages/hot-drinks/rooibos-tea.jpeg", subcategory: "Hot Drinks" },
    { name: "Filter Coffee", price: "R26", description: "Freshly brewed filter coffee.", image: "/menu/beverages/hot-drinks/filter-coffee.jpeg", subcategory: "Hot Drinks" },
    { name: "Chai Tea", price: "R32", description: "Aromatic spiced tea with milk.", image: "/menu/beverages/hot-drinks/chai-tea.jpeg", subcategory: "Hot Drinks" },
    { name: "Cappuccino", price: "R33", description: "Espresso with steamed milk and foam.", image: "/menu/beverages/hot-drinks/cappuccino.jpeg", subcategory: "Hot Drinks" },
    { name: "Cappuccino & Cream", price: "R36", description: "Cappuccino topped with whipped cream.", image: "/menu/beverages/hot-drinks/cappuccino-cream.jpeg", subcategory: "Hot Drinks" },
    { name: "Hot Chocolate", price: "R38", description: "Rich and creamy hot chocolate.", image: "/menu/beverages/hot-drinks/hot-chocolate.jpeg", subcategory: "Hot Drinks" },
    { name: "Decaf", price: "R5", description: "Decaffeinated coffee option (add-on).", image: "/menu/beverages/hot-drinks/decaf-coffee.jpeg", subcategory: "Hot Drinks" },
    { name: "Almond Milk", price: "R6", description: "Dairy-free almond milk alternative (add-on).", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&h=600&fit=crop", subcategory: "Hot Drinks" },
    { name: "Iced Coffee", price: "R38", description: "Chilled coffee with ice.", image: "/menu/beverages/hot-drinks/ice-coffee.jpeg", subcategory: "Hot Drinks" },
    { name: "Banana Smoothie", price: "R46", description: "Banana, Oats, Dates & Cinnamon", image: "/menu/beverages/smoothies/banana-smoothie.jpeg", subcategory: "Smoothies" },
    { name: "Green Smoothie", price: "R52", description: "Apple, Cucumber, Banana, Spinach & Chia Seeds", image: "/menu/beverages/smoothies/green-smoothie.jpeg", subcategory: "Smoothies" },
    { name: "Orange Smoothie", price: "R50", description: "Orange, Carrots, Honey, Avocado", image: "/menu/beverages/smoothies/orange-smoothie.jpeg", subcategory: "Smoothies" },
    { name: "Beets Smoothie", price: "R49", description: "Beetroot, Mixed Berries, Milk, Banana, Yoghurt", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop", subcategory: "Smoothies" },
    { name: "Blueberry Smoothie", price: "R52", description: "Blueberries, Almonds, Chia Seeds, Oats", image: "/menu/beverages/smoothies/blueberry-smoothie.jpeg", subcategory: "Smoothies" },
    { name: "Orange Juice", price: "R38", description: "Freshly squeezed orange juice.", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Apple Juice", price: "R28", description: "Crisp and refreshing apple juice.", image: "/menu/beverages/fresh-juices/apple-juice.jpeg", subcategory: "Fresh Juices" },
    { name: "Orange & Pineapple", price: "R30", description: "Tropical blend of orange and pineapple.", image: "/menu/beverages/fresh-juices/orange-pineapple.jpeg", subcategory: "Fresh Juices" },
    { name: "Carrot & Orange", price: "R32", description: "Healthy combination of carrot and orange.", image: "/menu/beverages/fresh-juices/carrot-orange.jpeg", subcategory: "Fresh Juices" },
    { name: "Naartjie & Apple", price: "R30", description: "Sweet naartjie and apple blend.", image: "/menu/beverages/fresh-juices/naartjie-apple.jpeg", subcategory: "Fresh Juices" },
    { name: "Mixed Berries Juice", price: "R46", description: "Assorted fresh berries juice blend.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
    { name: "Mixed Fruits Juice", price: "R46", description: "Variety of fresh fruits juice blend.", image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&h=600&fit=crop", subcategory: "Fresh Juices" },
  ],
};
