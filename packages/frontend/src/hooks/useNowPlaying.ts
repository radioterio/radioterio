import { useEffect, useState, useRef } from "react";
import { getNowPlaying, NowPlaying } from "@/app/actions";

export const useNowPlaying = (channelId: number, pollInterval: number = 5000) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateNowPlaying = async () => {
      try {
        const timestamp = Date.now();
        const result = await getNowPlaying(channelId, timestamp);
        if (result.type === "right") {
          setNowPlaying(result.right);
        } else {
          setNowPlaying(null);
        }
      } catch (error) {
        // Channel might not be playing, ignore errors
        setNowPlaying(null);
      }

      // Schedule next update
      timeoutRef.current = setTimeout(updateNowPlaying, pollInterval);
    };

    updateNowPlaying();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [channelId, pollInterval]);

  return nowPlaying;
};

