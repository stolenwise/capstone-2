import { useState, useEffect } from "react";

export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : initial;
  });
  useEffect(() => {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
