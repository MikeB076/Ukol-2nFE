// src/usePersistentState.js
import { useEffect, useRef, useState } from "react";

export function usePersistentState(key, initialValue) {
  const initialRef = useRef(initialValue);

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  });

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {}
    }, 100);
    return () => clearTimeout(t);
  }, [key, state]);

  return [state, setState];
}