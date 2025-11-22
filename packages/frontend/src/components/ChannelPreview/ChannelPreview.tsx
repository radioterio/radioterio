"use client";

import React, { useEffect, useState, useRef } from "react";
import { useColorsAnimation } from "./useColorsAnimation";
import { useNowPlaying } from "@/hooks/useNowPlaying";

interface ChannelPreviewProps {
  readonly channelId: number;
  readonly channelStatus?: string;
  readonly userId: number;
}

const PLAYBACK_SERVER_URL = process.env.NEXT_PUBLIC_PLAYBACK_SERVER_URL || "";

export const ChannelPreview: React.FC<ChannelPreviewProps> = ({
  channelId,
  channelStatus,
  userId,
}) => {
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the shared hook for now playing data
  const nowPlaying = useNowPlaying(channelId);

  // Initialize time only on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setInitialTime(Date.now());
  }, []);

  // Use synchronized time based on Date.now() for cross-tab/cross-device sync
  const colorsState = useColorsAnimation(initialTime ?? 0);

  // Reset initial time every minute to keep it synchronized
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      setInitialTime(Date.now());
    }, 60000); // Reset every minute

    return () => clearInterval(interval);
  }, [isMounted]);

  // Handle mute/unmute toggle
  const handleToggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      // Unmute: load and play audio stream
      const streamUrl = `${PLAYBACK_SERVER_URL}/user/${userId}/channel/${channelId}/stream`;
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
      setIsMuted(false);
    } else {
      // Mute: pause and clear source
      audioRef.current.pause();
      audioRef.current.src = "";
      setIsMuted(true);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
      {/* Gradient Frame A - only render when mounted to avoid hydration mismatch */}
      {isMounted && (
        <div
          className="absolute inset-0"
          style={{
            opacity: colorsState.frameAOpacity,
            transition: "opacity 250ms linear",
            backgroundImage: `
              linear-gradient(to bottom left, ${colorsState.frameAColors[0]} 0%, transparent 75%),
              linear-gradient(to bottom right, ${colorsState.frameAColors[1]} 0%, transparent 75%),
              linear-gradient(to top left, ${colorsState.frameAColors[2]} 0%, transparent 75%),
              linear-gradient(to top right, ${colorsState.frameAColors[3]} 0%, transparent 75%)
            `,
          }}
        />
      )}

      {/* Gradient Frame B - only render when mounted to avoid hydration mismatch */}
      {isMounted && (
        <div
          className="absolute inset-0"
          style={{
            opacity: colorsState.frameBOpacity,
            transition: "opacity 250ms linear",
            backgroundImage: `
              linear-gradient(to bottom left, ${colorsState.frameBColors[0]} 0%, transparent 75%),
              linear-gradient(to bottom right, ${colorsState.frameBColors[1]} 0%, transparent 75%),
              linear-gradient(to top left, ${colorsState.frameBColors[2]} 0%, transparent 75%),
              linear-gradient(to top right, ${colorsState.frameBColors[3]} 0%, transparent 75%)
            `,
          }}
        />
      )}

      {/* PREVIEW label - top right */}
      {channelStatus !== "Stopped" && (
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1 rounded bg-black/50 text-white text-xs font-medium">
            PREVIEW
          </span>
        </div>
      )}

      {/* Track info - bottom left */}
      {nowPlaying && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="px-4 py-2 rounded bg-black/50 text-white">
            <div className="font-medium" style={{ fontSize: "clamp(0.875rem, 2vw, 1.25rem)" }}>{nowPlaying.track.title}</div>
            <div className="text-gray-300" style={{ fontSize: "clamp(0.75rem, 1.5vw, 1rem)" }}>{nowPlaying.track.artist}</div>
          </div>
        </div>
      )}

      {/* STOPPED overlay - center */}
      {channelStatus === "Stopped" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <span className="text-white text-2xl font-semibold">STOPPED</span>
        </div>
      )}

      {/* Mute/Unmute button - bottom right */}
      {channelStatus !== "Stopped" && (
        <button
          className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center cursor-default"
          onClick={handleToggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            // Muted icon (speaker with slash)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            // Unmuted icon (speaker)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
};

