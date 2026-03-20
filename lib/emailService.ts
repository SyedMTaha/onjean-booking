import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export async function sendRoomBookingEmail(data: {
  customerName: string;
  customerEmail: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: string | number;
  totalPrice: string | number;
  bookingId: string;
}) {
  try {
    await emailjs.send(
      SERVICE_ID,
      "template_room_booking",
      {
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        room_name: data.roomName,
        check_in: data.checkIn,
        check_out: data.checkOut,
        guests: data.guests,
        total_price: data.totalPrice,
        booking_id: data.bookingId,
      },
      PUBLIC_KEY
    );
    console.log("[EmailJS] Room booking email sent");
  } catch (error) {
    // Don't block the booking flow if email fails
    console.error("[EmailJS] Failed to send room booking email:", error);
  }
}

export async function sendFoodOrderEmail(data: {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  roomNumber?: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  totalAmount: number;
  orderId: string;
  specialInstructions?: string;
}) {
  try {
    const itemsList = data.items
      .map(i => `${i.name} x${i.quantity} — R${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    await emailjs.send(
      SERVICE_ID,
      "template_food_order",
      {
        customer_email: data.customerEmail,
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        order_type: data.orderType,
        room_number: data.roomNumber || "N/A",
        items: itemsList,
        total_amount: data.totalAmount.toFixed(2),
        order_id: data.orderId,
        special_instructions: data.specialInstructions || "None",
      },
      PUBLIC_KEY
    );
    console.log("[EmailJS] Food order email sent");
  } catch (error) {
    console.error("[EmailJS] Failed to send food order email:", error);
  }
}