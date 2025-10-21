"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#0d0c0f',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: '#ef4444', 
              marginBottom: '1rem' 
            }}>
              ⚠️ Critical Error
            </h1>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1rem' 
            }}>
              Application Failed to Load
            </h2>
            <p style={{ 
              color: '#a0a0a0', 
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              {error.message || "A critical error occurred that prevented the application from loading properly."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={() => reset()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = "/"}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#a0a0a0',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
            </div>
            <details style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '8px', 
              textAlign: 'left' 
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Error Details
              </summary>
              <pre style={{ 
                fontSize: '0.75rem', 
                color: '#a0a0a0', 
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {error.stack}
              </pre>
            </details>
          </div>
        </div>
      </body>
    </html>
  );
}