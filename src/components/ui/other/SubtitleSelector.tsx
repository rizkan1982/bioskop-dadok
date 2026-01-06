'use client';

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useState } from 'react';
import { SubtitlesIcon } from 'lucide-react';

export interface SubtitleOption {
  code: string;
  name: string;
}

const SUBTITLE_LANGUAGES: SubtitleOption[] = [
  { code: 'id', name: '🇮🇩 Indonesian' },
  { code: 'en', name: '🇬🇧 English' },
  { code: 'es', name: '🇪🇸 Spanish' },
  { code: 'fr', name: '🇫🇷 French' },
  { code: 'de', name: '🇩🇪 German' },
  { code: 'ja', name: '🇯🇵 Japanese' },
  { code: 'ko', name: '🇰🇷 Korean' },
  { code: 'zh-CN', name: '🇨🇳 Chinese (Simplified)' },
  { code: 'zh-TW', name: '🇹🇼 Chinese (Traditional)' },
  { code: 'pt', name: '🇵🇹 Portuguese' },
  { code: 'ru', name: '🇷🇺 Russian' },
  { code: 'ar', name: '🇸🇦 Arabic' },
  { code: 'hi', name: '🇮🇳 Hindi' },
  { code: 'th', name: '🇹🇭 Thai' },
  { code: 'vi', name: '🇻🇳 Vietnamese' },
  { code: 'tr', name: '🇹🇷 Turkish' },
  { code: 'it', name: '🇮🇹 Italian' },
  { code: 'nl', name: '🇳🇱 Dutch' },
  { code: 'pl', name: '🇵🇱 Polish' },
  { code: 'sv', name: '🇸🇪 Swedish' },
  { code: 'no', name: '🇳🇴 Norwegian' },
  { code: 'fi', name: '🇫🇮 Finnish' },
  { code: 'da', name: '🇩🇰 Danish' },
  { code: 'cs', name: '🇨🇿 Czech' },
  { code: 'hu', name: '🇭🇺 Hungarian' },
  { code: 'ro', name: '🇷🇴 Romanian' },
  { code: 'uk', name: '🇺🇦 Ukrainian' },
  { code: 'el', name: '🇬🇷 Greek' },
  { code: 'he', name: '🇮🇱 Hebrew' },
  { code: 'fa', name: '🇮🇷 Persian' },
  { code: 'ms', name: '🇲🇾 Malay' },
  { code: 'bn', name: '🇧🇩 Bengali' },
  { code: 'ta', name: '🇮🇳 Tamil' },
  { code: 'te', name: '🇮🇳 Telugu' },
  { code: 'mr', name: '🇮🇳 Marathi' },
  { code: 'off', name: '🚫 Off' },
];

interface SubtitleSelectorProps {
  movieId?: number;
  tvShowId?: number;
  season?: number;
  episode?: number;
  onSubtitleChange?: (languageCode: string) => void;
}

export default function SubtitleSelector({
  movieId,
  tvShowId,
  season,
  episode,
  onSubtitleChange,
}: SubtitleSelectorProps) {
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('id');

  const handleSubtitleChange = (code: string) => {
    setSelectedSubtitle(code);
    onSubtitleChange?.(code);
    
    // Store preference in localStorage
    localStorage.setItem('preferredSubtitle', code);
  };

  const selectedLabel = SUBTITLE_LANGUAGES.find(
    (lang) => lang.code === selectedSubtitle
  )?.name || '🇮🇩 Indonesian';

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="flat"
          startContent={<SubtitlesIcon size={18} />}
          className="bg-black/50 text-white hover:bg-black/70"
        >
          {selectedLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Subtitle language selection"
        selectionMode="single"
        selectedKeys={[selectedSubtitle]}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0] as string;
          if (key) handleSubtitleChange(key);
        }}
        className="max-h-96 overflow-y-auto"
      >
        {SUBTITLE_LANGUAGES.map((lang) => (
          <DropdownItem key={lang.code} textValue={lang.name}>
            {lang.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
