"use client";

import { useEffect } from "react";

export const GlassPointerLight = () => {
  useEffect(() => {
    const updatePointerPosition = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight) * 100}%`);
    };

    window.addEventListener("pointermove", updatePointerPosition, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointerPosition);
  }, []);

  return null;
};