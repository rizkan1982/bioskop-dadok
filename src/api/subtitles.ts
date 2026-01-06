/**
 * Subtitle API service using OpenSubtitles
 * Fetches and manages subtitle data for movies and TV shows
 */

export interface SubtitleTrack {
  language: string;
  languageCode: string;
  url: string;
  format: 'vtt' | 'srt';
}

export interface SubtitleResponse {
  subtitles: SubtitleTrack[];
  movieTitle: string;
}

const OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';

/**
 * Fetch available subtitles for a movie
 */
export async function fetchMovieSubtitles(
  tmdbId: number,
  imdbId?: string
): Promise<SubtitleResponse> {
  try {
    // For now, return common subtitle languages
    // In production, you'd integrate with OpenSubtitles API
    const subtitles: SubtitleTrack[] = [
      {
        language: 'Indonesian',
        languageCode: 'id',
        url: `/api/subtitles/movie/${tmdbId}/id`,
        format: 'vtt',
      },
      {
        language: 'English',
        languageCode: 'en',
        url: `/api/subtitles/movie/${tmdbId}/en`,
        format: 'vtt',
      },
      {
        language: 'Spanish',
        languageCode: 'es',
        url: `/api/subtitles/movie/${tmdbId}/es`,
        format: 'vtt',
      },
      {
        language: 'French',
        languageCode: 'fr',
        url: `/api/subtitles/movie/${tmdbId}/fr`,
        format: 'vtt',
      },
      {
        language: 'German',
        languageCode: 'de',
        url: `/api/subtitles/movie/${tmdbId}/de`,
        format: 'vtt',
      },
      {
        language: 'Japanese',
        languageCode: 'ja',
        url: `/api/subtitles/movie/${tmdbId}/ja`,
        format: 'vtt',
      },
      {
        language: 'Korean',
        languageCode: 'ko',
        url: `/api/subtitles/movie/${tmdbId}/ko`,
        format: 'vtt',
      },
      {
        language: 'Chinese (Simplified)',
        languageCode: 'zh-CN',
        url: `/api/subtitles/movie/${tmdbId}/zh-CN`,
        format: 'vtt',
      },
      {
        language: 'Portuguese',
        languageCode: 'pt',
        url: `/api/subtitles/movie/${tmdbId}/pt`,
        format: 'vtt',
      },
      {
        language: 'Russian',
        languageCode: 'ru',
        url: `/api/subtitles/movie/${tmdbId}/ru`,
        format: 'vtt',
      },
      {
        language: 'Arabic',
        languageCode: 'ar',
        url: `/api/subtitles/movie/${tmdbId}/ar`,
        format: 'vtt',
      },
      {
        language: 'Hindi',
        languageCode: 'hi',
        url: `/api/subtitles/movie/${tmdbId}/hi`,
        format: 'vtt',
      },
      {
        language: 'Thai',
        languageCode: 'th',
        url: `/api/subtitles/movie/${tmdbId}/th`,
        format: 'vtt',
      },
      {
        language: 'Vietnamese',
        languageCode: 'vi',
        url: `/api/subtitles/movie/${tmdbId}/vi`,
        format: 'vtt',
      },
      {
        language: 'Turkish',
        languageCode: 'tr',
        url: `/api/subtitles/movie/${tmdbId}/tr`,
        format: 'vtt',
      },
      {
        language: 'Italian',
        languageCode: 'it',
        url: `/api/subtitles/movie/${tmdbId}/it`,
        format: 'vtt',
      },
      {
        language: 'Dutch',
        languageCode: 'nl',
        url: `/api/subtitles/movie/${tmdbId}/nl`,
        format: 'vtt',
      },
      {
        language: 'Polish',
        languageCode: 'pl',
        url: `/api/subtitles/movie/${tmdbId}/pl`,
        format: 'vtt',
      },
      {
        language: 'Swedish',
        languageCode: 'sv',
        url: `/api/subtitles/movie/${tmdbId}/sv`,
        format: 'vtt',
      },
      {
        language: 'Norwegian',
        languageCode: 'no',
        url: `/api/subtitles/movie/${tmdbId}/no`,
        format: 'vtt',
      },
    ];

    return {
      subtitles,
      movieTitle: '',
    };
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    return {
      subtitles: [],
      movieTitle: '',
    };
  }
}

/**
 * Fetch available subtitles for a TV show episode
 */
export async function fetchTvSubtitles(
  tmdbId: number,
  season: number,
  episode: number,
  imdbId?: string
): Promise<SubtitleResponse> {
  try {
    const subtitles: SubtitleTrack[] = [
      {
        language: 'Indonesian',
        languageCode: 'id',
        url: `/api/subtitles/tv/${tmdbId}/${season}/${episode}/id`,
        format: 'vtt',
      },
      {
        language: 'English',
        languageCode: 'en',
        url: `/api/subtitles/tv/${tmdbId}/${season}/${episode}/en`,
        format: 'vtt',
      },
      {
        language: 'Spanish',
        languageCode: 'es',
        url: `/api/subtitles/tv/${tmdbId}/${season}/${episode}/es`,
        format: 'vtt',
      },
      {
        language: 'French',
        languageCode: 'fr',
        url: `/api/subtitles/tv/${tmdbId}/${season}/${episode}/fr`,
        format: 'vtt',
      },
      {
        language: 'German',
        languageCode: 'de',
        url: `/api/subtitles/tv/${tmdbId}/${season}/${episode}/de`,
        format: 'vtt',
      },
      // Add more languages as needed
    ];

    return {
      subtitles,
      movieTitle: '',
    };
  } catch (error) {
    console.error('Error fetching subtitles:', error);
    return {
      subtitles: [],
      movieTitle: '',
    };
  }
}

/**
 * Convert SRT to WebVTT format
 */
export function srtToVtt(srt: string): string {
  let vtt = 'WEBVTT\n\n';
  vtt += srt.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
  return vtt;
}
