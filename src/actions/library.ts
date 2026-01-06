"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Types
type ContentType = "movie" | "tv";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType; // Used for input from UI
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry {
  user_id: string;
  id: number;
  content_type: string; // Database uses content_type
  adult: boolean;
  backdrop_path: string | null;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
  created_at: string;
}

interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface WatchlistResponse extends ActionResponse<WatchlistEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

interface CheckWatchlistResponse extends ActionResponse {
  isInWatchlist: boolean;
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        id: item.id,
        content_type: item.type,
        adult: item.adult,
        backdrop_path: item.backdrop_path,
        poster_path: item.poster_path,
        release_date: item.release_date,
        title: item.title,
        vote_average: item.vote_average,
      })
      .select()
      .single();

    if (error) {
      // Duplicate entry
      if (error.code === "23505") {
        return { success: false, error: "Item sudah ada di watchlist" };
      }
      throw error;
    }

    revalidatePath("/library");
    return { 
      success: true, 
      message: "Berhasil ditambahkan ke watchlist",
      data: data as WatchlistEntry
    };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Gagal menambahkan ke watchlist" 
    };
  }
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("content_type", type);

    if (error) throw error;

    revalidatePath("/library");
    return { success: true, message: "Berhasil dihapus dari watchlist" };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Gagal menghapus dari watchlist" 
    };
  }
}

/**
 * Remove all items from watchlist by type
 */
export const removeAllWatchlist = async (type: ContentType): Promise<ActionResponse> => {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("content_type", type);

    if (error) throw error;

    revalidatePath("/library");
    return { success: true, message: "Semua item berhasil dihapus" };
  } catch (error) {
    console.error("Error removing all from watchlist:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Gagal menghapus semua item" 
    };
  }
};

/**
 * Check if item is in watchlist
 */
export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: true, isInWatchlist: false };
    }

    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("content_type", type)
      .maybeSingle();

    if (error) throw error;

    return { success: true, isInWatchlist: !!data };
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return { success: false, isInWatchlist: false, error: "Gagal memeriksa watchlist" };
  }
}

/**
 * Get user's watchlist with pagination
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
): Promise<WatchlistResponse> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { 
        success: true, 
        data: [], 
        totalCount: 0, 
        totalPages: 0, 
        currentPage: 1, 
        hasNextPage: false 
      };
    }

    // Build query
    let query = supabase
      .from("watchlist")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Apply filter
    if (filterType !== "all") {
      query = query.eq("content_type", filterType);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: (data || []) as WatchlistEntry[],
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat watchlist",
      data: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
    };
  }
}

/**
 * Toggle watchlist status (add if not exists, remove if exists)
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  try {
    const checkResult = await checkInWatchlist(item.id, item.type);
    
    if (checkResult.isInWatchlist) {
      return removeFromWatchlist(item.id, item.type);
    } else {
      return addToWatchlist(item);
    }
  } catch (error) {
    console.error("Error toggling watchlist:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Gagal mengubah watchlist" 
    };
  }
}
