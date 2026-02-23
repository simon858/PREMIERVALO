import { useState, useEffect } from 'react';
import { formatCountdown } from '../utils/helpers';

export const useCountdown = (targetDate) => {
  const [display, setDisplay] = useState(() => formatCountdown(targetDate));

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setDisplay(formatCountdown(targetDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return display;
};
