'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Slider } from '@heroui/react';
import { Subtitles, Play, Pause, RotateCcw } from 'lucide-react';

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

interface SubtitleOverlayProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

const SUBTITLE_LANGUAGES = [
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'off', name: 'Off', flag: '🚫' },
];

export default function SubtitleOverlay({ tmdbId, type, season, episode }: SubtitleOverlayProps) {
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('id');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch subtitles when language changes
  useEffect(() => {
    if (selectedLang === 'off') {
      setSubtitles([]);
      setCurrentText('');
      return;
    }

    const fetchSubtitles = async () => {
      setLoading(true);
      setError('');
      
      try {
        const endpoint = type === 'movie' 
          ? `/api/subtitles/fetch/${tmdbId}/${selectedLang}`
          : `/api/subtitles/fetch/${tmdbId}/${season}/${episode}/${selectedLang}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Subtitle tidak tersedia untuk bahasa ini');
        }
        
        const data = await response.json();
        setSubtitles(data.cues || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat subtitle');
        setSubtitles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtitles();
  }, [tmdbId, type, season, episode, selectedLang]);

  // Update current subtitle based on time
  useEffect(() => {
    if (subtitles.length === 0) {
      setCurrentText('');
      return;
    }

    const currentCue = subtitles.find(
      (cue) => currentTime >= cue.start && currentTime <= cue.end
    );
    
    setCurrentText(currentCue?.text || '');
  }, [currentTime, subtitles]);

  // Timer for subtitle playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 0.1);
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleTimeChange = (value: number | number[]) => {
    const newTime = Array.isArray(value) ? value[0] : value;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedLanguage = SUBTITLE_LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Subtitle Display */}
      {currentText && selectedLang !== 'off' && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 max-w-[80%]">
          <div className="bg-black/80 text-white px-6 py-3 rounded-lg text-lg md:text-xl text-center font-medium shadow-lg">
            {currentText}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-20 right-4 pointer-events-auto flex flex-col gap-2">
        {/* Language Selector */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="flat"
              startContent={<Subtitles size={18} />}
              className="bg-black/70 text-white hover:bg-black/90 backdrop-blur-sm"
            >
              {selectedLanguage?.flag} {selectedLanguage?.name}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Pilih bahasa subtitle"
            selectionMode="single"
            selectedKeys={[selectedLang]}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0] as string;
              if (key) {
                setSelectedLang(key);
                setCurrentTime(0);
                setIsPlaying(false);
              }
            }}
            className="max-h-80 overflow-y-auto"
          >
            {SUBTITLE_LANGUAGES.map((lang) => (
              <DropdownItem key={lang.code} textValue={lang.name}>
                {lang.flag} {lang.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        {/* Subtitle Sync Controls */}
        {selectedLang !== 'off' && subtitles.length > 0 && (
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 flex flex-col gap-2 min-w-[200px]">
            <div className="text-white text-xs text-center">
              Sync Subtitle dengan Video
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-white/20 text-white"
                onPress={handleReset}
              >
                <RotateCcw size={16} />
              </Button>
              
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-white/20 text-white"
                onPress={handlePlayPause}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
              <span className="text-white text-sm font-mono min-w-[50px]">
                {formatTime(currentTime)}
              </span>
            </div>

            <Slider
              size="sm"
              step={1}
              maxValue={subtitles.length > 0 ? subtitles[subtitles.length - 1].end : 7200}
              minValue={0}
              value={currentTime}
              onChange={handleTimeChange}
              className="max-w-full"
              aria-label="Subtitle time"
            />

            <div className="text-white/60 text-xs text-center">
              Geser slider untuk sync dengan video
            </div>
          </div>
        )}

        {/* Loading/Error States */}
        {loading && (
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
            Memuat subtitle...
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
