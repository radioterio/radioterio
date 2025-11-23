"use client";

import React, { useState, useEffect } from "react";

interface NowPlayingPositionProps {
  readonly initialPosition: number; // in milliseconds
  readonly maxPosition: number; // in milliseconds
  readonly formatDuration: (seconds: number) => string;
  readonly isPaused?: boolean;
  readonly showDuration?: boolean;
}

export const NowPlayingPosition: React.FC<NowPlayingPositionProps> = ({
  initialPosition,
  maxPosition,
  formatDuration,
  isPaused = false,
  showDuration = true,
}) => {
  const [currentPosition, setCurrentPosition] = useState(initialPosition);

  // Reset position when initialPosition changes (new track)
  useEffect(() => {
    setCurrentPosition(initialPosition);
  }, [initialPosition]);

  // Update position every second
  useEffect(() => {
    if (currentPosition >= maxPosition || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPosition((prev) => {
        const next = prev + 1000; // Add 1 second (1000ms)
        return next >= maxPosition ? maxPosition : next;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [currentPosition, maxPosition, isPaused]);

  return (
    <span>
      {formatDuration(currentPosition / 1000)}
      {showDuration && ` / ${formatDuration(maxPosition / 1000)}`}
    </span>
  );
};

