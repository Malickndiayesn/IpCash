// Utility functions to handle DOM manipulation safely

export const safeTimeout = (callback: () => void, delay: number = 100) => {
  return setTimeout(() => {
    try {
      callback();
    } catch (error) {
      console.warn('Safe timeout callback error:', error);
    }
  }, delay);
};

export const safeMutationCallback = (
  callback: () => void,
  delay: number = 100
) => {
  return () => {
    safeTimeout(callback, delay);
  };
};

// Helper to prevent React concurrent update issues
export const batchUpdates = (updates: (() => void)[]) => {
  updates.forEach((update, index) => {
    setTimeout(update, index * 50); // Stagger updates by 50ms
  });
};