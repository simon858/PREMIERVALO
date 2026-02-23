import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, isError = false) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, isError }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3100);
  }, []);

  return { toasts, toast };
};
