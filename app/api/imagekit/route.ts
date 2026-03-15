import { NextResponse } from "next/server";
import ImageKit from "@imagekit/nodejs";

export async function POST(request: Request) {
  const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    baseURL: process.env.IMAGEKIT_URL_ENDPOINT!,
  });

  const formData = await request.formData();
  const file = formData.get("file");
  const fileName = formData.get("fileName") || "upload.jpg";
  const folder = formData.get("folder") || "/rooms";

  if (!file || typeof file !== "object") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // File type validation (accept only jpg, jpeg, png)
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (file.type && !allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only JPG, JPEG, and PNG images are allowed." }, { status: 415 });
  }

  // File size validation (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size && file.size > maxSize) {
    return NextResponse.json({ error: "File too large. Please upload an image under 10MB." }, { status: 413 });
  }

  try {
    const uploadResponse = await imagekit.files.upload({
      file,
      fileName: fileName as string,
      folder: folder as string,
    });
    return NextResponse.json({ url: uploadResponse.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload failed." }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};