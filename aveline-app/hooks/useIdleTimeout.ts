"use client";

import { useEffect, useRef, useCallback } from "react";

const EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "touchmove",
  "scroll",
  "wheel",
  "click",
  "focus",
];

type Options = {
  /** Milliseconds of inactivity before `onIdle` fires. Default: 3 600 000 (1 h) */
  timeout?: number;
  /** Fired when the user has been idle for `timeout` ms */
  onIdle: () => void;
  /** Fired when `warningBefore` ms remain before logout */
  onWarning?: () => void;
  /** How many ms before `timeout` to fire `onWarning`. Default: 300 000 (5 min) */
  warningBefore?: number;
};

/**
 * useIdleTimeout
 *
 * Resets on any user interaction. After `timeout` ms of silence:
 *  - fires `onWarning` when `warningBefore` ms remain
 *  - fires `onIdle` when the timeout expires
 *
 * All timers are cleared when the component unmounts.
 */
export function useIdleTimeout({
  timeout = 60 * 60 * 1000,      // 1 hour
  warningBefore = 5 * 60 * 1000, // warn 5 minutes early
  onIdle,
  onWarning,
}: Options) {
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef    = useRef(onIdle);
  const onWarnRef    = useRef(onWarning);

  // Keep refs fresh so callers don't need to memoise the callbacks
  useEffect(() => { onIdleRef.current = onIdle; },    [onIdle]);
  useEffect(() => { onWarnRef.current = onWarning; }, [onWarning]);

  const reset = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);

    // Warning fires (timeout - warningBefore) ms after last activity
    if (onWarnRef.current && warningBefore < timeout) {
      warnTimer.current = setTimeout(
        () => onWarnRef.current?.(),
        timeout - warningBefore
      );
    }

    // Logout fires after full timeout
    idleTimer.current = setTimeout(() => onIdleRef.current(), timeout);
  }, [timeout, warningBefore]);

  useEffect(() => {
    reset(); // start on mount

    const handleActivity = () => reset();

    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    document.addEventListener("visibilitychange", handleActivity);

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
      document.removeEventListener("visibilitychange", handleActivity);
    };
  }, [reset]);
}