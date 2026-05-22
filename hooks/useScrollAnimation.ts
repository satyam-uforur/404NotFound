import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation(threshold = 0.5) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  // Track scroll progress for parallax/deconstructed effects
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const element = ref.current;
        const rect = element.getBoundingClientRect();
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress from 0 to 1
        const scrollProgress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + elementHeight)
        ));
        
        setScrollProgress(scrollProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { ref, isVisible, scrollProgress };
}
