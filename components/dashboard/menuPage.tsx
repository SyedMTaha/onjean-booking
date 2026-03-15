"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ChefHat, Edit3, Plus, Search, Trash2, Utensils, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  addMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  MenuItem,
  toggleMenuItemAvailability,
  updateMenuItem,
} from "@/lib/menuService";

interface MenuItemForm {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: string;
  image: string | File;
  description: string;
  available: boolean;
}

function getEmptyForm(): MenuItemForm {
  return {
    id: "",
    name: "",
    category: "Light Meals",
    subcategory: "",
    price: "",
    image: "",
    description: "",
    available: true,
  };
}

function getStatusBadgeClass(available: boolean): string {
  return available
    ? "bg-[#007A55]/10 text-[#007A55] border-[#007A55]/30"
    : "bg-red-100 text-red-700 border-red-300";
}

const presetCategories = ["Light Meals", "Dinner", "Desserts", "Beverages"];

export function MenuManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<MenuItemForm>(getEmptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item?: MenuItem }>({ open: false });

  // ✅ Fix 1: moved inside component so it has access to setForm
  const removeMainImage = () => {
    setForm((prev: MenuItemForm) => ({ ...prev, image: "" }));
  };

  // ✅ Fix 2: price handler — strips non-digits and always prepends "R"
  // User types "150" → stored and displayed as "R150"
  // User types "R150" → stored as "R150" (R not doubled)
  const handlePriceChange = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    const formatted = digits ? `R${digits}` : "";
    handleFormChange("price", formatted);
  };

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMenuItems();
      setItems(data);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to load menu items.";
      if (message === "PERMISSION_DENIED") {
        toast.error("Menu permissions not configured", {
          description: "Please add Firestore rules for the menuItems collection.",
        });
      } else if (message === "AUTH_ERROR") {
        toast.error("Authentication error while loading menu items.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";
    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access menu management.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }
    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadItems();
    }
  }, [isAdminAuthenticated]);

  const openAddModal = () => {
    setMode("add");
    setForm(getEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setMode("edit");
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || "",
      price: item.price,
      image: item.image,
      description: item.description,
      available: item.available,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof MenuItemForm, value: string | boolean | File) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  const submitForm = async () => {
    if (!form.name.trim() || !form.category.trim() || !form.price.trim() || !form.image) {
      toast.error("Name, category, price and image are required.");
      return;
    }
    if (form.category === "Beverages" && !form.subcategory.trim()) {
      toast.error("Subcategory is required for Beverages.");
      return;
    }
    const priceNumeric = parseInt(form.price.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(priceNumeric)) {
      toast.error("Price format is invalid. Example: R120");
      return;
    }

    const docId = `${slugify(form.category)}-${slugify(form.name)}`;

    let imageUrl = form.image;
    if (typeof form.image === "object" && form.image instanceof File) {
      const formData = new FormData();
      formData.append("file", form.image);
      formData.append("fileName", form.image.name);
      let folder = "";
      if (form.category === "Beverages" && form.subcategory.trim()) {
        folder = `/menu/Beverages/${slugify(form.subcategory)}`;
      } else {
        folder = `/menu/${slugify(form.category)}`;
      }
      formData.append("folder", folder);
      const res = await fetch("/api/imagekit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.url) {
        toast.error(data.error || "Image upload failed.");
        return;
      }
      imageUrl = data.url;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: form.price.trim(), // already "R150" format
      priceNumeric,
      image: typeof imageUrl === "string" ? imageUrl : "",
      description: form.description.trim(),
      available: form.available,
      ...(form.category === "Beverages" && form.subcategory.trim() && { subcategory: form.subcategory.trim() }),
    };

    setIsSaving(true);
    try {
      let result;
      if (mode === "add") {
        result = await addMenuItem(payload, docId);
      } else {
        result = await updateMenuItem(form.id, payload);
      }
      if (!result.success) {
        toast.error(result.error || `Failed to ${mode} menu item.`);
        return;
      }
      toast.success(mode === "add" ? "Menu item added." : "Menu item updated.");
      setIsModalOpen(false);
      setForm(getEmptyForm());
      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${mode} menu item.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (item: MenuItem) => {
    setDeleteConfirm({ open: true, item });
  };

  const confirmDeleteMenuItem = async () => {
    if (!deleteConfirm.item) return;
    setIsSaving(true);
    setItems(prev => prev.filter(i => i.id !== deleteConfirm.item!.id));
    setDeleteConfirm({ open: false });
    const result = await deleteMenuItem(deleteConfirm.item.id);
    if (!result.success) {
      toast.error(result.error || "Failed to delete menu item.");
      await loadItems();
      setIsSaving(false);
      return;
    }
    toast.success("Menu item deleted.");
    setIsSaving(false);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const result = await toggleMenuItemAvailability(item.id, !item.available);
    if (!result.success) {
      toast.error(result.error || "Failed to update availability.");
      return;
    }
    toast.success(`Item marked as ${!item.available ? "available" : "unavailable"}.`);
    await loadItems();
  };

  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      [item.name, item.category, item.subcategory || "", item.description]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [items, search]);

  const totals = {
    total: items.length,
    available: items.filter((item) => item.available).length,
    unavailable: items.filter((item) => !item.available).length,
    categories: new Set(items.map((item) => item.category)).size,
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] py-6 md:py-8">
      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage food and beverage items visible on the website menu</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.available}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Unavailable</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.unavailable}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.categories}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <ChefHat className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.total}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Utensils className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category or description"
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>
          <Button className="h-10 bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white rounded-xl lg:ml-auto" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading menu items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No menu items found.</div>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
              >
                <div className="relative">
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeClass(item.available)} capitalize text-xs backdrop-blur-sm bg-white/90`}
                    >
                      {item.available ? "available" : "unavailable"}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="h-14">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {item.category}{item.subcategory ? ` • ${item.subcategory}` : ""}
                    </p>
                  </div>
                  <div className="h-10">
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-3 h-8">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="text-2xl font-bold text-gray-900">{item.price}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline" className="text-xs bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-200" onClick={() => openEditModal(item)}>
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs bg-white border px-1 ${item.available ? "hover:bg-amber-50 text-amber-600 hover:text-amber-700 border-amber-200" : "hover:bg-green-50 text-green-600 hover:text-green-700 border-green-200"}`}
                        onClick={() => handleToggleAvailability(item)}
                      >
                        {item.available ? (
                          <><XCircle className="h-3 w-3" /><span className="ml-1 hidden xl:inline">Off</span></>
                        ) : (
                          <><CheckCircle2 className="h-3 w-3" /><span className="ml-1 hidden xl:inline">On</span></>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          tabIndex={-1}
          onKeyDown={(e) => { if (e.key === "Escape") setIsModalOpen(false); }}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-white border-gray-200 flex flex-col rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === "add" ? "Add Menu Item" : "Edit Menu Item"}
              </h2>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Image Picker */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Image *</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFormChange("image", file ?? "");
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {form.image && (
                      <div className="mt-2 relative inline-block">
                        <img
                          src={
                            typeof form.image === "object" && form.image instanceof File
                              ? URL.createObjectURL(form.image)
                              : form.image
                          }
                          alt="Preview"
                          className="h-24 rounded-md border border-black object-cover"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {typeof form.image === "object" && form.image instanceof File ? form.image.name : null}
                        </div>
                        <button
                          type="button"
                          onClick={removeMainImage}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 border border-gray-300 shadow hover:bg-gray-100"
                          title="Remove image"
                        >
                          <XCircle className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Item Name */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Item Name *</label>
                    <Input
                      placeholder="e.g., Cappuccino"
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="text-gray-900"
                    />
                  </div>

                  {/* ✅ Price with forced R prefix */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Price *</label>
                    <Input
                      placeholder="e.g., 150"
                      value={form.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="text-gray-900"
                    />
                    {form.price && (
                      <p className="text-xs text-gray-500 mt-1">
                        Saves as: <span className="font-semibold text-gray-700">{form.price}</span>
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                    <Select value={form.category} onValueChange={(value) => handleFormChange("category", value)}>
                      <SelectTrigger className="h-10 w-full text-gray-900 border-input bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <SelectValue placeholder="Choose category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {presetCategories.map((category) => (
                          <SelectItem key={category} value={category} className="text-gray-900 hover:bg-orange-50 focus:bg-orange-50">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Choose from: Light Meals, Dinner, Desserts, Beverages</p>
                  </div>

                  {/* Subcategory — only for Beverages */}
                  {form.category === "Beverages" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Subcategory <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Hot Drinks"
                        value={form.subcategory}
                        onChange={(e) => handleFormChange("subcategory", e.target.value)}
                        className={"text-gray-900 " + (!form.subcategory.trim() ? "border-red-500" : "")}
                      />
                      {!form.subcategory.trim() && (
                        <p className="text-xs text-red-500 mt-1">Subcategory is required for Beverages.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <Input
                    placeholder="Brief description of the menu item"
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    className="text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-md">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => handleFormChange("available", e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="font-medium">Mark as Available</span>
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={submitForm} disabled={isSaving} className="bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white">
                  {isSaving ? "Saving..." : mode === "add" ? "Add Item" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-md shadow-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Menu Item</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-bold">{deleteConfirm.item?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm({ open: false })}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteMenuItem}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}