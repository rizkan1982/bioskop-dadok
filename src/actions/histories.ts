"use server";

import { tmdb } from "@/api/tmdb";
import { VidlinkEventData } from "@/hooks/useVidlinkPlayer";
import { ActionResponse } from "@/types";
import { HistoryDetail } from "@/types/movie";
import { mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { createClient } from "@/utils/supabase/server";

export const syncHistory = async (
  data: VidlinkEventData["data"],
  completed?: boolean,
): ActionResponse => {
  console.info("Saving history:", data);

  if (!data) return { success: false, message: "No data to save" };

  if (data.mediaType === "tv" && (!data.season || !data.episode)) {
    return { success: false, message: "Missing season or episode" };
  }

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "You must be logged in to save history",
      };
    }

    // Validate required fields
    if (!data.mtmdbId || !data.mediaType) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv"].includes(data.mediaType)) {
      return {
        success: false,
        message: 'Invalid content type. Must be "movie" or "tv"',
      };
    }

    const media =
      data.mediaType === "movie"
        ? await tmdb.movies.details(data.mtmdbId)
        : await tmdb.tvShows.details(data.mtmdbId);

    // Insert or update history
    const { data: history, error } = await supabase
      .from("histories")
      .upsert(
        {
          user_id: user.id,
          tmdb_id: data.mtmdbId,
          content_type: data.mediaType,
          season_number: data.season || null,
          episode_number: data.episode || null,
          duration: data.duration,
          progress: data.currentTime,
          poster_path: media.poster_path,
          title: "title" in media ? mutateMovieTitle(media) : mutateTvShowTitle(media),
          watched_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,tmdb_id,content_type,season_number,episode_number",
        },
      )
      .select();

    if (error) {
      console.info("History save error:", error);
      return {
        success: false,
        message: "Failed to save history",
      };
    }

    console.info("History saved:", history);

    return {
      success: true,
      message: "History saved",
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getUserHistories = async (limit: number = 20): ActionResponse<HistoryDetail[]> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const { data, error } = await supabase
      .from("histories")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.info("History fetch error:", error);
      return {
        success: false,
        message: "Failed to fetch history",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.info("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getMovieLastPosition = async (id: number): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("progress")
      .eq("user_id", user.id)
      .eq("tmdb_id", id)
      .eq("content_type", "movie");

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0]?.progress || 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};

export const getTvShowLastPosition = async (
  id: number,
  season: number,
  episode: number,
): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("progress")
      .eq("user_id", user.id)
      .eq("tmdb_id", id)
      .eq("content_type", "tv")
      .eq("season_number", season)
      .eq("episode_number", episode);

    if (error) {
      console.info("History fetch error:", error);
      return 0;
    }

    return data?.[0]?.progress || 0;
  } catch (error) {
    console.info("Unexpected error:", error);
    return 0;
  }
};

/**
 * Record a movie view when user opens the player
 * This is called regardless of which video source is used
 * Creates or updates a history entry with progress 0 if not exists
 */
export const recordMovieView = async (
  movieId: number,
  title: string,
  posterPath: string | null
): ActionResponse => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: "User not authenticated" };
    }

    // Check if history already exists
    const { data: existing } = await supabase
      .from("histories")
      .select("id")
      .eq("user_id", user.id)
      .eq("tmdb_id", movieId)
      .eq("content_type", "movie")
      .maybeSingle();

    if (existing) {
      // Update watched_at only (don't reset progress)
      await supabase
        .from("histories")
        .update({ watched_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      // Insert new history with progress 0
      await supabase.from("histories").insert({
        user_id: user.id,
        tmdb_id: movieId,
        content_type: "movie",
        title,
        poster_path: posterPath,
        progress: 0,
        duration: 0,
        watched_at: new Date().toISOString(),
      });
    }

    return { success: true, message: "View recorded" };
  } catch (error) {
    console.info("Record view error:", error);
    return { success: false, message: "Failed to record view" };
  }
};

/**
 * Record a TV show episode view when user opens the player
 */
export const recordTvShowView = async (
  tvId: number,
  season: number,
  episode: number,
  title: string,
  posterPath: string | null
): ActionResponse => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, message: "User not authenticated" };
    }

    // Check if history already exists
    const { data: existing } = await supabase
      .from("histories")
      .select("id")
      .eq("user_id", user.id)
      .eq("tmdb_id", tvId)
      .eq("content_type", "tv")
      .eq("season_number", season)
      .eq("episode_number", episode)
      .maybeSingle();

    if (existing) {
      // Update watched_at only
      await supabase
        .from("histories")
        .update({ watched_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      // Insert new history with progress 0
      await supabase.from("histories").insert({
        user_id: user.id,
        tmdb_id: tvId,
        content_type: "tv",
        season_number: season,
        episode_number: episode,
        title,
        poster_path: posterPath,
        progress: 0,
        duration: 0,
        watched_at: new Date().toISOString(),
      });
    }

    return { success: true, message: "View recorded" };
  } catch (error) {
    console.info("Record view error:", error);
    return { success: false, message: "Failed to record view" };
  }
};
