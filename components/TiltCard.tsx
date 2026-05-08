"use client";

import { useRef, useState } from "react";

export function TiltCard({
  children,
  className,
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spot, setSpot] = useState({ x: 0, y: 0, opacity: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    setTilt({ x: (ny - 0.5) * -10, y: (nx - 0.5) * 10 });
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, opacity: 1 });
  };

  const onLeave = () => {
    setTilt({ x: 0, y: 0 });
    setSpot((s) => ({ ...s, opacity: 0 }));
  };

  const isResting = tilt.x === 0 && tilt.y === 0;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className={`relative overflow-hidden cursor-pointer select-none ${className ?? ""}`}
    >
      {/* 3D tilt frame — pointer-events:none so hit region stays flat */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isResting ? "transform 0.6s cubic-bezier(0.23,1,0.32,1)" : "transform 0.08s ease",
          willChange: "transform", pointerEvents: "none", backfaceVisibility: "hidden", zIndex: 0,
        }}
      />
      {/* Radial orange spotlight */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, opacity: spot.opacity,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(260px circle at ${spot.x}px ${spot.y}px, rgba(249,115,22,0.13), transparent 70%)`,
          zIndex: 1, pointerEvents: "none",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
