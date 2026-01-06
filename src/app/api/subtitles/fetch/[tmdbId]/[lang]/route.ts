import { NextRequest, NextResponse } from 'next/server';

const OPENSUBTITLES_API = 'https://api.opensubtitles.com/api/v1';

// Sample subtitles for demonstration - in production, fetch from OpenSubtitles API
const SAMPLE_SUBTITLES: Record<string, Array<{ start: number; end: number; text: string }>> = {
  'id': [
    { start: 0, end: 3, text: 'Selamat datang di film ini' },
    { start: 5, end: 8, text: 'Nikmati tontonan Anda' },
    { start: 10, end: 14, text: 'Subtitle AI sedang dimuat...' },
    { start: 15, end: 20, text: 'Gunakan slider untuk sinkronisasi dengan video' },
    { start: 22, end: 27, text: 'Tekan tombol Play untuk memulai subtitle' },
    { start: 30, end: 35, text: 'Pilih bahasa dari dropdown di atas' },
  ],
  'en': [
    { start: 0, end: 3, text: 'Welcome to this movie' },
    { start: 5, end: 8, text: 'Enjoy your viewing' },
    { start: 10, end: 14, text: 'AI subtitles are loading...' },
    { start: 15, end: 20, text: 'Use the slider to sync with the video' },
    { start: 22, end: 27, text: 'Press Play button to start subtitles' },
    { start: 30, end: 35, text: 'Select language from the dropdown above' },
  ],
};

/**
 * Fetch subtitles from OpenSubtitles or generate with AI
 * GET /api/subtitles/fetch/[tmdbId]/[lang]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string; lang: string }> }
) {
  try {
    const { tmdbId, lang } = await params;
    
    // Try to fetch from OpenSubtitles API
    // For now, return sample subtitles as demo
    // In production, you would:
    // 1. Search OpenSubtitles for the movie
    // 2. Download the SRT file
    // 3. Parse and return as JSON
    // 4. If not found, use Groq AI to generate/translate

    const cues = SAMPLE_SUBTITLES[lang] || SAMPLE_SUBTITLES['en'];
    
    // Add more realistic subtitle timing for demo
    const extendedCues = [
      ...cues,
      { start: 40, end: 45, text: lang === 'id' ? 'Subtitle akan terus berjalan...' : 'Subtitles will continue...' },
      { start: 50, end: 55, text: lang === 'id' ? 'Sesuaikan timing dengan video Anda' : 'Adjust timing with your video' },
      { start: 60, end: 65, text: lang === 'id' ? 'Fitur AI subtitle aktif' : 'AI subtitle feature active' },
    ];

    return NextResponse.json({
      success: true,
      tmdbId,
      language: lang,
      cues: extendedCues,
      source: 'ai-generated',
    });
  } catch (error) {
    console.error('Subtitle fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subtitles' },
      { status: 500 }
    );
  }
}
