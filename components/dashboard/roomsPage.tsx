"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BedDouble, CheckCircle2, DoorOpen, Edit3, Plus, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { addRoom, deleteRoom, getAllRooms, Room as DbRoom, toggleRoomAvailability, updateRoom } from "@/lib/roomService";

type RoomStatus = "available" | "unavailable";

interface RoomForm {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
  imageList: string;
  maxGuests: string;
  bedType: string;
  size: string;
  view: string;
  description: string;
  longDescription: string;
  amenities: string;
  features: string;
  available: boolean;
}

function getStatusBadgeClass(status: RoomStatus): string {
  switch (status) {
    case "available":
      return "bg-[#007A55]/10 text-[#007A55] border-[#007A55]/30";
    case "unavailable":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function getEmptyForm(): RoomForm {
  return {
    id: "",
    name: "",
    slug: "",
    price: "",
    image: "",
    imageList: "",
    maxGuests: "2",
    bedType: "",
    size: "",
    view: "",
    description: "",
    longDescription: "",
    amenities: "",
    features: "",
    available: true,
  };
}

export function RoomsManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState<DbRoom[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<RoomForm>(getEmptyForm());

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRooms();
      setRooms(data);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Failed to load rooms from database.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasSession = localStorage.getItem("dashboardAdminSession") === "true";

    if (!hasSession) {
      toast.error("Please sign in with admin credentials to access rooms.");
      router.push("/");
      setIsAuthLoading(false);
      return;
    }

    setIsAdminAuthenticated(true);
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadRooms();
    }
  }, [isAdminAuthenticated]);

  const openAddModal = () => {
    setMode("add");
    setForm(getEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (room: DbRoom) => {
    setMode("edit");
    setForm({
      id: room.id,
      name: room.name,
      slug: room.slug,
      price: room.price,
      image: room.image,
      imageList: (room.images || []).join(", "),
      maxGuests: String(room.maxGuests),
      bedType: room.bedType,
      size: room.size,
      view: room.view || "",
      description: room.description,
      longDescription: room.longDescription || "",
      amenities: (room.amenities || []).join(", "),
      features: (room.features || []).join(", "),
      available: room.available,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof RoomForm, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from name if name is being changed
      if (field === "name" && typeof value === "string") {
        updated.slug = slugify(value);
      }
      
      return updated;
    });
  };

  const submitForm = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.image.trim()) {
      toast.error("Name, price, and main image are required.");
      return;
    }

    const guests = parseInt(form.maxGuests, 10);
    if (Number.isNaN(guests) || guests < 1) {
      toast.error("Max guests must be at least 1.");
      return;
    }

    const computedSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.name);
    const priceNumeric = parseInt(form.price.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(priceNumeric)) {
      toast.error("Price format is invalid. Example: R2,500");
      return;
    }

    const imageList = parseList(form.imageList);
    const images = imageList.length > 0 ? imageList : [form.image.trim()];
    if (!images.includes(form.image.trim())) {
      images.unshift(form.image.trim());
    }

    const payload = {
      name: form.name.trim(),
      slug: computedSlug,
      price: form.price.trim(),
      priceNumeric,
      image: form.image.trim(),
      images,
      maxGuests: guests,
      bedType: form.bedType.trim(),
      size: form.size.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || form.description.trim(),
      amenities: parseList(form.amenities),
      features: parseList(form.features),
      view: form.view.trim() || "City View",
      available: form.available,
    };

    setIsSaving(true);
    try {
      const result =
        mode === "add"
          ? await addRoom(payload)
          : await updateRoom(form.id, payload);

      if (!result.success) {
        toast.error(result.error || `Failed to ${mode} room.`);
        return;
      }

      toast.success(mode === "add" ? "Room added successfully." : "Room updated successfully.");
      setIsModalOpen(false);
      setForm(getEmptyForm());
      await loadRooms();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${mode} room.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (room: DbRoom) => {
    const confirmed = window.confirm(`Delete ${room.name}? This cannot be undone.`);
    if (!confirmed) return;

    const result = await deleteRoom(room.id);
    if (!result.success) {
      toast.error(result.error || "Failed to delete room.");
      return;
    }

    toast.success("Room deleted.");
    await loadRooms();
  };

  const handleToggleAvailability = async (room: DbRoom) => {
    const result = await toggleRoomAvailability(room.id, !room.available);
    if (!result.success) {
      toast.error(result.error || "Failed to update availability.");
      return;
    }

    toast.success(`Room marked as ${!room.available ? "available" : "unavailable"}.`);
    await loadRooms();
  };

  const filteredRooms = rooms.filter((room) => {
    const needle = search.trim().toLowerCase();
    if (needle.length === 0) return true;

    return (
      room.name.toLowerCase().includes(needle) ||
      room.slug.toLowerCase().includes(needle) ||
      room.bedType.toLowerCase().includes(needle) ||
      room.view?.toLowerCase().includes(needle) ||
      room.size.toLowerCase().includes(needle)
    );
  });

  const totals = {
    total: rooms.length,
    available: rooms.filter((r) => r.available).length,
    unavailable: rooms.filter((r) => !r.available).length,
    avgPrice:
      rooms.length > 0
        ? Math.round(rooms.reduce((sum, room) => sum + (room.priceNumeric || 0), 0) / rooms.length)
        : 0,
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
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel rooms and their availability</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by room name, slug, view, or type"
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>

          <Button className="h-10 bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white rounded-xl lg:ml-auto" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Room
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.available}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DoorOpen className="h-5 w-5" />
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
                <p className="text-sm text-gray-600">Average Rate</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">R{totals.avgPrice.toLocaleString()}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <BedDouble className="h-5 w-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totals.total}</p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <DoorOpen className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No rooms found.</div>
          ) : (
            filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
              >
                <div className="relative">
                  <img src={room.image} alt={room.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeClass(room.available ? "available" : "unavailable")} capitalize text-xs backdrop-blur-sm bg-white/90`}
                    >
                      {room.available ? "available" : "unavailable"}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="h-14">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{room.name}</h3>
                    <p className="text-xs text-gray-500 truncate">/{room.slug}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm h-24">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs mb-1">Guests</span>
                      <span className="font-semibold text-gray-900 truncate">{room.maxGuests} persons</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs mb-1">Bed Type</span>
                      <span className="font-semibold text-gray-900 truncate">{room.bedType}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs mb-1">Size</span>
                      <span className="font-semibold text-gray-900 truncate">{room.size}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs mb-1">View</span>
                      <span className="font-semibold text-gray-900 truncate">{room.view || "City"}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-3 h-8">
                      <span className="text-sm text-gray-600">Rate per night</span>
                      <span className="text-2xl font-bold text-gray-900">{room.price}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline" className="text-xs bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-200" onClick={() => openEditModal(room)}>
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`text-xs bg-white border px-1 ${room.available ? 'hover:bg-amber-50 text-amber-600 hover:text-amber-700 border-amber-200' : 'hover:bg-green-50 text-green-600 hover:text-green-700 border-green-200'}`}
                        onClick={() => handleToggleAvailability(room)}
                      >
                        {room.available ? (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span className="ml-1 hidden xl:inline">Off</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span className="ml-1 hidden xl:inline">On</span>
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200" onClick={() => handleDelete(room)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] bg-white border-gray-200 flex flex-col">
              {/* Fixed Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{mode === "add" ? "Add New Room" : "Edit Room"}</h2>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                  Close
                </Button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Room Name *</label>
                      <Input placeholder="e.g., Deluxe Suite" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} className="text-gray-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">URL Slug (Auto-generated)</label>
                      <Input placeholder="Auto-generated from room name" value={form.slug} disabled className="text-gray-900 bg-gray-50 cursor-not-allowed" />
                      <p className="text-xs text-gray-500 mt-1">Used in web address: /rooms/{form.slug || 'url-slug'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Price per Night *</label>
                      <Input placeholder="e.g., R2,500" value={form.price} onChange={(e) => handleFormChange("price", e.target.value)} className="text-gray-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Max Guests *</label>
                      <Input
                        placeholder="Number of guests"
                        type="number"
                        min={1}
                        value={form.maxGuests}
                        onChange={(e) => handleFormChange("maxGuests", e.target.value)}
                        className="text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Bed Type</label>
                      <Input placeholder="e.g., King Bed" value={form.bedType} onChange={(e) => handleFormChange("bedType", e.target.value)} className="text-gray-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Room Size</label>
                      <Input placeholder="e.g., 25 m²" value={form.size} onChange={(e) => handleFormChange("size", e.target.value)} className="text-gray-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">View</label>
                      <Input placeholder="e.g., Ocean View" value={form.view} onChange={(e) => handleFormChange("view", e.target.value)} className="text-gray-900" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Main Image URL *</label>
                      <Input placeholder="https://example.com/image.jpg" value={form.image} onChange={(e) => handleFormChange("image", e.target.value)} className="text-gray-900" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Additional Images</label>
                    <Input
                      placeholder="Comma-separated image URLs"
                      value={form.imageList}
                      onChange={(e) => handleFormChange("imageList", e.target.value)}
                      className="text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple URLs with commas</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Amenities</label>
                    <Input
                      placeholder="e.g., WiFi, Air Conditioning, Mini Bar"
                      value={form.amenities}
                      onChange={(e) => handleFormChange("amenities", e.target.value)}
                      className="text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Features</label>
                    <Input
                      placeholder="e.g., Balcony, Sea View, Non-Smoking"
                      value={form.features}
                      onChange={(e) => handleFormChange("features", e.target.value)}
                      className="text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Short Description</label>
                    <Input
                      placeholder="Brief room description"
                      value={form.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      className="text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Long Description</label>
                    <Input
                      placeholder="Detailed room description"
                      value={form.longDescription}
                      onChange={(e) => handleFormChange("longDescription", e.target.value)}
                      className="text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
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
                    {isSaving ? "Saving..." : mode === "add" ? "Add Room" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
