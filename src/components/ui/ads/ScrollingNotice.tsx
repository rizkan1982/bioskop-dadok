"use client";

interface ScrollingNoticeProps {
  text?: string;
  className?: string;
}

export default function ScrollingNotice({ 
  text = "Selamat datang di Cinemadadok! Nikmati film dan series terbaik.",
  className = "" 
}: ScrollingNoticeProps) {
  return (
    <div className={`${className} bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white py-3 overflow-hidden relative`}>
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative whitespace-nowrap">
        <div className="inline-flex items-center gap-8 px-4 animate-scroll">
          <span className="inline-flex items-center gap-2 bg-white text-red-600 px-3 py-1 rounded font-bold text-sm uppercase tracking-wide flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            PERHATIAN !!
          </span>
          
          <span className="text-sm md:text-base font-medium">
            {text}
          </span>
          
          <span className="inline-flex items-center gap-2 bg-white text-red-600 px-3 py-1 rounded font-bold text-sm uppercase tracking-wide flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            PERHATIAN !!
          </span>
          
          <span className="text-sm md:text-base font-medium">
            {text}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
