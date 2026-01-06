/**
 * Groq API service for subtitle translation
 * Uses Groq's LLM to translate subtitles to different languages
 */

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false, // Only use on server-side
});

export interface SubtitleLine {
  index: number;
  timestamp: string;
  text: string;
}

/**
 * Translate subtitle text using Groq
 */
export async function translateSubtitleWithGroq(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional subtitle translator. Translate the following subtitle text to ${targetLanguage}. Keep the same timing and formatting. Only return the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Groq translation error:', error);
    return text;
  }
}

/**
 * Translate entire WebVTT subtitle file
 */
export async function translateWebVTT(
  vttContent: string,
  targetLanguage: string
): Promise<string> {
  try {
    // Parse WebVTT
    const lines = vttContent.split('\n');
    const header = lines[0]; // WEBVTT
    
    // Extract subtitle blocks
    const blocks: string[] = [];
    let currentBlock = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        if (currentBlock.trim() !== '') {
          blocks.push(currentBlock);
          currentBlock = '';
        }
      } else {
        currentBlock += line + '\n';
      }
    }
    
    if (currentBlock.trim() !== '') {
      blocks.push(currentBlock);
    }

    // Translate text lines only (not timestamps)
    const translatedBlocks: string[] = [];
    
    for (const block of blocks) {
      const blockLines = block.split('\n');
      const timestampLine = blockLines.find(l => l.includes('-->'));
      const textLines = blockLines.filter(l => l.trim() !== '' && !l.includes('-->') && !l.match(/^\d+$/));
      
      if (timestampLine && textLines.length > 0) {
        const textToTranslate = textLines.join(' ');
        const translated = await translateSubtitleWithGroq(textToTranslate, targetLanguage);
        
        const newBlock = timestampLine + '\n' + translated;
        translatedBlocks.push(newBlock);
      }
    }

    return header + '\n\n' + translatedBlocks.join('\n\n');
  } catch (error) {
    console.error('WebVTT translation error:', error);
    return vttContent;
  }
}
