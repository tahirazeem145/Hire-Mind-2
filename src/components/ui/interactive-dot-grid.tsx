"use client";

import React, { useEffect, useRef } from "react";

interface InteractiveDotGridProps {
  className?: string;
  dotSpacing?: number;
  baseRadius?: number;
  maxRadius?: number;
  influenceRadius?: number;
}

export function InteractiveDotGrid({
  className = "",
  dotSpacing = 28,
  baseRadius = 1.2,
  maxRadius = 4.8,
  influenceRadius = 150,
}: InteractiveDotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    // Dot grid state with smooth lerping sizes
    interface Dot {
      x: number;
      y: number;
      currentRadius: number;
      targetRadius: number;
      currentAlpha: number;
      targetAlpha: number;
    }

    let dots: Dot[] = [];

    const initGrid = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      width = parent.clientWidth;
      height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * dotSpacing,
            y: j * dotSpacing,
            currentRadius: baseRadius,
            targetRadius: baseRadius,
            currentAlpha: 0.12,
            targetAlpha: 0.12,
          });
        }
      }
    };

    initGrid();

    // Resize observer to keep canvas perfectly sized
    const resizeObserver = new ResizeObserver(() => {
      initGrid();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Pointer move listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove, { passive: true });
      parent.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDarkMode = document.documentElement.classList.contains("dark");
      const mouse = mouseRef.current;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        if (mouse.active) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.hypot(dx, dy);

          if (dist < influenceRadius) {
            // Distance ratio: 1 at cursor, 0 at outer influence
            const factor = Math.pow(1 - dist / influenceRadius, 2);
            dot.targetRadius = baseRadius + (maxRadius - baseRadius) * factor;
            dot.targetAlpha = isDarkMode
              ? 0.15 + 0.65 * factor
              : 0.15 + 0.55 * factor;
          } else {
            dot.targetRadius = baseRadius;
            dot.targetAlpha = isDarkMode ? 0.12 : 0.14;
          }
        } else {
          dot.targetRadius = baseRadius;
          dot.targetAlpha = isDarkMode ? 0.12 : 0.14;
        }

        // Smooth spring lerp toward target
        dot.currentRadius += (dot.targetRadius - dot.currentRadius) * 0.16;
        dot.currentAlpha += (dot.targetAlpha - dot.currentAlpha) * 0.16;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.5, dot.currentRadius), 0, Math.PI * 2);

        if (isDarkMode) {
          // Warm gold / amber accent when expanded, neutral otherwise
          if (dot.currentRadius > baseRadius + 1.0) {
            ctx.fillStyle = `rgba(245, 158, 11, ${dot.currentAlpha})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${dot.currentAlpha})`;
          }
        } else {
          // Dark warm espresso dot
          if (dot.currentRadius > baseRadius + 1.0) {
            ctx.fillStyle = `rgba(217, 119, 6, ${dot.currentAlpha})`;
          } else {
            ctx.fillStyle = `rgba(35, 32, 29, ${dot.currentAlpha})`;
          }
        }

        ctx.fill();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      resizeObserver.disconnect();
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [dotSpacing, baseRadius, maxRadius, influenceRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, #000 65%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, #000 65%, transparent 100%)",
      }}
    />
  );
}
