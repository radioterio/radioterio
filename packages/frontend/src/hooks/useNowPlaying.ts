import { useEffect, useState, useRef } from "react";
import { getNowPlaying, NowPlaying } from "@/app/actions";

export const useNowPlaying = (channelId: number, pollInterval: number = 5000) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    const updateNowPlaying = async () => {
      const timestamp = nextTimestampRef.current ?? Date.now();
      nextTimestampRef.current = null;

      const result = await getNowPlaying(channelId, timestamp).catch(() => null);
      if (result?.type === "right") {
        setNowPlaying(result.right);

        const remaining = result.right.track.duration - result.right.position;
        if (remaining > 0 && remaining < pollInterval) {
          nextTimestampRef.current = timestamp + remaining;
          timeoutRef.current = setTimeout(updateNowPlaying, remaining);
        } else {
          timeoutRef.current = setTimeout(updateNowPlaying, pollInterval);
        }
      } else {
        setNowPlaying(null);
        timeoutRef.current = setTimeout(updateNowPlaying, pollInterval);
      }
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
