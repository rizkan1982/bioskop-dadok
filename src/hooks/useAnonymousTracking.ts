import { useEffect, useRef } from 'react';

const SESSION_ID_KEY = 'anon_session_id';

// Generate or retrieve anonymous session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') {
    console.log('[Anonymous Tracking] window is undefined, returning empty string');
    return '';
  }
  
  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    console.log('[Anonymous Tracking] Retrieved from localStorage:', sessionId);
    
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(SESSION_ID_KEY, sessionId);
      console.log('[Anonymous Tracking] Generated new session ID:', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error('[Anonymous Tracking] Error accessing localStorage:', error);
    // Fallback: generate session ID in memory
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
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
  const iframeFoundRef = useRef<boolean>(false);

  // Initialize session ID on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    sessionId.current = getSessionId();
    console.log('[Anonymous Tracking] Initialized with session ID:', sessionId.current);
    console.log('[Anonymous Tracking] Tracking:', { mediaId, mediaType, title });
  }, [mediaId, mediaType, title]);

  // Function to track watch progress
  const trackWatch = async (currentDuration: number) => {
    if (!sessionId.current) {
      console.log('[Anonymous Tracking] No session ID, skipping track');
      return;
    }

    try {
      console.log('[Anonymous Tracking] Posting watch event:', {
        sessionId: sessionId.current,
        mediaId,
        mediaType,
        durationWatched: currentDuration,
      });

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
        console.error('[Anonymous Tracking] Failed to track watch:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log('[Anonymous Tracking] Watch event recorded successfully:', data);
    } catch (error) {
      console.error('[Anonymous Tracking] Error tracking watch:', error);
    }
  };

  // Start tracking interval when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[Anonymous Tracking] Starting tracking interval...');

    // Set up interval to track every 5 seconds
    trackingIntervalRef.current = setInterval(() => {
      try {
        // Check if iframe exists (any iframe on the page)
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        
        if (iframe && !iframeFoundRef.current) {
          console.log('[Anonymous Tracking] Found iframe:', iframe.src);
          iframeFoundRef.current = true;
        }

        // Track regardless of whether iframe is found - just post the current duration
        durationWatchedRef.current += 5; // Increment by 5 seconds per interval (5s * 1 call = 5s watched)
        
        console.log('[Anonymous Tracking] Track tick - duration:', durationWatchedRef.current);
        trackWatch(durationWatchedRef.current);
      } catch (error) {
        console.error('[Anonymous Tracking] Error in tracking interval:', error);
      }
    }, 5000); // Track every 5 seconds

    return () => {
      console.log('[Anonymous Tracking] Cleaning up tracking interval');
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
