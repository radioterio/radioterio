"use client";

import React, { RefObject } from "react";
import Image from "next/image";
import { ChannelResponse, ChannelTrack } from "@/app/actions";
import { getStatusColor } from "@/common/status-color";
import { NowPlayingPosition } from "@/components/NowPlayingPosition/NowPlayingPosition";
import { ChannelPreview } from "@/components/ChannelPreview/ChannelPreview";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";

interface ChannelProps {
  readonly channel: ChannelResponse;
  readonly tracks: ChannelTrack[];
  readonly placeholderCount: number;
  readonly trackHeight: number;
  readonly nowPlaying: { track: ChannelTrack; position: number } | null;
  readonly observerTarget: RefObject<HTMLDivElement>;
  readonly isLoading: boolean;
  readonly userId: number;
  readonly onSeek: (offset: number) => void;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onNext: () => void;
  readonly onPrev: () => void;
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
  onSeek,
  onPlay,
  onPause,
  onNext,
  onPrev,
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

            {/* Player Controls Panel */}
            <div className="-mx-6 -mt-6 bg-white px-6 py-3 border-t border-gray-200">
              {nowPlaying ? (
                <>
                  {/* Track info */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 text-center truncate">
                      {nowPlaying.track.artist} - <span className="font-medium text-gray-900">{nowPlaying.track.title}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 mb-3">
                    {/* Previous track */}
                    <button
                      className="w-10 h-10 flex items-center justify-center cursor-default"
                      onClick={onPrev}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-gray-900"
                      >
                        <polygon points="19 20 9 12 19 4 19 20" />
                        <line x1="5" y1="19" x2="5" y2="5" />
                      </svg>
                    </button>

                    {/* Play/Pause */}
                    <button
                      className="w-12 h-12 flex items-center justify-center cursor-default"
                      onClick={channel.status === "Started" ? onPause : onPlay}
                    >
                      {channel.status === "Started" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8 text-gray-900"
                        >
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-8 h-8 text-gray-900"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>

                    {/* Next track */}
                    <button
                      className="w-10 h-10 flex items-center justify-center cursor-default"
                      onClick={onNext}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-gray-900"
                      >
                        <polygon points="5 4 15 12 5 20 5 4" />
                        <line x1="19" y1="5" x2="19" y2="19" />
                      </svg>
                    </button>
                  </div>

                  {/* Progress bar and time */}
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <span className="text-xs text-gray-600">
                        <NowPlayingPosition
                          initialPosition={nowPlaying.position}
                          maxPosition={nowPlaying.track.duration}
                          formatDuration={formatDuration}
                          isPaused={channel.status !== "Started"}
                        />
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatDuration(nowPlaying.track.duration / 1000)}
                      </span>
                    </div>
                    <ProgressBar
                      position={nowPlaying.position}
                      duration={nowPlaying.track.duration}
                      withProgressing={channel.status === "Started"}
                      onSeek={(position) => {
                        // Calculate offset: current track offset + position within track
                        const trackOffset = "offset" in nowPlaying.track ? nowPlaying.track.offset : 0;
                        onSeek(trackOffset + position);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-sm text-gray-500">No track playing</div>
              )}
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

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tracklist</h2>
              <div className="text-sm text-gray-600">
                <span>Total tracks: </span>
                <span className="font-medium text-gray-900">{channel.totalTrackCount}</span>
              </div>
            </div>
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
                          isPaused={channel.status !== "Started"}
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

