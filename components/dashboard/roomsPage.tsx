"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BedDouble, CalendarDays, DoorOpen, Edit3, Plus, Search, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { addRoom, deleteRoom, getAllRooms, Room as DbRoom, updateRoom } from "@/lib/roomService";

// ─── Types ────────────────────────────────────────────────────────────────────

type RoomStatus = "available" | "unavailable" | "partial";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

interface DateRange {
  from: string; // "YYYY-MM-DD"
  to: string;   // "YYYY-MM-DD"
}

interface AvailabilitySchedule {
  // Date ranges when room IS available
  dateRanges: DateRange[];
  // Days of week room is available (empty = all days)
  daysOfWeek: DayOfWeek[];
}

interface RoomForm {
  id: string;
  name: string;
  slug: string;
  price: string;
  totalUnits: string;
  image: string | File;
  imageList: string | File[];
  maxGuests: string;
  bedType: string;
  size: string;
  view: string;
  description: string;
  longDescription: string;
  amenities: string;
  features: string;
  availability: AvailabilitySchedule;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEmptyAvailability(): AvailabilitySchedule {
  return { dateRanges: [], daysOfWeek: [] };
}

function getEmptyForm(): RoomForm {
  return {
    id: "",
    name: "",
    slug: "",
    price: "",
    totalUnits: "1",
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
    availability: getEmptyAvailability(),
  };
}

function slugify(value: string): string {
  return value.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseList(value: string): string[] {
  return value.split(",").map(i => i.trim()).filter(i => i.length > 0);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

/** Derive a display status from the availability schedule */
function deriveStatus(availability: AvailabilitySchedule | undefined): RoomStatus {
  if (!availability) return "unavailable";
  const { dateRanges, daysOfWeek } = availability;
  if (dateRanges.length === 0 && daysOfWeek.length === 0) return "unavailable";
  if (daysOfWeek.length > 0 && daysOfWeek.length < 7) return "partial";
  if (dateRanges.length > 0) return "available";
  return "available";
}

function getStatusBadgeClass(status: RoomStatus): string {
  if (status === "available") return "bg-[#007A55]/10 text-[#007A55] border-[#007A55]/30";
  if (status === "partial")   return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-red-100 text-red-700 border-red-300";
}

function getStatusLabel(status: RoomStatus): string {
  if (status === "available") return "Available";
  if (status === "partial")   return "Partial";
  return "Unavailable";
}

// ─── Sub-component: Availability Builder ──────────────────────────────────────

function AvailabilityBuilder({
  value,
  onChange,
}: {
  value: AvailabilitySchedule;
  onChange: (v: AvailabilitySchedule) => void;
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");

  const addRange = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both a from and to date.");
      return;
    }
    if (fromDate > toDate) {
      toast.error("From date must be before or equal to the to date.");
      return;
    }
    onChange({
      ...value,
      dateRanges: [...value.dateRanges, { from: fromDate, to: toDate }],
    });
    setFromDate("");
    setToDate("");
  };

  const removeRange = (idx: number) => {
    const updated = value.dateRanges.filter((_, i) => i !== idx);
    onChange({ ...value, dateRanges: updated });
  };

  const toggleDay = (day: DayOfWeek) => {
    const already = value.daysOfWeek.includes(day);
    const updated  = already
      ? value.daysOfWeek.filter(d => d !== day)
      : [...value.daysOfWeek, day];
    onChange({ ...value, daysOfWeek: updated });
  };

  const selectAllDays = () => {
    onChange({ ...value, daysOfWeek: [...DAYS_OF_WEEK] });
  };

  const clearAllDays = () => {
    onChange({ ...value, daysOfWeek: [] });
  };

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-4">

      {/* ── Days of Week ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Available Days of the Week</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAllDays}
              className="text-xs text-blue-600 hover:underline"
            >
              Select all
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAllDays}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => {
            const active = value.daysOfWeek.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                  active
                    ? "bg-[#2B7FFF] text-white border-[#2B7FFF] shadow-sm"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#2B7FFF] hover:text-[#2B7FFF]"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
        {value.daysOfWeek.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Available on: <span className="font-medium text-gray-700">{value.daysOfWeek.join(", ")}</span>
          </p>
        )}
        {value.daysOfWeek.length === 0 && (
          <p className="text-xs text-amber-600 mt-2">No days selected — room will show as unavailable.</p>
        )}
      </div>

      {/* ── Date Ranges ── */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Available Date Ranges</label>

        {/* Add range row */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">From</p>
            <input
              type="date"
              min={today()}
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">To</p>
            <input
              type="date"
              min={fromDate || today()}
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button
            type="button"
            onClick={addRange}
            className="h-10 bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white px-4 shrink-0"
          >
            + Add Range
          </Button>
        </div>

        {/* Existing ranges */}
        {value.dateRanges.length > 0 && (
          <div className="mt-3 space-y-2">
            {value.dateRanges.map((range, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CalendarDays className="h-4 w-4 text-[#2B7FFF]" />
                  <span className="font-medium">{range.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{range.to}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRange(idx)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {value.dateRanges.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">No date ranges added yet. Add a range above.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RoomsManagementClient() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading]           = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading]                   = useState(true);
  const [isSaving, setIsSaving]                     = useState(false);
  const [isAdding, setIsAdding]                     = useState(false);
  const [rooms, setRooms]                           = useState<DbRoom[]>([]);
  const [search, setSearch]                         = useState("");
  const [isModalOpen, setIsModalOpen]               = useState(false);
  const [mode, setMode]                             = useState<"add" | "edit">("add");
  const [form, setForm]                             = useState<RoomForm>(getEmptyForm());
  const [deleteConfirm, setDeleteConfirm]           = useState<{ open: boolean; room?: DbRoom }>({ open: false });

  const removeMainImage = () => setForm(prev => ({ ...prev, image: "" }));

  const removeAdditionalImage = (idx: number) => {
    setForm(prev => {
      if (Array.isArray(prev.imageList)) {
        const n = prev.imageList.slice(); n.splice(idx, 1);
        return { ...prev, imageList: n };
      }
      if (typeof prev.imageList === "string") {
        const urls = prev.imageList.split(",").map(u => u.trim());
        urls.splice(idx, 1);
        return { ...prev, imageList: urls.join(", ") };
      }
      return prev;
    });
  };

  const handlePriceChange = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    handleFormChange("price", digits ? `R${digits}` : "");
  };

  const handleSizeChange = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    handleFormChange("size", digits ? `${digits} m²` : "");
  };

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      setRooms(await getAllRooms());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load rooms.");
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

  useEffect(() => { if (isAdminAuthenticated) loadRooms(); }, [isAdminAuthenticated]);

  const openAddModal = () => {
    setMode("add"); setForm(getEmptyForm()); setIsAdding(false); setIsModalOpen(true);
  };

  const openEditModal = (room: DbRoom) => {
    setMode("edit");
    setIsAdding(false);
    setForm({
      id: room.id,
      name: room.name,
      slug: room.slug,
      price: room.price,
      totalUnits: String(room.totalUnits || 1),
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
      // Load existing availability or default to empty
      availability: (room as any).availability || getEmptyAvailability(),
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (field: keyof RoomForm, value: string | boolean | File | File[] | AvailabilitySchedule) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && typeof value === "string") updated.slug = slugify(value);
      return updated;
    });
  };

  const submitForm = async () => {
    if (!form.name.trim() || !form.price.trim() || (typeof form.image === "string" ? !form.image.trim() : !form.image)) {
      toast.error("Name, price, and main image are required."); return;
    }
    const guests = parseInt(form.maxGuests, 10);
    if (Number.isNaN(guests) || guests < 1) { toast.error("Max guests must be at least 1."); return; }
    const totalUnits = parseInt(form.totalUnits, 10);
    if (Number.isNaN(totalUnits) || totalUnits < 1) { toast.error("Total units must be at least 1."); return; }

    // Availability must have at least days or a date range
    if (form.availability.daysOfWeek.length === 0 && form.availability.dateRanges.length === 0) {
      toast.error("Please set at least one available day or date range.");
      return;
    }

    const computedSlug  = form.slug.trim() ? slugify(form.slug) : slugify(form.name);
    const priceNumeric  = parseInt(form.price.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(priceNumeric)) { toast.error("Price format is invalid. Example: R2500"); return; }

    let imageUrl = typeof form.image === "string" ? form.image.trim() : "";

    const allRooms  = await getAllRooms();
    const maxId     = allRooms.reduce((max, r) => { const n = parseInt(r.id, 10); return !isNaN(n) && n > max ? n : max; }, 0);
    const nextId    = String(maxId + 1);
    const folder    = `/rooms/r${nextId}-${slugify(form.name)}`;

    const ikUpload = async (file: File) => {
      const fd = new FormData();
      fd.append("file", file); fd.append("fileName", file.name); fd.append("folder", folder);
      const res  = await fetch("/api/imagekit", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || "Image upload failed.");
      return data.url as string;
    };

    if (typeof form.image === "object" && Object.prototype.toString.call(form.image) === "[object File]") {
      imageUrl = await ikUpload(form.image as File);
    }

    let images: string[] = [];
    if (Array.isArray(form.imageList)) {
      for (const f of form.imageList)
        if (Object.prototype.toString.call(f) === "[object File]") images.push(await ikUpload(f as File));
    } else if (typeof form.imageList === "string" && form.imageList.length > 0) {
      images = parseList(form.imageList);
    }
    if (!images.includes(imageUrl)) images.unshift(imageUrl);

    // Derive a simple boolean `available` for backwards compat
    const available = form.availability.daysOfWeek.length > 0 || form.availability.dateRanges.length > 0;

    const basePayload = {
      name: form.name.trim(),
      slug: computedSlug,
      price: form.price.trim(),
      priceNumeric,
      image: imageUrl,
      images,
      maxGuests: guests,
      totalUnits,
      bedType: form.bedType.trim(),
      size: form.size.trim(),
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || form.description.trim(),
      amenities: parseList(form.amenities),
      features: parseList(form.features),
      view: form.view.trim() || "City View",
      available,
      availability: form.availability, // full schedule saved to DB
    };

    setIsSaving(true);
    if (mode === "add") setIsAdding(true);
    try {
      const result = mode === "add"
        ? await addRoom({ id: nextId, ...basePayload })
        : await updateRoom(form.id, basePayload);

      if (!result.success) { toast.error(result.error || `Failed to ${mode} room.`); return; }

      toast.success(mode === "add" ? "Room added successfully." : "Room updated successfully.");
      setIsModalOpen(false);
      setForm(getEmptyForm());
      await loadRooms();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${mode} room.`);
    } finally {
      setIsSaving(false); setIsAdding(false);
    }
  };

  const handleDelete = (room: DbRoom) => setDeleteConfirm({ open: true, room });

  const confirmDeleteRoom = async () => {
    if (!deleteConfirm.room) return;
    setIsSaving(true);
    setRooms(prev => prev.filter(r => r.id !== deleteConfirm.room!.id));
    setDeleteConfirm({ open: false });
    const result = await deleteRoom(deleteConfirm.room.id);
    if (!result.success) {
      toast.error(result.error || "Failed to delete room.");
      await loadRooms();
    } else {
      toast.success("Room deleted.");
      await loadRooms();
    }
    setIsSaving(false);
  };

  const filteredRooms = rooms.filter(room => {
    const n = search.trim().toLowerCase();
    if (!n) return true;
    return [room.name, room.slug, room.bedType, room.view || "", room.size].join(" ").toLowerCase().includes(n);
  });

  const totals = {
    total:       rooms.length,
    available:   rooms.filter(r => r.available).length,
    unavailable: rooms.filter(r => !r.available).length,
    avgPrice:    rooms.length > 0
      ? Math.round(rooms.reduce((s, r) => s + (r.priceNumeric || 0), 0) / rooms.length)
      : 0,
  };

  if (isAuthLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <p className="text-gray-600 text-lg">Verifying admin access...</p>
    </div>
  );
  if (!isAdminAuthenticated) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <p className="text-gray-600 text-lg">Redirecting...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] py-6 md:py-8">

      {/* ── Delete Confirmation ── */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-md shadow-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Room</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-bold">{deleteConfirm.room?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm({ open: false })}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDeleteRoom}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">Manage hotel rooms and their availability schedules</p>
        </div>

        {/* ── Search + Add ── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by room name, slug, view, or type"
              className="h-10 pl-10 placeholder:text-gray-400 text-gray-900 border-gray-300 bg-white rounded-xl"
            />
          </div>
          <Button className="h-10 bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white rounded-xl lg:ml-auto" onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />Add New Room
          </Button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Available",    value: totals.available,               icon: <DoorOpen className="h-5 w-5" />,   color: "bg-emerald-100 text-emerald-700" },
            { label: "Unavailable",  value: totals.unavailable,             icon: <XCircle className="h-5 w-5" />,    color: "bg-rose-100 text-rose-700"      },
            { label: "Average Rate", value: `R${totals.avgPrice.toLocaleString()}`, icon: <BedDouble className="h-5 w-5" />, color: "bg-blue-100 text-blue-700" },
            { label: "Total Rooms",  value: totals.total,                   icon: <DoorOpen className="h-5 w-5" />,   color: "bg-gray-100 text-gray-700"      },
          ].map(({ label, value, icon, color }) => (
            <Card key={label} className="p-5 bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Room Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading rooms...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No rooms found.</div>
          ) : filteredRooms.map(room => {
            const avail      = (room as any).availability as AvailabilitySchedule | undefined;
            const status     = deriveStatus(avail);
            const daysLabel  = avail?.daysOfWeek?.length ? avail.daysOfWeek.map(d => d.slice(0,3)).join(", ") : "—";
            const rangeCount = avail?.dateRanges?.length ?? 0;

            return (
              <Card key={room.id} className="bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden">
                <div className="relative">
                  <img src={room.image} alt={room.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className={`${getStatusBadgeClass(status)} capitalize text-xs backdrop-blur-sm bg-white/90`}>
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{room.name}</h3>
                    <p className="text-xs text-gray-500 truncate">/{room.slug}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {room.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500 text-xs">Guests</span><p className="font-semibold text-gray-900 truncate">{room.maxGuests} persons</p></div>
                    <div><span className="text-gray-500 text-xs">Bed</span><p className="font-semibold text-gray-900 truncate">{room.bedType}</p></div>
                    <div><span className="text-gray-500 text-xs">Size</span><p className="font-semibold text-gray-900 truncate">{room.size}</p></div>
                    <div><span className="text-gray-500 text-xs">View</span><p className="font-semibold text-gray-900 truncate">{room.view || "City"}</p></div>
                  </div>

                  {/* Availability summary on card */}
                  <div className="rounded-md bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-[#2B7FFF]" />
                      <span><span className="font-medium">Days:</span> {daysLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-[#2B7FFF]" />
                      <span><span className="font-medium">Date ranges:</span> {rangeCount} set</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-sm text-gray-600">Rate per night</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {room.price.startsWith("R") ? room.price : `R${room.price}`}
                      </span>
                    </div>

                    {/* ✅ Toggle removed — only Edit & Delete remain */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="text-xs bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border-blue-200" onClick={() => openEditModal(room)}>
                        <Edit3 className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200" onClick={() => handleDelete(room)}>
                        <Trash2 className="h-3 w-3 mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Add / Edit Modal ── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
            tabIndex={-1}
            onKeyDown={e => { if (e.key === "Escape") setIsModalOpen(false); }}
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] bg-white border-gray-200 flex flex-col rounded-md"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === "add" ? "Add New Room" : "Edit Room"}
                </h2>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Close</Button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Room Name *</label>
                      <Input placeholder="e.g., Deluxe Suite" value={form.name} onChange={e => handleFormChange("name", e.target.value)} className="text-gray-900" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">URL Slug (Auto-generated)</label>
                      <Input placeholder="Auto-generated" value={form.slug} disabled className="text-gray-900 bg-gray-50 cursor-not-allowed" />
                      <p className="text-xs text-gray-500 mt-1">Used in: /rooms/{form.slug || "url-slug"}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Price per Night *</label>
                      <Input placeholder="e.g., 2500" value={form.price} onChange={e => handlePriceChange(e.target.value)} className="text-gray-900" />
                      {form.price && <p className="text-xs text-gray-500 mt-1">Saves as: <span className="font-semibold text-gray-700">{form.price}</span></p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Total Units *</label>
                      <Input placeholder="e.g., 4" type="number" min={1} value={form.totalUnits} onChange={e => handleFormChange("totalUnits", e.target.value)} className="text-gray-900" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Max Guests *</label>
                      <Input placeholder="Number of guests" type="number" min={1} value={form.maxGuests} onChange={e => handleFormChange("maxGuests", e.target.value)} className="text-gray-900" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Bed Type</label>
                      <Input placeholder="e.g., King Bed" value={form.bedType} onChange={e => handleFormChange("bedType", e.target.value)} className="text-gray-900" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Room Size</label>
                      <Input placeholder="e.g., 25" value={form.size} onChange={e => handleSizeChange(e.target.value)} className="text-gray-900" />
                      {form.size && <p className="text-xs text-gray-500 mt-1">Saves as: <span className="font-semibold text-gray-700">{form.size}</span></p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">View</label>
                      <Input placeholder="e.g., Ocean View" value={form.view} onChange={e => handleFormChange("view", e.target.value)} className="text-gray-900" />
                    </div>

                    {/* Main Image */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Main Image *</label>
                      <input
                        type="file" accept="image/*"
                        onChange={e => handleFormChange("image", e.target.files?.[0] ?? "")}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      {form.image && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={typeof form.image === "object" ? URL.createObjectURL(form.image) : form.image}
                            alt="Preview" className="h-24 rounded-md border border-gray-200 object-cover"
                          />
                          <button type="button" onClick={removeMainImage} className="absolute top-1 right-1 bg-white rounded-full p-1 border border-gray-300 shadow hover:bg-gray-100">
                            <XCircle className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Additional Images</label>
                    <input
                      type="file" accept="image/*" multiple
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        handleFormChange("imageList", files.length > 0 ? files : "");
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {form.imageList && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(form.imageList)
                          ? form.imageList.map((file: File, idx) => (
                              <div key={idx} className="relative inline-block">
                                <img src={URL.createObjectURL(file)} alt="" className="h-16 rounded-md border border-gray-200 object-cover" />
                                <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 border border-gray-300 shadow hover:bg-gray-100">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            ))
                          : form.imageList.split(",").map((url, idx) => (
                              <div key={idx} className="relative inline-block">
                                <img src={url.trim()} alt="" className="h-16 rounded-md border border-gray-200 object-cover" />
                                <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 border border-gray-300 shadow hover:bg-gray-100">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Amenities</label>
                    <Input placeholder="e.g., WiFi, Air Conditioning, Mini Bar" value={form.amenities} onChange={e => handleFormChange("amenities", e.target.value)} className="text-gray-900" />
                    <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Features</label>
                    <Input placeholder="e.g., Balcony, Sea View, Non-Smoking" value={form.features} onChange={e => handleFormChange("features", e.target.value)} className="text-gray-900" />
                    <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Short Description</label>
                    <Input placeholder="Brief room description" value={form.description} onChange={e => handleFormChange("description", e.target.value)} className="text-gray-900" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Long Description</label>
                    <Input placeholder="Detailed room description" value={form.longDescription} onChange={e => handleFormChange("longDescription", e.target.value)} className="text-gray-900" />
                  </div>

                  {/* ✅ Availability Schedule — replaces the old toggle */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Availability Schedule <span className="text-red-500">*</span>
                    </label>
                    <AvailabilityBuilder
                      value={form.availability}
                      onChange={v => handleFormChange("availability", v)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-end bg-gray-50 rounded-b-md gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={submitForm} disabled={isSaving || (mode === "add" && isAdding)} className="bg-[#2B7FFF] hover:bg-[#1f5dcc] text-white">
                  {mode === "add" ? (isAdding ? "Adding..." : "Add Room") : (isSaving ? "Saving..." : "Save Changes")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}