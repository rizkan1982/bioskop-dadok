"use client";

import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="primary" />
        <p className="text-xl font-medium text-foreground animate-pulse">
          Loading DADO CINEMA...
        </p>
        <p className="text-sm text-default-500 max-w-xs text-center">
          Please wait while we prepare your movie experience
        </p>
      </div>
    </div>
  );
}