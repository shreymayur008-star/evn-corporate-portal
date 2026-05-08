"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalExperience() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let current = 0;
    intervalRef.current = setInterval(() => {
      const increment = Math.random() * 3.5 + 0.8;
      current = Math.min(current + increment, 100);
      setProgress(current);
      if (current >= 100 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 38);

    const timer = setTimeout(() => setLoading(false), 2800);
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{ y: "-100vh" }}
          transition={{ duration: 0.72, ease: [0.87, 0, 0.13, 1] }}
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center text-white overflow-hidden"
          style={{ background: "#020617" }}
        >
          {/* Ambient radial glow */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <div
              style={{
                width: 480,
                height: 480,
                background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
                borderRadius: "50%",
              }}
            />
          </div>

          {/* Glowing spinner stack */}
          <div className="relative flex items-center justify-center mb-10">
            <div
              className="absolute rounded-full animate-spin"
              style={{
                width: 112,
                height: 112,
                border: "2px solid transparent",
                borderTopColor: "#f97316",
                borderBottomColor: "#f97316",
                filter: "drop-shadow(0 0 10px #f97316)",
              }}
            />
            <div
              className="absolute rounded-full animate-spin-slow"
              style={{
                width: 80,
                height: 80,
                border: "1.5px solid transparent",
                borderRightColor: "rgba(249,115,22,0.35)",
                borderLeftColor: "rgba(249,115,22,0.35)",
                animationDirection: "reverse",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 48,
                height: 48,
                border: "1px solid rgba(249,115,22,0.15)",
              }}
            />
            <span
              className="font-black text-xl select-none"
              style={{ color: "#f97316", textShadow: "0 0 24px #f97316" }}
            >
              ⚡
            </span>
          </div>

          {/* Brand */}
          <h1
            className="font-black tracking-[0.45em] uppercase mb-2 text-3xl"
            style={{ color: "#f97316", textShadow: "0 0 32px rgba(249,115,22,0.55)" }}
          >
            VANTARA.GRID
          </h1>
          <p className="font-mono text-xs tracking-[0.25em] mb-10" style={{ color: "#475569" }}>
            SISTEMA INICIALIZADO — REDE NACIONAL
          </p>

          {/* Numerical counter */}
          <div
            className="font-black tabular-nums mb-6"
            style={{
              fontSize: 52,
              color: "#f97316",
              textShadow: "0 0 48px rgba(249,115,22,0.7)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}
          >
            {progress.toFixed(2)}%
          </div>

          {/* Progress track */}
          <div
            className="overflow-hidden rounded-full"
            style={{ width: 256, height: 2, background: "#1e293b" }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #f97316, #fb923c)",
                boxShadow: "0 0 12px #f97316",
                borderRadius: 9999,
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
