import React from "react";
import { motion } from "motion/react";

interface BambooFrameProps {
  children: React.ReactNode;
  className?: string;
  isFeatured?: boolean;
}

export function BambooFrame({ children, className = "", isFeatured = false }: BambooFrameProps) {
  return (
    <div className={`relative group p-[3px] border border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-950 dark:hover:border-neutral-100 bg-white dark:bg-black transition-all duration-500 ${className}`}>
      {/* Decorative SVG Outer Borders: Brush feeling */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* Soft, hand-drawn vector border line around the card */}
        <motion.path
          d="M 2 2 L 98 2 L 98 98 L 2 98 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="200"
          initial={{ strokeDashoffset: 200 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="text-neutral-300 dark:text-neutral-800 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-500"
        />

        {/* Ink splatter corners */}
        <circle cx="2" cy="2" r="1.5" className="fill-neutral-900 dark:fill-neutral-100 opacity-20 group-hover:opacity-60 transition-opacity duration-300" />
        <circle cx="98" cy="2" r="1.2" className="fill-neutral-900 dark:fill-neutral-100 opacity-20 group-hover:opacity-60 transition-opacity duration-300" />
        <circle cx="98" cy="98" r="1.8" className="fill-neutral-900 dark:fill-neutral-100 opacity-20 group-hover:opacity-60 transition-opacity duration-300" />
        <circle cx="2" cy="98" r="1" className="fill-neutral-900 dark:fill-neutral-100 opacity-20 group-hover:opacity-60 transition-opacity duration-300" />
      </svg>

      {/* Stylized Bamboo Corner Shoots */}
      {/* Top Left Bamboo branch */}
      <div className="absolute top-0 left-0 -translate-x-1.5 -translate-y-1.5 w-12 h-12 pointer-events-none z-10 select-none opacity-40 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500 origin-top-left text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 50 50" className="w-full h-full fill-current">
          {/* Main stalk */}
          <path d="M 5 2 C 8 8, 12 18, 15 28 C 16 31, 14 33, 12 32 C 10 31, 11 25, 10 20 C 8 15, 4 8, 2 2 C 1 0, 3 0, 5 2 Z" />
          {/* Node ring */}
          <ellipse cx="10" cy="15" rx="2" ry="0.6" transform="rotate(30 10 15)" />
          {/* Bamboo Leaf 1 */}
          <path d="M 10 15 C 18 13, 28 10, 35 15 C 28 18, 18 18, 10 15 Z" className="origin-left" />
          {/* Bamboo Leaf 2 */}
          <path d="M 12 20 C 22 22, 32 28, 38 38 C 28 35, 20 28, 12 20 Z" />
        </svg>
      </div>

      {/* Bottom Right Bamboo stalk and leaves */}
      <div className="absolute bottom-0 right-0 translate-x-2 translate-y-2 w-16 h-16 pointer-events-none z-10 select-none opacity-45 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500 origin-bottom-right text-neutral-800 dark:text-neutral-200">
        <svg viewBox="0 0 50 50" className="w-full h-full fill-current">
          {/* Main stalk growing upward */}
          <path d="M 45 45 C 40 35, 38 22, 35 10 C 34 7, 36 5, 38 6 C 40 7, 39 12, 41 18 C 43 25, 46 38, 48 48 C 49 50, 47 50, 45 45 Z" />
          {/* Node ring */}
          <ellipse cx="38" cy="22" rx="3" ry="0.8" transform="rotate(-15 38 22)" />
          {/* Stiff sword-like bamboo leaf 1 */}
          <path d="M 38 22 C 28 20, 15 15, 5 8 C 14 12, 28 16, 38 22 Z" />
          {/* Leaf 2 */}
          <path d="M 37 25 C 25 28, 12 32, 2 34 C 12 32, 25 30, 37 25 Z" />
          {/* Leaf 3 */}
          <path d="M 39 18 C 32 10, 25 4, 18 1 C 24 6, 32 12, 39 18 Z" />
        </svg>
      </div>

      {/* Additional aesthetic node for featured frames */}
      {isFeatured && (
        <div className="absolute top-1/2 right-0 translate-x-2 w-6 h-16 pointer-events-none z-10 select-none opacity-40 group-hover:opacity-90 transition-all duration-500 text-neutral-800 dark:text-neutral-200">
          <svg viewBox="0 0 20 50" className="w-full h-full fill-current">
            {/* Stalk segment */}
            <path d="M 10 5 C 9 18, 9 32, 10 45" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M 10 25 C 5 22, 1 18, 0 15 C 4 19, 8 22, 10 25 Z" />
          </svg>
        </div>
      )}

      {/* Inner Card Content */}
      <div className="relative bg-white dark:bg-black p-6 md:p-8 border border-neutral-150 dark:border-neutral-900 group-hover:border-neutral-950 dark:group-hover:border-neutral-100 transition-colors duration-500 overflow-hidden h-full flex flex-col justify-between">
        {/* Sumi brush-stroke accent in background of card (very faint) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/2 pointer-events-none opacity-[0.015] dark:opacity-[0.025] select-none transition-transform duration-700 group-hover:scale-110">
          <svg viewBox="0 0 100 50" className="w-full h-full fill-neutral-900 dark:fill-neutral-100">
            <path d="M 5 25 Q 25 5, 50 25 T 95 25 Q 75 45, 50 25 T 5 25" />
          </svg>
        </div>

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
