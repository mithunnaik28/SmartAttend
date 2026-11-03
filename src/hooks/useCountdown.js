import { useState, useEffect } from 'react';

/**
 * Custom hook to manage real-time countdown to session expiry.
 * Returns formatted time string, remaining seconds, progress percentage, and expired status.
 */
export function useCountdown(expiresAt, totalDurationMinutes = 15, onExpire) {
  const [timeLeft, setTimeLeft] = useState({
    minutes: 0,
    seconds: 0,
    totalRemainingSeconds: 0,
    formatted: '00:00',
    isExpired: true,
    progressPercentage: 0
  });

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(prev => ({ ...prev, isExpired: true, formatted: '00:00', progressPercentage: 0 }));
      return;
    }

    const targetTime = new Date(expiresAt).getTime();
    const totalDurationSeconds = (totalDurationMinutes || 15) * 60;

    const calculate = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          minutes: 0,
          seconds: 0,
          totalRemainingSeconds: 0,
          formatted: '00:00',
          isExpired: true,
          progressPercentage: 0
        });
        if (onExpire) onExpire();
        return;
      }

      const totalRemainingSeconds = Math.floor(difference / 1000);
      const minutes = Math.floor(totalRemainingSeconds / 60);
      const seconds = totalRemainingSeconds % 60;

      const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      const progressPercentage = Math.min(
        100,
        Math.max(0, (totalRemainingSeconds / totalDurationSeconds) * 100)
      );

      setTimeLeft({
        minutes,
        seconds,
        totalRemainingSeconds,
        formatted,
        isExpired: false,
        progressPercentage
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, totalDurationMinutes, onExpire]);

  return timeLeft;
}
