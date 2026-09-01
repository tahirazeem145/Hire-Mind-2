"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface InteractiveCharacterProps {
  className?: string;
  isPasswordFocused?: boolean;
}

export function InteractiveCharacter({
  className = "",
  isPasswordFocused = false,
}: InteractiveCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Target coordinates for smooth lerping
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // Periodic natural blinking
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 160);
    };

    const interval = setInterval(() => {
      // Random blink interval between 3s and 6s
      if (Math.random() > 0.3) {
        triggerBlink();
      }
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  // Smooth lerp animation loop
  const animate = useCallback(() => {
    const lerp = 0.18;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp;

    setPupilPos({
      x: currentPos.current.x,
      y: currentPos.current.y,
    });

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  // Pointer position tracker
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Eye center in screen coordinates (approx 53.8% x, 37.3% y of container)
      const eyeCenterX = rect.left + rect.width * 0.538;
      const eyeCenterY = rect.top + rect.height * 0.373;

      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      // Vector from eye to pointer
      const dx = clientX - eyeCenterX;
      const dy = clientY - eyeCenterY;
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      // Max eye travel distance in pixels (scaled relative to container size)
      const maxTravel = Math.min(rect.width * 0.058, 16);
      const intensity = Math.min(1, distance / 350);
      const travel = maxTravel * intensity;

      targetPos.current = {
        x: Math.cos(angle) * travel,
        y: Math.sin(angle) * travel,
      };
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, []);

  // When password field is focused, eye shyly looks down or away
  useEffect(() => {
    if (isPasswordFocused) {
      targetPos.current = { x: -8, y: 12 };
    }
  }, [isPasswordFocused]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none transition-transform duration-300 ${
        isHovered ? "scale-[1.03]" : "scale-100"
      } ${className}`}
      style={{
        width: "100%",
        maxWidth: "240px",
        aspectRatio: "420 / 515",
      }}
    >
      {/* 1. Behind: Eyeball Layer (Sclera + Iris + Pupil + Reflections) */}
      <div
        className="absolute overflow-hidden rounded-full shadow-inner"
        style={{
          left: "40.3%",
          top: "26.3%",
          width: "27.1%",
          height: "22.1%",
          backgroundColor: "#f4f3ed",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, #ffffff 0%, #ebe8df 75%, #cfcbbd 100%)",
        }}
      >
        {/* Moving Iris & Pupil */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0)`,
          }}
        >
          {/* Brown Iris */}
          <div
            className="relative rounded-full flex items-center justify-center shadow-md"
            style={{
              width: "56%",
              height: "56%",
              background:
                "radial-gradient(circle at 40% 40%, #8d4f24 0%, #5a2e12 60%, #301605 100%)",
              border: "1px solid rgba(0,0,0,0.3)",
            }}
          >
            {/* Black Pupil */}
            <div
              className="rounded-full bg-[#110e0c]"
              style={{
                width: "48%",
                height: "48%",
              }}
            />

            {/* Specular White Highlight */}
            <div
              className="absolute rounded-full bg-white/90 shadow-sm"
              style={{
                width: "20%",
                height: "20%",
                top: "20%",
                left: "22%",
              }}
            />
            {/* Secondary tiny sparkle */}
            <div
              className="absolute rounded-full bg-white/60"
              style={{
                width: "10%",
                height: "10%",
                bottom: "26%",
                right: "26%",
              }}
            />
          </div>
        </div>

        {/* Eyelid for Blinking */}
        <div
          className="absolute inset-0 bg-[#f5cb18] transition-all duration-75 pointer-events-none"
          style={{
            transform: isBlinking ? "scaleY(1)" : "scaleY(0)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* 2. In Front: Minion Frame with Cutout Goggle Rim & Body */}
      <img
        src="/minion_frame.png"
        alt="HireMind AI Character"
        className="relative z-10 w-full h-full object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
        draggable={false}
      />

      {/* 3. Subtle Goggle Glass Specular Shine Overlay */}
      <div
        className="absolute pointer-events-none z-20 rounded-full"
        style={{
          left: "40.3%",
          top: "26.3%",
          width: "27.1%",
          height: "22.1%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
        }}
      />
    </div>
  );
}
