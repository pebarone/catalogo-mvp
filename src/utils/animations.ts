import type { Transition, Variants } from 'motion/react';

/**
 * iOS-like Spring Physics
 * Based on Apple's HIG and common SwiftUI spring defaults.
 * 
 * stiffness: 500 - Snappy but not too jarring
 * damping: 30 - No bounce, just smooth landing
 * mass: 1 - Standard weight
 */
export const iosSpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 1
};

/**
 * Smooth enter/exit transition for modals and drawers
 */
export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1] // Custom ease curve (easeOutCubic-ish)
};

export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 10
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: iosSpring
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 } 
  }
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.4 } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2 } 
  }
};

export const slideUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: iosSpring
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.2 } 
  }
};
