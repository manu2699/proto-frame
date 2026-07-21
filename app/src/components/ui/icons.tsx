// Animated inline icon set using motion/react.
// Provides smooth, copy-paste ready micro-animations on hover.

import { motion } from "motion/react";

// Every call site only ever passes className — several SVG presentation
// attributes (values, onAnimationStart, ...) collide with motion's own props
// of the same name but different shape, so there's no clean way to extend
// SVGProps here. Keep the surface to what's actually used.
type IconProps = { className?: string };

export const X = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.path
      d="M18 6 6 18"
      variants={{
        normal: { opacity: 1, pathLength: 1 },
        animate: { opacity: [0, 1], pathLength: [0, 1] }
      }}
      transition={{ duration: 0.4 }}
    />
    <motion.path
      d="m6 6 12 12"
      variants={{
        normal: { opacity: 1, pathLength: 1 },
        animate: { opacity: [0, 1], pathLength: [0, 1] }
      }}
      transition={{ delay: 0.1, duration: 0.4 }}
    />
  </motion.svg>
);

export const Check = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.path
      d="M20 6 9 17l-5-5"
      variants={{
        normal: { opacity: 1, pathLength: 1, scale: 1 },
        animate: { opacity: [0, 1], pathLength: [0, 1], scale: [0.5, 1] }
      }}
      transition={{ duration: 0.4 }}
      style={{ transformOrigin: "center" }}
    />
  </motion.svg>
);

export const Moon = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.path
      d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
      variants={{
        normal: { rotate: 0 },
        animate: { rotate: [0, -10, 10, -5, 5, 0] },
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{ transformOrigin: "center" }}
    />
  </motion.svg>
);

export const Sun = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.circle
      cx="12"
      cy="12"
      r="4"
      variants={{
        normal: { scale: 1 },
        animate: { scale: [1, 1.1, 1] }
      }}
      transition={{ duration: 0.5 }}
      style={{ transformOrigin: "center" }}
    />
    {[
      "M12 2v2",
      "m19.07 4.93-1.41 1.41",
      "M20 12h2",
      "m17.66 17.66 1.41 1.41",
      "M12 20v2",
      "m6.34 17.66-1.41 1.41",
      "M2 12h2",
      "m4.93 4.93 1.41 1.41",
    ].map((d, i) => (
      <motion.path
        key={d}
        d={d}
        variants={{
          normal: { opacity: 1 },
          animate: { opacity: [0, 1] }
        }}
        transition={{ delay: i * 0.05, duration: 0.2 }}
      />
    ))}
  </motion.svg>
);

export const PanelRightClose = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
    <motion.path
      d="m8 9 3 3-3 3"
      variants={{
        normal: { x: 0 },
        animate: { x: [0, 1.5, 0] }
      }}
      transition={{ times: [0, 0.4, 1], duration: 0.5 }}
    />
  </motion.svg>
);

export const PanelRightOpen = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
    <motion.path
      d="m10 15-3-3 3-3"
      variants={{
        normal: { x: 0 },
        animate: { x: [0, -1.5, 0] }
      }}
      transition={{ times: [0, 0.4, 1], duration: 0.5 }}
    />
  </motion.svg>
);

export const MessageSquare = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      variants={{
        normal: { scale: 1, rotate: 0 },
        animate: {
          scale: 1.05,
          rotate: [0, -7, 7, 0],
        }
      }}
      transition={{
        rotate: { duration: 0.5, ease: "easeInOut" },
        scale: { type: "spring", stiffness: 400, damping: 10 }
      }}
      style={{ transformOrigin: "center" }}
    />
  </motion.svg>
);

export const Server = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <rect width="20" height="8" x="2" y="2" rx="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" />
    <motion.path
      d="M6 6h.01"
      variants={{
        normal: { opacity: 1 },
        animate: { opacity: [1, 0, 1] }
      }}
      transition={{ repeat: Infinity, duration: 0.8 }}
    />
    <motion.path
      d="M6 18h.01"
      variants={{
        normal: { opacity: 1 },
        animate: { opacity: [1, 0, 1] }
      }}
      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
    />
  </motion.svg>
);

