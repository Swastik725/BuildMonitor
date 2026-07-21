import { useEffect, useRef, type RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(onOutside: () => void): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);

  return ref;
}
