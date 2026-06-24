import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Splatter {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  pathIndex: number;
}

// Hand-drawn SVG ink splatters/brush droplets
const SPLATTER_PATHS = [
  // Classic irregular splatter
  "M 25 25 C 20 10, 10 20, 5 25 C 1 29, 3 35, 12 37 C 20 39, 32 45, 38 40 C 44 35, 40 25, 32 20 C 28 17, 27 12, 25 25 Z M 45 15 C 47 13, 49 13, 49 15 C 49 17, 47 19, 45 15 Z M 10 45 C 8 47, 6 47, 5 45 C 4 43, 6 41, 10 45 Z M 15 8 C 17 6, 19 6, 19 8 C 19 10, 17 12, 15 8 Z",
  // Brush swipe/splat
  "M 10 25 C 18 18, 30 15, 42 12 C 46 11, 48 14, 45 18 C 40 25, 30 35, 15 42 C 11 44, 8 41, 10 25 Z M 48 35 C 50 34, 52 35, 52 37 C 52 39, 50 40, 48 35 Z M 5 15 C 4 17, 3 17, 2 15 C 1 13, 3 11, 5 15 Z",
  // Heavy circular dot with drips
  "M 25 5 C 36 5, 45 14, 45 25 C 45 36, 36 45, 25 45 C 14 45, 5 36, 5 25 C 5 14, 14 5, 25 5 Z M 22 45 C 22 48, 20 50, 19 48 C 18 46, 20 44, 22 45 Z M 32 43 C 33 46, 34 49, 33 50 C 32 51, 31 48, 32 43 Z M 8 28 C 6 30, 4 30, 4 28 C 4 26, 6 25, 8 28 Z",
  // Elongated droplet splatter
  "M 25 20 C 35 15, 45 5, 47 6 C 49 7, 42 18, 35 28 C 30 35, 25 45, 22 45 C 19 45, 15 35, 25 20 Z M 12 12 C 10 14, 8 14, 8 12 C 8 10, 10 8, 12 12 Z M 38 42 C 39 44, 40 45, 39 46 C 38 47, 37 45, 38 42 Z",
  // Multi-splat galaxy of ink
  "M 20 20 C 23 17, 27 17, 30 20 C 33 23, 33 27, 30 30 C 27 33, 23 33, 20 30 C 17 27, 17 23, 20 20 Z M 40 10 C 42 12, 42 14, 40 16 C 38 18, 36 18, 36 16 C 36 14, 38 12, 40 10 Z M 12 38 C 14 40, 14 42, 12 44 C 10 46, 8 46, 8 44 C 8 42, 10 40, 12 38 Z M 42 42 C 43 43, 44 44, 43 45 C 42 46, 41 45, 42 42 Z"
];

export function SumiCanvas() {
  const [splatters, setSplatters] = useState<Splatter[]>([]);

  // Add initial subtle splatters on load for aesthetic background framing
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const initial: Splatter[] = [
      { id: 1, x: width * 0.1, y: height * 0.2, size: 80, rotation: 45, pathIndex: 0 },
      { id: 2, x: width * 0.85, y: height * 0.15, size: 110, rotation: 120, pathIndex: 4 },
      { id: 3, x: width * 0.15, y: height * 0.75, size: 95, rotation: -30, pathIndex: 2 },
      { id: 4, x: width * 0.9, y: height * 0.8, size: 70, rotation: 85, pathIndex: 1 }
    ];
    setSplatters(initial);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger if clicking exactly the container, so we don't disrupt button/input interactions
    if (e.target !== e.currentTarget) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Randomize size, rotation, path index
    const size = Math.floor(Math.random() * 80) + 40; // 40px to 120px
    const rotation = Math.floor(Math.random() * 360);
    const pathIndex = Math.floor(Math.random() * SPLATTER_PATHS.length);

    const newSplatter: Splatter = {
      id: Date.now(),
      x,
      y,
      size,
      rotation,
      pathIndex
    };

    // Limit active click-splatters to 15 to keep DOM clean and lightweight
    setSplatters((prev) => [...prev.slice(-14), newSplatter]);
  };

  const clearCanvas = () => {
    setSplatters([]);
  };

  return (
    <div
      id="sumi-canvas-container"
      onClick={handleCanvasClick}
      className="absolute inset-0 cursor-crosshair overflow-hidden select-none"
      title="Click on the background to splatter sumi ink"
    >
      {/* Interactive visual helper in corner */}
      <div className="absolute top-4 right-16 z-20 hidden md:flex items-center space-x-2 text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 bg-white/40 dark:bg-black/40 backdrop-blur-xs py-1 px-2 border border-neutral-200/50 dark:border-neutral-800/50 rounded-sm">
        <span>[ CLICK BG TO SPLATTER INK ]</span>
        {splatters.length > 4 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearCanvas();
            }}
            className="text-red-600 dark:text-red-400 hover:underline cursor-pointer ml-2"
          >
            CLEAR
          </button>
        )}
      </div>

      <AnimatePresence>
        {splatters.map((splatter) => {
          const path = SPLATTER_PATHS[splatter.pathIndex];
          return (
            <motion.div
              key={splatter.id}
              initial={{ scale: 0, opacity: 0, rotate: splatter.rotation - 15 }}
              animate={{
                scale: 1,
                opacity: 0.15, // Keep it soft as an elegant background watermark
                rotate: splatter.rotation,
                transition: { type: "spring", damping: 15, stiffness: 80 }
              }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 1.5 } }}
              style={{
                position: "absolute",
                left: splatter.x - splatter.size / 2,
                top: splatter.y - splatter.size / 2,
                width: splatter.size,
                height: splatter.size,
                pointerEvents: "none",
              }}
            >
              <svg
                viewBox="0 0 50 50"
                className="w-full h-full fill-neutral-900 dark:fill-neutral-100 transition-colors duration-500"
              >
                <path d={path} />
              </svg>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
