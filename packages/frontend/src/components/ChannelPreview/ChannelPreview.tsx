"use client";

import React, { useEffect, useState } from "react";
import { getNowPlaying } from "@/app/actions";
import { useColorsAnimation } from "./useColorsAnimation";

interface ChannelPreviewProps {
  readonly channelId: number;
  readonly channelStatus?: string;
}

export const ChannelPreview: React.FC<ChannelPreviewProps> = ({
  channelId,
  channelStatus,
}) => {
  const [nowPlaying, setNowPlaying] = useState<{
    title: string;
    artist: string;
  } | null>(null);
  const [initialTime, setInitialTime] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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

  // Fetch now playing track
  useEffect(() => {
    const updateNowPlaying = async () => {
      try {
        const timestamp = Date.now();
        const result = await getNowPlaying(channelId, timestamp);
        if (result.type === "right") {
          setNowPlaying({
            title: result.right.track.title,
            artist: result.right.track.artist,
          });
        } else {
          setNowPlaying(null);
        }
      } catch (error) {
        setNowPlaying(null);
      }
    };

    updateNowPlaying();
    const interval = setInterval(updateNowPlaying, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [channelId]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
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
            <div className="font-medium text-sm">{nowPlaying.title}</div>
            <div className="text-xs text-gray-300">{nowPlaying.artist}</div>
          </div>
        </div>
      )}

      {/* STOPPED overlay - center */}
      {channelStatus === "Stopped" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <span className="text-white text-2xl font-semibold">STOPPED</span>
        </div>
      )}
    </div>
  );
};

