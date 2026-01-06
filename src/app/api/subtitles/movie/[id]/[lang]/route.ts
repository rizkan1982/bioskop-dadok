import { NextRequest, NextResponse } from 'next/server';
import { translateWebVTT } from '@/api/groq';

/**
 * API endpoint to fetch and translate subtitles
 * GET /api/subtitles/movie/[id]/[lang]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; lang: string } }
) {
  try {
    const { id, lang } = params;
    
    // Fetch subtitles from OpenSubtitles API or other subtitle service
    // For now, we'll use a proxy to fetch from the embedded player
    
    // Try fetching from 2Embed player subtitles
    const playerUrl = `https://www.2embed.cc/embed/${id}`;
    
    // Since embedded players have their own subtitles, we'll provide a fallback
    // In production, integrate with OpenSubtitles API properly
    
    // Return empty VTT for now - the embedded players handle subtitles
    const vtt = `WEBVTT

1
00:00:00.000 --> 00:00:05.000
Subtitle not available for this language

2
00:00:05.000 --> 00:00:10.000
Please use the subtitle options in the video player`;

    return new NextResponse(vtt, {
      headers: {
        'Content-Type': 'text/vtt',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Subtitle API error:', error);
    return new NextResponse('Subtitle not found', { status: 404 });
  }
}
