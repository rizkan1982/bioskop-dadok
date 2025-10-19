"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

// ============================================
// WHITELIST EMAIL ADMIN
// Hanya email ini yang bisa akses admin panel
// ============================================
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
  "zflixid@gmail.com",
];

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  noStore();
  
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Check 1: Email whitelist (priority tertinggi)
    if (ADMIN_EMAILS.includes(user.email || "")) {
      return true;
    }
    
    // Check 2: Database is_admin field (fallback)
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    
    return profile?.is_admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Get current user with admin status
export async function getCurrentUser() {
  noStore();
  
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    return {
      ...user,
      profile,
      isAdmin: await isAdmin(),
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Get all users with their profiles
export async function getAllUsers() {
  noStore();
  
  try {
    const supabase = await createClient(true); // Use service role
    
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access", data: null };
    }
    
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        is_admin,
        created_at
      `)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    // Get auth users data
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) throw usersError;
    
    // Merge profile and auth data
    const usersData = profiles?.map((profile) => {
      const authUser = users.find((u) => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || "N/A",
        last_sign_in: authUser?.last_sign_in_at || null,
        email_confirmed: authUser?.email_confirmed_at ? true : false,
      };
    });
    
    return { success: true, message: "Users fetched successfully", data: usersData };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch users",
      data: null,
    };
  }
}

// Get all watch histories
export async function getAllHistories() {
  noStore();
  
  try {
    const supabase = await createClient(true); // Use service role
    
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access", data: null };
    }
    
    const { data: histories, error } = await supabase
      .from("histories")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    // Get profiles separately
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username");
    
    // Merge data
    const historiesWithProfiles = histories?.map((history) => {
      const profile = profiles?.find((p) => p.id === history.user_id);
      return {
        ...history,
        profiles: { username: profile?.username || "Unknown" }
      };
    });
    
    return { success: true, message: "Histories fetched successfully", data: historiesWithProfiles };
  } catch (error) {
    console.error("Error fetching histories:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch histories",
      data: null,
    };
  }
}

// Get all watchlist items
export async function getAllWatchlist() {
  noStore();
  
  try {
    const supabase = await createClient(true); // Use service role
    
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access", data: null };
    }
    
    const { data: watchlist, error } = await supabase
      .from("watchlist")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    // Get profiles separately
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username");
    
    // Merge data
    const watchlistWithProfiles = watchlist?.map((item) => {
      const profile = profiles?.find((p) => p.id === item.user_id);
      return {
        ...item,
        profiles: { username: profile?.username || "Unknown" }
      };
    });
    
    return { success: true, message: "Watchlist fetched successfully", data: watchlistWithProfiles };
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch watchlist",
      data: null,
    };
  }
}

// Get dashboard statistics
export async function getAdminStats() {
  noStore();
  
  try {
    const supabase = await createClient(true); // Use service role
    
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return { success: false, message: "Unauthorized access", data: null };
    }
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    
    // Get total watch histories
    const { count: totalHistories } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true });
    
    // Get total watchlist items
    const { count: totalWatchlist } = await supabase
      .from("watchlist")
      .select("*", { count: "exact", head: true });
    
    // Get unique media watched count
    const { data: uniqueMedia } = await supabase
      .from("histories")
      .select("media_id", { count: "exact" });
    
    const uniqueMediaCount = new Set(uniqueMedia?.map((h) => h.media_id)).size;
    
    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: recentSignups } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());
    
    const stats = {
      totalUsers: totalUsers || 0,
      totalHistories: totalHistories || 0,
      totalWatchlist: totalWatchlist || 0,
      uniqueMediaWatched: uniqueMediaCount,
      recentSignups: recentSignups || 0,
    };
    
    return { success: true, message: "Stats fetched successfully", data: stats };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch stats",
      data: null,
    };
  }
}
