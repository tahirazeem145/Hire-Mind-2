"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { minionAudio } from "@/lib/audio";
import { getGeminiCompanionAdvice, hasGeminiApiKey } from "@/lib/gemini";

interface InteractiveCharacterProps {
  className?: string;
  isPasswordFocused?: boolean;
  isPasswordVisible?: boolean;
  isEmailFocused?: boolean;
  isButtonHovered?: boolean;
}

const QUOTES_POOL = [
  "Bello! 👋",
  "Banana! 🍌",
  "Ready to crush your interview? 🚀",
  "Looking sharp today! ⭐",
  "HireMind AI at your service! 🤖",
  "AI Resume power loaded! 📄",
  "100% job-ready vibe! ✨",
  "Need mock interview practice? 🎙️",
  "Poopaye! 🎉",
];

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
}

export function InteractiveCharacter({
  className = "",
  isPasswordFocused = false,
  isPasswordVisible = false,
  isEmailFocused = false,
  isButtonHovered = false,
}: InteractiveCharacterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Eye physics state
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [pupilScale, setPupilScale] = useState(1);
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyelidAmount, setEyelidAmount] = useState(0); // 0 (open) to 1 (closed)
  
  // 3D Body Tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  // Click / squish / bounce reactions
  const [isSquished, setIsSquished] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Target coordinates for smooth lerping
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  // Periodic natural & double blinking
  useEffect(() => {
    const triggerBlink = (duration = 140) => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, duration);
    };

    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.4) {
        triggerBlink(130);
      } else if (rand > 0.15) {
        // Double blink
        triggerBlink(100);
        setTimeout(() => triggerBlink(110), 220);
      }
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  // Smooth lerp animation loop for eye and body 3D tilt
  const animate = useCallback(() => {
    const eyeLerp = 0.18;
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * eyeLerp;
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * eyeLerp;

    const tiltLerp = 0.12;
    currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * tiltLerp;
    currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * tiltLerp;

    setPupilPos({
      x: currentPos.current.x,
      y: currentPos.current.y,
    });

    setTilt({
      x: currentTilt.current.x,
      y: currentTilt.current.y,
    });

    // Particle animation
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.18, // gravity
          opacity: p.opacity - 0.024,
          rotation: p.rotation + 4,
        }))
        .filter((p) => p.opacity > 0)
    );

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  // Pointer position tracker for eye & 3D tilt
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
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

      // Max eye travel distance in pixels (scaled dynamically)
      const maxTravel = rect.width * 0.054;
      const intensity = Math.min(1, distance / 320);
      const travel = maxTravel * intensity;

      // Body 3D tilt calculation (-10 to +10 deg)
      const tiltFactorX = Math.max(-1, Math.min(1, dx / (window.innerWidth * 0.4)));
      const tiltFactorY = Math.max(-1, Math.min(1, dy / (window.innerHeight * 0.4)));

      targetTilt.current = {
        x: tiltFactorX * 8,
        y: -tiltFactorY * 6,
      };

      // Pupil dilation when cursor is very close (curious look)
      if (distance < 140) {
        setPupilScale(1.16);
      } else {
        setPupilScale(1.0);
      }

      // If special form state is active, form reactivity overrides general cursor
      if (!isPasswordFocused && !isEmailFocused) {
        targetPos.current = {
          x: Math.cos(angle) * travel,
          y: Math.sin(angle) * travel,
        };
      }
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [isPasswordFocused, isEmailFocused]);

  // Form Reactive States
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const travel = rect.width * 0.052;

    if (isPasswordFocused) {
      if (isPasswordVisible) {
        // Surprised look! Wide eyes looking right at the password
        targetPos.current = { x: travel * 0.8, y: -travel * 0.2 };
        setEyelidAmount(0);
        setPupilScale(1.25);
      } else {
        // Shy / Peeking away: eyelids half closed, looking down
        targetPos.current = { x: -travel * 0.7, y: travel * 0.8 };
        setEyelidAmount(0.65);
        setPupilScale(0.9);
      }
    } else if (isEmailFocused) {
      // Look enthusiastically to the right towards the form
      targetPos.current = { x: travel * 0.9, y: 0 };
      setEyelidAmount(0);
      setPupilScale(1.08);
    } else if (isButtonHovered) {
      // Look excitedly up and bounce slightly
      targetPos.current = { x: travel * 0.6, y: -travel * 0.6 };
      setEyelidAmount(0);
      setPupilScale(1.15);
    } else {
      setEyelidAmount(0);
      setPupilScale(1.0);
    }
  }, [isPasswordFocused, isPasswordVisible, isEmailFocused, isButtonHovered]);

  // Interactive Click & Poke Reaction with Minion Sound
  const handleCharacterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 1. Play cute Minion sound effect
    minionAudio.playRandomMinionSound();

    // 2. Trigger squish-and-bounce animation
    setIsSquished(true);
    setTimeout(() => setIsSquished(false), 350);

    // 3. Dynamic Gemini AI quote / Random quote bubble
    if (hasGeminiApiKey()) {
      getGeminiCompanionAdvice().then((tip) => {
        setBubbleText(tip);
      });
    } else {
      const randomQuote = QUOTES_POOL[Math.floor(Math.random() * QUOTES_POOL.length)];
      setBubbleText(randomQuote);
    }

    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 3800);

    // 4. Spawn colorful sparkle particles around click point
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const colors = ["#f59e0b", "#fbbf24", "#38bdf8", "#a855f7", "#ec4899", "#22c55e"];
      const newParticles: Particle[] = [];

      for (let i = 0; i < 14; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 2 + Math.random() * 5;
        newParticles.push({
          id: Date.now() + i,
          x: clickX,
          y: clickY,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed - 2,
          size: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 1,
          rotation: Math.random() * 360,
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* 1. Interactive Speech / Emote Bubble (Positioned safely to the right-top side so it never collides with the quote above) */}
      <div
        className={`absolute top-6 -right-4 sm:-right-16 md:-right-24 z-30 transition-all duration-300 transform pointer-events-none ${
          bubbleText
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-2 scale-90"
        }`}
      >
        <div className="relative bg-card/95 dark:bg-card/90 text-foreground text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-2xl shadow-xl border border-amber-500/30 backdrop-blur-md whitespace-nowrap flex items-center gap-1.5 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{bubbleText || "Bello!"}</span>
          {/* Speech bubble tail pointing left to minion */}
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-card" />
        </div>
      </div>

      {/* 2. Main 3D Perspective Container */}
      <div
        ref={containerRef}
        onClick={handleCharacterClick}
        title="Click to poke me!"
        className={`relative cursor-pointer transition-transform duration-200 ease-out will-change-transform ${
          isSquished ? "scale-x-[1.12] scale-y-[0.88]" : "hover:scale-[1.02]"
        } ${isButtonHovered ? "animate-bounce" : ""} ${className}`}
        style={{
          width: "100%",
          aspectRatio: "420 / 515",
          transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transformOrigin: "bottom center",
        }}
      >
        {/* Floating Sparkle Particles Layer */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-40"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}

        {/* 3. Eyeball Layer (Sclera + Iris + Pupil + Specular Sparkle) */}
        <div
          className="absolute overflow-hidden rounded-full shadow-inner z-0"
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
            className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform transition-transform duration-75"
            style={{
              transform: `translate3d(${pupilPos.x}px, ${pupilPos.y}px, 0) scale(${pupilScale})`,
            }}
          >
            {/* Hazel-Brown Iris */}
            <div
              className="relative rounded-full flex items-center justify-center shadow-md"
              style={{
                width: "56%",
                height: "56%",
                background:
                  "radial-gradient(circle at 40% 40%, #8d4f24 0%, #5a2e12 60%, #301605 100%)",
                border: "1px solid rgba(0,0,0,0.35)",
              }}
            >
              {/* Deep Black Pupil */}
              <div
                className="rounded-full bg-[#110e0c] shadow-inner"
                style={{
                  width: "48%",
                  height: "48%",
                }}
              />

              {/* Specular White Primary Highlight */}
              <div
                className="absolute rounded-full bg-white/95 shadow-sm"
                style={{
                  width: "22%",
                  height: "22%",
                  top: "18%",
                  left: "20%",
                }}
              />
              {/* Secondary Specular Sparkle */}
              <div
                className="absolute rounded-full bg-white/70"
                style={{
                  width: "11%",
                  height: "11%",
                  bottom: "24%",
                  right: "24%",
                }}
              />
            </div>
          </div>

          {/* Upper Eyelid for Blinking & Expressions */}
          <div
            className="absolute inset-0 bg-[#f5cb18] transition-transform duration-100 pointer-events-none"
            style={{
              transform: isBlinking
                ? "scaleY(1)"
                : `scaleY(${eyelidAmount})`,
              transformOrigin: "top center",
            }}
          />
        </div>

        {/* 4. Minion Frame (Body, Goggle, Overalls, Gloves) */}
        <img
          src="/minion_frame.png"
          alt="HireMind AI Character"
          className="relative z-10 w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]"
          draggable={false}
        />

        {/* 5. Goggle Glass Specular Shine Overlay */}
        <div
          className="absolute pointer-events-none z-20 rounded-full"
          style={{
            left: "40.3%",
            top: "26.3%",
            width: "27.1%",
            height: "22.1%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 45%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}
