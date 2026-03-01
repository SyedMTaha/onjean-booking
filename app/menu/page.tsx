import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu - 78 On Jean",
  description: "Explore our delicious dining options.",
};

const menuItems = [
  {
    category: "Breakfast",
    items: [
      { name: "Continental Breakfast", price: "R180", description: "Fresh pastries, fruit, and coffee" },
      { name: "Full English Breakfast", price: "R250", description: "Eggs, bacon, sausage, beans, toast" },
      { name: "Vegetarian Breakfast", price: "R220", description: "Toast, eggs, vegetables, fruit" },
    ]
  },
  {
    category: "Lunch",
    items: [
      { name: "Grilled Fish with Vegetables", price: "R280", description: "Fresh daily catch with seasonal vegetables" },
      { name: "Chicken Peri-Peri", price: "R260", description: "Spiced African chicken with rice" },
      { name: "Vegetable Stir Fry", price: "R220", description: "Mixed fresh vegetables in Asian sauce" },
    ]
  },
  {
    category: "Dinner",
    items: [
      { name: "Prime Rib Steak", price: "R450", description: "Premium cut grilled to perfection" },
      { name: "Lobster Tail", price: "R500", description: "Fresh lobster with butter sauce" },
      { name: "Duck Confit", price: "R380", description: "Tender duck leg with berry sauce" },
    ]
  },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Restaurant Menu</h1>
            <p className="text-xl text-gray-600">Culinary excellence in every dish</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {menuItems.map((section, index) => (
              <div key={index}>
                <h2 className="text-3xl font-bold text-amber-600 mb-6 pb-4 border-b-2 border-amber-200">
                  {section.category}
                </h2>
                <div className="space-y-6">
                  {section.items.map((item, i) => (
                    <div key={i} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <span className="text-amber-600 font-bold">{item.price}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
