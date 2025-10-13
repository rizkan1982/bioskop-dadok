"use server";

import { tmdb } from "@/api/tmdb";
import { ActionResponse } from "@/types";
import { isEmpty } from "@/utils/helpers";

export type SearchSuggestion = {
  id: number;
  title: string;
  type: "movie" | "tv";
};

export const getSearchSuggestions = async (
  query: string,
  limit: number = 10,
): Promise<ActionResponse<SearchSuggestion[] | null>> => {
  try {
    if (isEmpty(query)) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    const [movies, tvShows] = await Promise.all([
      tmdb.search.movies({ query, page: 1 }),
      tmdb.search.tvShows({ query, page: 1 }),
    ]);

    const movieSuggestions: SearchSuggestion[] = movies.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      type: "movie",
    }));
    const tvSuggestions: SearchSuggestion[] = tvShows.results.map((tv) => ({
      id: tv.id,
      title: tv.name,
      type: "tv",
    }));

    const suggestions = [...movieSuggestions, ...tvSuggestions];

    if (isEmpty(suggestions)) {
      return {
        success: true,
        message: "No search suggestions",
        data: null,
      };
    }

    const filteredSuggestions = suggestions
      .filter((data) => data.title.toLowerCase().includes(query.toLowerCase()))
      .filter(
        (data, index, self) =>
          index === self.findIndex((t) => t.title.toLowerCase() === data.title.toLowerCase()),
      );

    const sortedSuggestions = filteredSuggestions.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = query.toLowerCase();

      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      const aIndex = aTitle.indexOf(queryLower);
      const bIndex = bTitle.indexOf(queryLower);

      if (aIndex !== bIndex) return aIndex - bIndex;
      return aTitle.localeCompare(bTitle);
    });

    return {
      success: true,
      message: "Search suggestions fetched",
      data: sortedSuggestions.slice(0, limit),
    };
  } catch (error) {
    console.error("Search suggestions error:", error);

    return {
      success: false,
      message: "Error fetching search suggestions",
      data: null,
    };
  }
};
