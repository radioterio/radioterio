"use client";

import React, { RefObject } from "react";
import Image from "next/image";
import { ChannelResponse, ChannelTrack } from "@/app/actions";
import { getStatusColor } from "@/common/status-color";
import { NowPlayingPosition } from "@/components/NowPlayingPosition/NowPlayingPosition";
import { ChannelPreview } from "@/components/ChannelPreview/ChannelPreview";

interface ChannelProps {
  readonly channel: ChannelResponse;
  readonly tracks: ChannelTrack[];
  readonly placeholderCount: number;
  readonly trackHeight: number;
  readonly nowPlaying: { track: ChannelTrack; position: number } | null;
  readonly observerTarget: RefObject<HTMLDivElement>;
  readonly isLoading: boolean;
  readonly userId: number;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const Channel: React.FC<ChannelProps> = ({
  channel,
  tracks,
  placeholderCount,
  trackHeight,
  nowPlaying,
  observerTarget,
  isLoading,
  userId,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:grid md:grid-cols-2 md:h-screen flex flex-col md:flex-row">
        {/* Left panel - Channel info (top on mobile) */}
        <section className="md:border-r md:border-gray-200 md:overflow-y-auto bg-white border-b md:border-b-0 border-gray-200">
          <div className="p-6 space-y-6">
            {/* Channel Preview */}
            <div className="-mx-6 -mt-6">
              <ChannelPreview channelId={channel.id} channelStatus={channel.status} userId={userId} />
            </div>

            {/* Play controls */}
            <div className="flex justify-center gap-3">
              <button className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium">
                Play
              </button>
              <button className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium">
                Pause
              </button>
              <button className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium">
                Stop
              </button>
            </div>

            {/* Streaming monitoring */}
            {nowPlaying && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-sm font-medium text-gray-900 mb-2">Now Playing</div>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{nowPlaying.track.title}</div>
                  <div className="text-gray-600">{nowPlaying.track.artist}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Position:{" "}
                    <NowPlayingPosition
                      initialPosition={nowPlaying.position}
                      maxPosition={nowPlaying.track.duration}
                      formatDuration={formatDuration}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Total tracks:</span>
                  <span className="font-medium text-gray-900">{channel.totalTrackCount}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right panel - Tracklist */}
        <section className="md:overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-6">
            {/* Cover */}
            <div className="flex justify-center">
              {channel.coverFileUrl ? (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                  <Image
                    src={channel.coverFileUrl}
                    alt={channel.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-48 h-48 rounded-lg flex items-center justify-center text-gray-400"
                  style={{
                    backgroundColor: channel.coverBackgroundColor || "#f3f4f6",
                  }}
                >
                  No cover
                </div>
              )}
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{channel.title}</h1>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor(channel.status)}`}
                  title={channel.status}
                />
                <span className="text-sm text-gray-600">{channel.status}</span>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900">Tracklist</h2>
            <div className="space-y-0">
              {/* Rendered tracks */}
              {tracks.map((track, index) => {
                const isPlaying =
                  nowPlaying?.track.id === track.id ||
                  (nowPlaying?.track.title === track.title &&
                    nowPlaying?.track.artist === track.artist);

                return (
                  <div
                    key={`${track.id}-${index}`}
                    className={`flex items-center gap-4 px-4 py-3 border-b border-gray-200 ${
                      isPlaying ? "bg-gray-100" : "bg-white"
                    }`}
                    style={{ height: `${trackHeight}px` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{track.title}</div>
                      <div className="text-sm text-gray-600 truncate">{track.artist}</div>
                    </div>
                    <div className="text-sm text-gray-500 flex-shrink-0">
                      {isPlaying && nowPlaying ? (
                        <NowPlayingPosition
                          initialPosition={nowPlaying.position}
                          maxPosition={track.duration}
                          formatDuration={formatDuration}
                        />
                      ) : (
                        formatDuration(track.duration / 1000)
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Observer target - placed right after tracks, before placeholders */}
              {placeholderCount > 0 && <div ref={observerTarget} style={{ height: "1px" }} />}

              {/* Placeholders */}
              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-100 animate-pulse"
                  style={{ height: `${trackHeight}px` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-12 flex-shrink-0"></div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="text-sm text-gray-500">Loading...</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

