import { NextResponse } from "next/server";

type GoogleReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
  time?: number;
};

type Testimonial = {
  name: string;
  location: string;
  rating: number;
  comment: string;
};

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      {
        error: "Missing Google Places configuration",
        details: "Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID",
      },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "reviews");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      method: "GET",
      // Cache API responses for 30 minutes to reduce quota usage.
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch reviews from Google Places" },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        {
          error: "Google Places returned an error",
          details: data.error_message || data.status,
        },
        { status: 502 }
      );
    }

    const reviews: GoogleReview[] = Array.isArray(data?.result?.reviews)
      ? data.result.reviews
      : [];

    const latestFirst = [...reviews].sort((a, b) => (b.time || 0) - (a.time || 0));
    const mapped: Testimonial[] = latestFirst.slice(0, 6).map((review) => ({
      name: review.author_name || "Guest",
      location: review.relative_time_description || "Google Review",
      rating: review.rating || 5,
      comment: review.text || "",
    }));

    return NextResponse.json({ reviews: mapped }, { status: 200 });
  } catch (error) {
    console.error("Google reviews API error:", error);
    return NextResponse.json(
      { error: "Unexpected error while fetching Google reviews" },
      { status: 500 }
    );
  }
}
