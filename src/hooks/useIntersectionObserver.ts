import { useCallback, useRef } from 'react';

export default function useIntersectionObserver(
  options?: IntersectionObserverInit
): (node: HTMLElement | null) => void {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.1, ...options });

      observerRef.current.observe(node);
    },
    [options]
  );
}
