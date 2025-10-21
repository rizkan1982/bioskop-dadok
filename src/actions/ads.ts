"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";
import { isAdmin } from "./admin";

export interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  position: "top" | "middle" | "bottom" | "sidebar";
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAdData {
  title: string;
  image_url: string;
  link_url?: string;
  position: "top" | "middle" | "bottom" | "sidebar";
  is_active?: boolean;
  end_date?: string;
}

// Get all ads (for admin)
export async function getAllAds() {
  noStore();
  
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access", data: null };
    }

    const supabase = await createClient(true); // Use service role
    
    const { data: ads, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return { success: true, message: "Ads fetched successfully", data: ads as Ad[] };
  } catch (error) {
    console.error("Error fetching ads:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch ads",
      data: null,
    };
  }
}

// Get active ads by position (for public display)
export async function getActiveAdsByPosition(position: string) {
  noStore();
  
  try {
    const supabase = await createClient();
    
    const { data: ads, error } = await supabase
      .from("ads")
      .select("*")
      .eq("position", position)
      .eq("is_active", true)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data: ads as Ad[] };
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return { success: false, data: [] };
  }
}

// Create new ad (admin only)
export async function createAd(adData: CreateAdData) {
  noStore();
  
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access" };
    }

    const supabase = await createClient(true); // Use service role
    
    const { data, error } = await supabase
      .from("ads")
      .insert({
        title: adData.title,
        image_url: adData.image_url,
        link_url: adData.link_url || null,
        position: adData.position,
        is_active: adData.is_active ?? true,
        end_date: adData.end_date || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, message: "Ad created successfully", data };
  } catch (error) {
    console.error("Error creating ad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create ad",
    };
  }
}

// Update ad (admin only)
export async function updateAd(id: string, adData: Partial<CreateAdData>) {
  noStore();
  
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access" };
    }

    const supabase = await createClient(true); // Use service role
    
    const { data, error } = await supabase
      .from("ads")
      .update({
        ...(adData.title && { title: adData.title }),
        ...(adData.image_url && { image_url: adData.image_url }),
        ...(adData.link_url !== undefined && { link_url: adData.link_url || null }),
        ...(adData.position && { position: adData.position }),
        ...(adData.is_active !== undefined && { is_active: adData.is_active }),
        ...(adData.end_date !== undefined && { end_date: adData.end_date || null }),
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, message: "Ad updated successfully", data };
  } catch (error) {
    console.error("Error updating ad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update ad",
    };
  }
}

// Delete ad (admin only)
export async function deleteAd(id: string) {
  noStore();
  
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access" };
    }

    const supabase = await createClient(true); // Use service role
    
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    return { success: true, message: "Ad deleted successfully" };
  } catch (error) {
    console.error("Error deleting ad:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete ad",
    };
  }
}

// Toggle ad active status (admin only)
export async function toggleAdStatus(id: string, isActive: boolean) {
  noStore();
  
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access" };
    }

    const supabase = await createClient(true); // Use service role
    
    const { data, error } = await supabase
      .from("ads")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, message: "Ad status updated successfully", data };
  } catch (error) {
    console.error("Error toggling ad status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to toggle ad status",
    };
  }
}

// Increment click count (public)
export async function incrementAdClick(id: string) {
  noStore();
  
  try {
    const supabase = await createClient();
    
    // Direct update approach (more reliable without custom RPC functions)
    const { data: currentAd } = await supabase
      .from("ads")
      .select("click_count")
      .eq("id", id)
      .single();
    
    if (currentAd) {
      await supabase
        .from("ads")
        .update({ click_count: currentAd.click_count + 1 })
        .eq("id", id);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error incrementing click count:", error);
    return { success: false };
  }
}
