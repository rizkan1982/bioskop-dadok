import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const supabase = await createClient(true); // Use service role

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `banner_${timestamp}.${extension}`;
    const filePath = `banners/${filename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("ads")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      
      // If bucket doesn't exist, try to create it
      if (error.message.includes("Bucket not found")) {
        // Create the bucket
        const { error: createError } = await supabase.storage.createBucket("ads", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        });
        
        if (createError) {
          return NextResponse.json(
            { success: false, message: "Failed to create storage bucket" },
            { status: 500 }
          );
        }

        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from("ads")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (retryError) {
          return NextResponse.json(
            { success: false, message: retryError.message },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("ads")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: filePath,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload file" },
      { status: 500 }
    );
  }
}
