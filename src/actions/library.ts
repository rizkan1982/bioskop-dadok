"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Types
type ContentType = "movie" | "tv";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType;
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry extends WatchlistItem {
  user_id: string;
  created_at: string;
}

interface ActionResponse<T = any> {
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
 * Add item to watchlist - TEMPORARILY DISABLED
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
  revalidatePath("/library");
  return {
    success: false,
    error: "Watchlist feature coming soon",
  };
}

/**
 * Remove item from watchlist - TEMPORARILY DISABLED
 */
export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
  revalidatePath("/library");
  return {
    success: false,
    error: "Watchlist feature coming soon",
  };
}

/**
 * Remove all items from watchlist - TEMPORARILY DISABLED
 */
export const removeAllWatchlist = async (type: ContentType): Promise<ActionResponse> => {
  revalidatePath("/library");
  return {
    success: false,
    error: "Watchlist feature coming soon",
  };
};

/**
 * Check if item is in watchlist - TEMPORARILY DISABLED
 */
export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
  return {
    success: true,
    isInWatchlist: false,
  };
}

/**
 * Get user's watchlist with pagination - TEMPORARILY DISABLED
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
): Promise<WatchlistResponse> {
  return {
    success: true,
    data: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
  };
}

/**
 * Toggle watchlist status - TEMPORARILY DISABLED
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  return {
    success: false,
    error: "Watchlist feature coming soon",
  };
}
