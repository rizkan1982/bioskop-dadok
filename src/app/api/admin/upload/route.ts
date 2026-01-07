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

    console.log("📤 Upload API called", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `banner_${timestamp}_${random}.${extension}`;
    const filePath = `banners/${filename}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("📁 Attempting upload to:", filePath);

    // Upload to Supabase Storage with retry logic
    let uploadError: any = null;
    let uploadData: any = null;

    // First attempt
    const { data: firstData, error: firstError } = await supabase.storage
      .from("ads")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (firstError) {
      // Log error details
      console.error("❌ First upload attempt failed:", {
        message: firstError.message,
        statusCode: (firstError as any).statusCode,
      });

      // Try to create bucket if it doesn't exist
      if (firstError.message?.includes("not found") || firstError.message?.includes("404")) {
        console.log("Attempting to create ads bucket...");
        
        try {
          const { error: createError } = await supabase.storage.createBucket("ads", {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          });
          
          if (createError) {
            console.warn("Failed to create bucket:", createError);
            // Continue anyway, bucket might already exist
          }
        } catch (e) {
          console.warn("Error creating bucket:", e);
        }

        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from("ads")
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (retryError) {
          uploadError = retryError;
          console.error("Retry upload failed:", retryError);
        } else {
          uploadData = retryData;
        }
      } else {
        uploadError = firstError;
      }
    } else {
      uploadData = firstData;
    }

    // If still failed, return error
    if (uploadError) {
      console.error("Final upload error:", uploadError);
      return NextResponse.json(
        { 
          success: false, 
          message: uploadError?.message || "Failed to upload file. Please try again.",
          error: process.env.NODE_ENV === "development" ? uploadError : undefined
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("ads")
      .getPublicUrl(filePath);

    console.log("Upload successful:", {
      path: filePath,
      url: urlData.publicUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: urlData.publicUrl,
        path: filePath,
      },
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to process upload",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
