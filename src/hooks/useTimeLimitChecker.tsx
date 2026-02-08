import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";

interface TimeLimitState {
  isLocked: boolean;
  lockReason: "time-limit" | "bedtime" | null;
  dailyLimitMinutes: number | null;
  usedMinutes: number;
  remainingMinutes: number;
  bedtimeStart: string | null;
  bedtimeEnd: string | null;
  isEnabled: boolean;
}

export const useTimeLimitChecker = () => {
  const { childSession, isChildActive } = useChildSession();
  const [state, setState] = useState<TimeLimitState>({
    isLocked: false,
    lockReason: null,
    dailyLimitMinutes: null,
    usedMinutes: 0,
    remainingMinutes: Infinity,
    bedtimeStart: null,
    bedtimeEnd: null,
    isEnabled: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkTimeLimit = useCallback(async () => {
    if (!isChildActive || !childSession?.id) {
      setState(prev => ({ ...prev, isLocked: false, lockReason: null }));
      return;
    }

    try {
      // Fetch time limit settings
      const { data: limits } = await supabase
        .from("time_limits")
        .select("*")
        .eq("child_user_id", childSession.id)
        .maybeSingle();

      if (!limits || !limits.is_enabled) {
        setState(prev => ({
          ...prev,
          isLocked: false,
          lockReason: null,
          isEnabled: false,
        }));
        return;
      }

      // Check bedtime
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      if (limits.bedtime_start && limits.bedtime_end) {
        const isBedtime = isInBedtime(currentTime, limits.bedtime_start, limits.bedtime_end);
        if (isBedtime) {
          setState(prev => ({
            ...prev,
            isLocked: true,
            lockReason: "bedtime",
            bedtimeStart: limits.bedtime_start,
            bedtimeEnd: limits.bedtime_end,
            isEnabled: true,
            dailyLimitMinutes: limits.daily_limit_minutes,
          }));
          return;
        }
      }

      // Check daily time limit
      if (limits.daily_limit_minutes) {
        const today = new Date().toISOString().split("T")[0];
        const { data: watchTime } = await supabase
          .from("daily_watch_time")
          .select("total_seconds")
          .eq("user_id", childSession.id)
          .eq("watch_date", today)
          .maybeSingle();

        const usedSeconds = watchTime?.total_seconds || 0;
        const usedMinutes = Math.floor(usedSeconds / 60);
        const remainingMinutes = Math.max(0, limits.daily_limit_minutes - usedMinutes);

        if (usedMinutes >= limits.daily_limit_minutes) {
          setState({
            isLocked: true,
            lockReason: "time-limit",
            dailyLimitMinutes: limits.daily_limit_minutes,
            usedMinutes,
            remainingMinutes: 0,
            bedtimeStart: limits.bedtime_start,
            bedtimeEnd: limits.bedtime_end,
            isEnabled: true,
          });
          return;
        }

        setState({
          isLocked: false,
          lockReason: null,
          dailyLimitMinutes: limits.daily_limit_minutes,
          usedMinutes,
          remainingMinutes,
          bedtimeStart: limits.bedtime_start,
          bedtimeEnd: limits.bedtime_end,
          isEnabled: true,
        });
      } else {
        setState(prev => ({
          ...prev,
          isLocked: false,
          lockReason: null,
          isEnabled: true,
        }));
      }
    } catch (error) {
      console.error("Error checking time limits:", error);
    }
  }, [isChildActive, childSession?.id]);

  // Check every 30 seconds
  useEffect(() => {
    if (!isChildActive) {
      setState(prev => ({ ...prev, isLocked: false, lockReason: null }));
      return;
    }

    checkTimeLimit();
    intervalRef.current = setInterval(checkTimeLimit, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isChildActive, checkTimeLimit]);

  return { ...state, recheckLimits: checkTimeLimit };
};

/**
 * Check if the current time falls within the bedtime window.
 * Handles overnight bedtimes (e.g., 20:00 - 07:00).
 */
function isInBedtime(current: string, start: string, end: string): boolean {
  if (start <= end) {
    // Same-day bedtime (e.g., 13:00 - 15:00)
    return current >= start && current < end;
  } else {
    // Overnight bedtime (e.g., 20:00 - 07:00)
    return current >= start || current < end;
  }
}
