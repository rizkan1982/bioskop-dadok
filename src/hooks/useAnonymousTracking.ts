import { useEffect, useRef } from 'react';

const SESSION_ID_KEY = 'anon_session_id';

// Generate or retrieve anonymous session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

interface UseAnonymousTrackingProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  totalDuration?: number;
}

export const useAnonymousTracking = ({
  mediaId,
  mediaType,
  title,
  totalDuration = 0,
}: UseAnonymousTrackingProps) => {
  const sessionId = useRef<string>('');
  const durationWatchedRef = useRef<number>(0);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize session ID on mount
  useEffect(() => {
    sessionId.current = getSessionId();
    console.log('[Anonymous Tracking] Session ID:', sessionId.current);
  }, []);

  // Function to track watch progress
  const trackWatch = async (currentDuration: number) => {
    if (!sessionId.current) return;

    try {
      const response = await fetch('/api/admin/watch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.current,
          mediaId,
          mediaType,
          title,
          durationWatched: Math.floor(currentDuration),
          totalDuration,
        }),
      });

      if (!response.ok) {
        console.error('[Anonymous Tracking] Failed to track watch:', response.statusText);
      }
    } catch (error) {
      console.error('[Anonymous Tracking] Error tracking watch:', error);
    }
  };

  // Start tracking interval when component mounts
  useEffect(() => {
    // Try to get the iframe and track progress
    const startTracking = () => {
      trackingIntervalRef.current = setInterval(() => {
        try {
          const iframe = document.querySelector('iframe[src*="vidlink"]') as HTMLIFrameElement;
          if (iframe) {
            // Send message to iframe to get current time (if supported)
            // Fallback: just track that the video is being watched
            trackWatch(durationWatchedRef.current);
            durationWatchedRef.current += 5; // Increment by 5 seconds per interval
          }
        } catch (error) {
          console.error('[Anonymous Tracking] Error in tracking interval:', error);
        }
      }, 5000); // Track every 5 seconds
    };

    startTracking();

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [mediaId, mediaType, title, totalDuration]);

  // Track on page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId.current && durationWatchedRef.current > 0) {
        trackWatch(durationWatchedRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    sessionId: sessionId.current,
    trackWatch,
  };
};
