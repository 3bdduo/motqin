"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    // Only run on non-touch devices with standard mouse wheel
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let isRunning = false;
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    // Slower, butter-smooth easing factor (0.075 gives slow, luxurious glide)
    const ease = 0.075;

    function onWheel(e: WheelEvent) {
      // Don't intercept if modifier keys are pressed or inside an element with its own overflow scroll
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (target) {
        let el: HTMLElement | null = target;
        while (el && el !== document.body) {
          const style = window.getComputedStyle(el);
          if (
            (style.overflowY === "auto" || style.overflowY === "scroll") &&
            el.scrollHeight > el.clientHeight
          ) {
            // Let the internal container scroll natively
            return;
          }
          el = el.parentElement;
        }
      }

      e.preventDefault();

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY += e.deltaY * 0.85;
      targetY = Math.max(0, Math.min(maxScroll, targetY));

      if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(updateScroll);
      }
    }

    function updateScroll() {
      const diff = targetY - currentY;
      // Interpolate current towards target with slow smooth easing
      currentY += diff * ease;

      window.scrollTo(0, currentY);

      if (Math.abs(diff) > 0.5) {
        requestAnimationFrame(updateScroll);
      } else {
        window.scrollTo(0, targetY);
        currentY = targetY;
        isRunning = false;
      }
    }

    function onScroll() {
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
