import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";

interface UseScreenTimeTrackerOptions {
  videoId: string;
  videoTitle: string;
  category?: string;
}

export const useScreenTimeTracker = ({ videoId, videoTitle, category }: UseScreenTimeTrackerOptions) => {
  const { childSession, isChildActive } = useChildSession();
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);

  const logActivity = useCallback(async (durationSeconds: number) => {
    if (!isChildActive || !childSession?.id || durationSeconds < 1) return;

    try {
      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: childSession.id,
        video_id: videoId,
        video_title: videoTitle,
        category: category || null,
        watch_duration_seconds: durationSeconds,
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }, [isChildActive, childSession?.id, videoId, videoTitle, category]);

  const updateDailyWatchTime = useCallback(async (additionalSeconds: number) => {
    if (!isChildActive || !childSession?.id || additionalSeconds < 1) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      // Check if record exists for today
      const { data: existing } = await supabase
        .from("daily_watch_time")
        .select("*")
        .eq("user_id", childSession.id)
        .eq("watch_date", today)
        .maybeSingle();

      if (existing) {
        // Update existing record
        await supabase
          .from("daily_watch_time")
          .update({ 
            total_seconds: (existing.total_seconds || 0) + additionalSeconds 
          })
          .eq("id", existing.id);
      } else {
        // Create new record
        await supabase.from("daily_watch_time").insert({
          user_id: childSession.id,
          watch_date: today,
          total_seconds: additionalSeconds,
        });
      }
    } catch (error) {
      console.error("Error updating daily watch time:", error);
    }
  }, [isChildActive, childSession?.id]);

  const startTracking = useCallback(() => {
    if (!isChildActive) return;
    
    startTimeRef.current = new Date();
    accumulatedSecondsRef.current = 0;

    // Update watch time every 30 seconds while watching
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
        const newSeconds = elapsed - accumulatedSecondsRef.current;
        
        if (newSeconds >= 30) {
          updateDailyWatchTime(newSeconds);
          accumulatedSecondsRef.current = elapsed;
        }
      }
    }, 30000);
  }, [isChildActive, updateDailyWatchTime]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (startTimeRef.current && isChildActive) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000);
      const remainingSeconds = elapsed - accumulatedSecondsRef.current;
      
      if (remainingSeconds > 0) {
        updateDailyWatchTime(remainingSeconds);
        logActivity(elapsed);
      }
      
      startTimeRef.current = null;
      accumulatedSecondsRef.current = 0;
    }
  }, [isChildActive, updateDailyWatchTime, logActivity]);

  // Start tracking when video page loads
  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
    };
  }, [videoId]); // Reset when video changes

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
      } else {
        startTracking();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startTracking, stopTracking]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopTracking();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [stopTracking]);

  return { startTracking, stopTracking };
};
