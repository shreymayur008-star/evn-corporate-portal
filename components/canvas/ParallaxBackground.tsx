"use client";

import { useScroll, useTransform, motion, animate } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ParallaxBackground() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  // Ken Burns: infinite slow scale pulse
  const scaleRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!scaleRef.current) return;
    const controls = animate(scaleRef.current, { scale: [1, 1.08, 1] }, {
      duration: 20,
      ease: "easeInOut",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, []);

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-[130%] top-[-15%]">
        <div ref={scaleRef} className="relative w-full h-full">
          {!imgError ? (
            <Image
              src="/bg/facility.jpg"
              alt=""
              fill
              priority
              quality={90}
              className="object-cover object-center"
              onError={() => setImgError(true)}
            />
          ) : (
            // Fallback: deep void with subtle radial texture
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 120% 80% at 50% 40%, rgba(15,15,30,1) 0%, #020617 60%)",
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Bottom-up obsidian dissolve — only the bottom third goes fully dark */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />

      {/* Top vignette — minimal, just enough to keep nav text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 to-transparent" />

      {/* Lateral vignettes — very subtle */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/20 via-transparent to-[#020617]/20" />
    </div>
  );
}
