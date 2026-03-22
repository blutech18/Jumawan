"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  /** If true, uses stagger container variant instead of single item */
  stagger?: boolean;
  staggerDelay?: number;
}

const getVariants = (
  direction: RevealDirection,
  distance: number,
  duration: number
): Variants => {
  const axis: Record<RevealDirection, { x?: number; y?: number }> = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    fade: {},
  };

  return {
    hidden: {
      opacity: 0,
      ...axis[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 40,
  className,
  once = true,
  amount = 0.15,
  stagger = false,
  staggerDelay,
}: ScrollRevealProps) {
  if (stagger) {
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay ?? 0.1,
          delayChildren: delay,
        },
      },
    };

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        variants={containerVariants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  const variants = getVariants(direction, distance, duration);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Child item for use inside a stagger ScrollReveal container */
export function ScrollRevealItem({
  children,
  direction = "up",
  distance = 30,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  className?: string;
}) {
  const variants = getVariants(direction, distance, duration);

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
