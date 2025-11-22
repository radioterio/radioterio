"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Channel } from "./Channel";
import { ChannelResponse, ChannelTrack, getChannelTracks } from "@/app/actions";
import { useNowPlaying } from "@/hooks/useNowPlaying";

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
  const observerTarget = useRef<HTMLDivElement>(null);

  // Use the shared hook for now playing data
  const nowPlayingData = useNowPlaying(channel.id);

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

  // Map now playing data to match tracks from our list
  const nowPlaying = (() => {
    if (!nowPlayingData) return null;

    // Find the track in our tracks list by matching title and artist
    const track = tracks.find(
      (t) => t.title === nowPlayingData.track.title && t.artist === nowPlayingData.track.artist,
    );
    if (track) {
      return { track, position: nowPlayingData.position };
    } else {
      // If track not found in loaded tracks, create a temporary track object
      const tempTrack: ChannelTrack = {
        id: 0,
        filename: nowPlayingData.track.filename,
        extension: "",
        title: nowPlayingData.track.title,
        artist: nowPlayingData.track.artist,
        duration: nowPlayingData.track.duration,
        trackUrl: nowPlayingData.track.trackUrl,
      };
      return { track: tempTrack, position: nowPlayingData.position };
    }
  })();

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

