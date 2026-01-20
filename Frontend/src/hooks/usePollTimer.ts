import { useMemo } from 'react';
import { useAppStore } from '../store';

export const usePollTimer = () => {
  const remainingTime = useAppStore((state) => state.remainingTime);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingTime]);

  const isExpired = remainingTime <= 0;
  const isLowTime = remainingTime <= 10 && remainingTime > 0;

  return {
    remainingTime,
    formattedTime,
    isExpired,
    isLowTime,
  };
};
