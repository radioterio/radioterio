"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Channel } from "./Channel";
import {
  ChannelResponse,
  ChannelTrack,
  getChannelTracks,
  seekChannel,
  playChannel,
  pauseChannel,
} from "@/app/actions";
import { useNowPlaying } from "@/hooks/useNowPlaying";

interface ChannelContainerProps {
  readonly channel: ChannelResponse;
  readonly initialTracks: ChannelTrack[];
  readonly userId: number;
}

const TRACK_HEIGHT = 64; // Fixed height in pixels
const BATCH_SIZE = 50;

export const ChannelContainer: React.FC<ChannelContainerProps> = ({
  channel,
  initialTracks,
  userId,
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
        offset: nowPlayingData.track.offset,
        trackUrl: nowPlayingData.track.trackUrl,
      };
      return { track: tempTrack, position: nowPlayingData.position };
    }
  })();

  const placeholderCount = channel.totalTrackCount - tracks.length;

  const handleSeek = useCallback(
    async (offset: number) => {
      const result = await seekChannel(channel.id, offset);
      if (result.type === "left") {
        console.error("Failed to seek:", result.left);
      }
    },
    [channel.id],
  );

  const handlePlay = useCallback(async () => {
    if (!nowPlaying) return;

    // Calculate current offset: track offset + current position
    const trackOffset = "offset" in nowPlaying.track ? nowPlaying.track.offset : 0;
    const currentOffset = trackOffset + nowPlaying.position;

    const result = await playChannel(channel.id, currentOffset);
    if (result.type === "left") {
      console.error("Failed to play:", result.left);
    }
  }, [channel.id, nowPlaying]);

  const handlePause = useCallback(async () => {
    if (!nowPlaying) return;

    // Calculate current offset: track offset + current position
    const trackOffset = "offset" in nowPlaying.track ? nowPlaying.track.offset : 0;
    const currentOffset = trackOffset + nowPlaying.position;

    const result = await pauseChannel(channel.id, currentOffset);
    if (result.type === "left") {
      console.error("Failed to pause:", result.left);
    }
  }, [channel.id, nowPlaying]);

  const handleNext = useCallback(async () => {
    if (!nowPlaying) return;

    // Find current track in the tracks list
    const currentTrackIndex = tracks.findIndex(
      (t) =>
        t.title === nowPlaying.track.title && t.artist === nowPlaying.track.artist,
    );

    if (currentTrackIndex === -1) return;

    // Get next track
    const nextTrackIndex = currentTrackIndex + 1;
    if (nextTrackIndex >= tracks.length) {
      // If at the end, loop to beginning
      const firstTrack = tracks[0];
      if (firstTrack && "offset" in firstTrack) {
        const result = await seekChannel(channel.id, firstTrack.offset);
        if (result.type === "left") {
          console.error("Failed to seek to next track:", result.left);
        }
      }
    } else {
      const nextTrack = tracks[nextTrackIndex];
      if (nextTrack && "offset" in nextTrack) {
        const result = await seekChannel(channel.id, nextTrack.offset);
        if (result.type === "left") {
          console.error("Failed to seek to next track:", result.left);
        }
      }
    }
  }, [channel.id, nowPlaying, tracks]);

  const handlePrev = useCallback(async () => {
    if (!nowPlaying) return;

    // Find current track in the tracks list
    const currentTrackIndex = tracks.findIndex(
      (t) =>
        t.title === nowPlaying.track.title && t.artist === nowPlaying.track.artist,
    );

    if (currentTrackIndex === -1) return;

    // Get previous track
    const prevTrackIndex = currentTrackIndex - 1;
    if (prevTrackIndex < 0) {
      // If at the beginning, loop to end
      const lastTrack = tracks[tracks.length - 1];
      if (lastTrack && "offset" in lastTrack) {
        const result = await seekChannel(channel.id, lastTrack.offset);
        if (result.type === "left") {
          console.error("Failed to seek to previous track:", result.left);
        }
      }
    } else {
      const prevTrack = tracks[prevTrackIndex];
      if (prevTrack && "offset" in prevTrack) {
        const result = await seekChannel(channel.id, prevTrack.offset);
        if (result.type === "left") {
          console.error("Failed to seek to previous track:", result.left);
        }
      }
    }
  }, [channel.id, nowPlaying, tracks]);

  return (
    <Channel
      channel={channel}
      tracks={tracks}
      placeholderCount={placeholderCount}
      trackHeight={TRACK_HEIGHT}
      nowPlaying={nowPlaying}
      observerTarget={observerTarget}
      isLoading={isLoading}
      userId={userId}
      onSeek={handleSeek}
      onPlay={handlePlay}
      onPause={handlePause}
      onNext={handleNext}
      onPrev={handlePrev}
    />
  );
};

