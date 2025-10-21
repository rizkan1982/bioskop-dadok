"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">⚠️ Error</h1>
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          Something went wrong!
        </h2>
        <p className="text-default-500 mb-6">
          {error.message || "An unexpected error occurred while loading the application."}
        </p>
        <div className="space-y-3">
          <Button 
            color="primary" 
            size="lg" 
            className="w-full"
            onClick={() => reset()}
          >
            Try Again
          </Button>
          <Button 
            variant="bordered" 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = "/"}
          >
            Go Home
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 p-4 bg-default-100 rounded-lg text-left">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 text-xs text-default-600 overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}