export const Component = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.path
      d="M15.5 7.5 19 4l1.5 1.5L17 9z"
      variants={{
        normal: { x: 0, y: 0 },
        animate: { x: [0, 1.5, 0], y: [0, -1.5, 0] }
      }}
      transition={{ duration: 0.6 }}
    />
    <motion.path
      d="m12 12 3.5-3.5"
      variants={{
        normal: { x: 0, y: 0 },
        animate: { x: [0, 0.75, 0], y: [0, -0.75, 0] }
      }}
      transition={{ duration: 0.6 }}
    />
    <motion.rect
      width="7"
      height="7"
      x="3"
      y="3"
      rx="1"
      variants={{
        normal: { x: 0, y: 0 },
        animate: { x: [0, -1.5, 0], y: [0, -1.5, 0] }
      }}
      transition={{ duration: 0.6 }}
    />
    <motion.rect
      width="7"
      height="7"
      x="14"
      y="14"
      rx="1"
      variants={{
        normal: { x: 0, y: 0 },
        animate: { x: [0, 1.5, 0], y: [0, 1.5, 0] }
      }}
      transition={{ duration: 0.6 }}
    />
    <motion.rect
      width="7"
      height="7"
      x="3"
      y="14"
      rx="1"
      variants={{
        normal: { x: 0, y: 0 },
        animate: { x: [0, -1.5, 0], y: [0, 1.5, 0] }
      }}
      transition={{ duration: 0.6 }}
    />
  </motion.svg>
);

export const Sparkle = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.g
      variants={{
        normal: { scale: 1, rotate: 0 },
        animate: { scale: [1, 1.15, 1], rotate: [0, 15, -15, 0] }
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{ transformOrigin: "center" }}
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m6.3 6.3 2.4 2.4" />
      <path d="m15.3 15.3 2.4 2.4" />
      <path d="m17.7 6.3-2.4 2.4" />
      <path d="m8.7 15.3-2.4 2.4" />
    </motion.g>
  </motion.svg>
);

export const Keyboard = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    {[
      { d: "M6 9h.01", delay: 0 },
      { d: "M10 9h.01", delay: 0.3 },
      { d: "M14 9h.01", delay: 0.1 },
      { d: "M18 9h.01", delay: 0.4 },
      { d: "M7 13h10", delay: 0.2 }
    ].map((key, i) => (
      <motion.path
        key={i}
        d={key.d}
        variants={{
          normal: { opacity: 1 },
          animate: { opacity: [1, 0.3, 1] }
        }}
        transition={{
          duration: 0.8,
          delay: key.delay,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
    ))}
  </motion.svg>
);

export const MousePointer = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.path
      d="m4 4 7.07 17 2.51-7.39L21 11.07z"
      variants={{
        normal: { x: 0, y: 0 },
        animate: {
          x: [0, 2, -1, 0],
          y: [0, 2, -1, 0]
        }
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    />
  </motion.svg>
);

export const Pencil = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.g
      variants={{
        normal: { rotate: 0, x: 0, y: 0 },
        animate: {
          rotate: [0, -8, 8, -4, 4, 0],
          x: [0, -1, 1, -0.5, 0.5, 0],
          y: [0, -1, 1, -0.5, 0.5, 0]
        }
      }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ transformOrigin: "left bottom" }}
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </motion.g>
  </motion.svg>
);

export const Square = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <motion.rect
      width="18"
      height="18"
      x="3"
      y="3"
      rx="2"
      variants={{
        normal: { scale: 1 },
        animate: { scale: [1, 1.04, 1] }
      }}
      transition={{ duration: 0.4 }}
      style={{ transformOrigin: "center" }}
    />
  </motion.svg>
);

export const Sliders = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    {/* Tracks */}
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />

    {/* Thumbs */}
    <motion.line
      x1="2"
      x2="6"
      y1="14"
      y2="14"
      variants={{
        normal: { y: 0 },
        animate: { y: [0, -3, 3, 0] }
      }}
      transition={{ type: "spring", stiffness: 150, damping: 10 }}
    />
    <motion.line
      x1="10"
      x2="14"
      y1="8"
      y2="8"
      variants={{
        normal: { y: 0 },
        animate: { y: [0, 4, -2, 0] }
      }}
      transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.1 }}
    />
    <motion.line
      x1="18"
      x2="22"
      y1="16"
      y2="16"
      variants={{
        normal: { y: 0 },
        animate: { y: [0, -4, 2, 0] }
      }}
      transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.05 }}
    />
  </motion.svg>
);

export const Info = (props: IconProps) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    whileHover="animate"
    initial="normal"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <motion.path
      d="M12 8h.01"
      variants={{
        normal: { y: 0 },
        animate: { y: [0, -2, 0] }
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </motion.svg>
);
