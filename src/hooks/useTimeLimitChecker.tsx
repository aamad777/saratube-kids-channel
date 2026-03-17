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
  extensionActive: boolean;
  extensionMinutes: number;
}

const EXTENSION_KEY = "parentTimeExtension";

interface StoredExtension {
  childId: string;
  expiresAt: number; // timestamp
  extraMinutes: number;
}

function getActiveExtension(childId: string): StoredExtension | null {
  try {
    const raw = localStorage.getItem(EXTENSION_KEY);
    if (!raw) return null;
    const ext: StoredExtension = JSON.parse(raw);
    if (ext.childId !== childId) return null;
    if (Date.now() > ext.expiresAt) {
      localStorage.removeItem(EXTENSION_KEY);
      return null;
    }
    return ext;
  } catch {
    return null;
  }
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
    extensionActive: false,
    extensionMinutes: 0,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        
        // Check for active parent extension
        const extension = getActiveExtension(childSession.id);
        const effectiveLimit = limits.daily_limit_minutes + (extension?.extraMinutes || 0);
        const remainingMinutes = Math.max(0, effectiveLimit - usedMinutes);

        if (usedMinutes >= effectiveLimit) {
          setState({
            isLocked: true,
            lockReason: "time-limit",
            dailyLimitMinutes: limits.daily_limit_minutes,
            usedMinutes,
            remainingMinutes: 0,
            bedtimeStart: limits.bedtime_start,
            bedtimeEnd: limits.bedtime_end,
            isEnabled: true,
            extensionActive: !!extension,
            extensionMinutes: extension?.extraMinutes || 0,
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
          extensionActive: !!extension,
          extensionMinutes: extension?.extraMinutes || 0,
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

  // Grant a temporary time extension
  const grantExtension = useCallback((extraMinutes: number) => {
    if (!childSession?.id) return;
    
    const extension: StoredExtension = {
      childId: childSession.id,
      expiresAt: Date.now() + extraMinutes * 60 * 1000,
      extraMinutes,
    };
    localStorage.setItem(EXTENSION_KEY, JSON.stringify(extension));
    
    // Immediately recheck to unlock the screen
    checkTimeLimit();
  }, [childSession?.id, checkTimeLimit]);

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

  return { ...state, recheckLimits: checkTimeLimit, grantExtension };
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
