"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Channel } from "./Channel";
import { ChannelResponse, ChannelTrack, getChannelTracks, getNowPlaying } from "@/app/actions";

interface ChannelContainerProps {
  readonly channel: ChannelResponse;
  readonly initialTracks: ChannelTrack[];
}

const TRACK_HEIGHT = 64; // Fixed height in pixels
const BATCH_SIZE = 50;

export const ChannelContainer: React.FC<ChannelContainerProps> = ({
  channel,
  initialTracks,
}) => {
  const [tracks, setTracks] = useState<ChannelTrack[]>(initialTracks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTracks.length < channel.totalTrackCount);
  const [nowPlaying, setNowPlaying] = useState<{ track: ChannelTrack; position: number } | null>(
    null,
  );
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load more tracks
  const loadMoreTracks = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getChannelTracks(channel.id, tracks.length, BATCH_SIZE);
      if (result.type === "right") {
        const newTracks = result.right;
        setTracks((prev) => [...prev, ...newTracks]);
        setHasMore(tracks.length + newTracks.length < channel.totalTrackCount);
      }
    } catch (error) {
      console.error("Failed to load tracks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [channel.id, channel.totalTrackCount, tracks.length, isLoading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMoreTracks();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px", // Trigger 200px before the target is visible
      },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMoreTracks]);

  // Poll for now playing (every 5 seconds)
  useEffect(() => {
    const updateNowPlaying = async () => {
      try {
        const timestamp = Date.now();
        const result = await getNowPlaying(channel.id, timestamp);
        if (result.type === "right") {
          const np = result.right;
          // Find the track in our tracks list by matching title and artist
          const track = tracks.find(
            (t) => t.title === np.track.title && t.artist === np.track.artist,
          );
          if (track) {
            setNowPlaying({ track, position: np.position });
          } else {
            // If track not found in loaded tracks, create a temporary track object
            const tempTrack: ChannelTrack = {
              id: 0,
              filename: np.track.filename,
              extension: "",
              title: np.track.title,
              artist: np.track.artist,
              duration: np.track.duration,
              trackUrl: np.track.trackUrl,
            };
            setNowPlaying({ track: tempTrack, position: np.position });
          }
        }
      } catch (error) {
        // Channel might not be playing, ignore errors
        setNowPlaying(null);
      }
    };

    updateNowPlaying();
    const interval = setInterval(updateNowPlaying, 5000);

    return () => clearInterval(interval);
  }, [channel.id, tracks]);

  const placeholderCount = channel.totalTrackCount - tracks.length;

  return (
    <Channel
      channel={channel}
      tracks={tracks}
      placeholderCount={placeholderCount}
      trackHeight={TRACK_HEIGHT}
      nowPlaying={nowPlaying}
      observerTarget={observerTarget}
      isLoading={isLoading}
    />
  );
};

