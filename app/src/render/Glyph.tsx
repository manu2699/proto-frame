// Monochrome line-art placeholders per `kind`. No color, no real data — just a
// recognizable grey shape so a region reads as its type. All strokes use the
// wireframe ink/line vars via currentColor (set by .wf-glyph in CSS).

import type { ReactNode } from "react";
import type { Kind, Mod } from "../types";

const S = (children: ReactNode, sizeClass: string = "w-16 h-10") => (
  <svg className={`wf-glyph-svg block ${sizeClass}`} viewBox="0 0 64 40" fill="none" stroke="currentColor"
       strokeWidth="1.5" aria-hidden="true">{children}</svg>
);

const glyphs: Partial<Record<Kind, (sizeClass?: string) => ReactNode>> = {
  "chart:donut": (sz) =>
    S(<>
      <circle cx="32" cy="20" r="13" strokeOpacity="0.35" />
      <path d="M32 7 a13 13 0 0 1 11.3 19.5" strokeWidth="3.5" />
      <circle cx="32" cy="20" r="6" strokeOpacity="0.35" />
    </>, sz),
  "chart:line": (sz) =>
    S(<>
      <path d="M6 30 L20 18 L32 24 L44 10 L58 16" />
      <line x1="6" y1="34" x2="58" y2="34" strokeOpacity="0.3" />
    </>, sz),
  "chart:bars": (sz) =>
    S(<>
      <rect x="10" y="18" width="8" height="14" strokeOpacity="0.5" />
      <rect x="24" y="10" width="8" height="22" strokeOpacity="0.5" />
      <rect x="38" y="22" width="8" height="10" strokeOpacity="0.5" />
      <line x1="6" y1="34" x2="58" y2="34" strokeOpacity="0.3" />
    </>, sz),
  kpi: (sz) =>
    S(<>
      <line x1="12" y1="12" x2="30" y2="12" strokeOpacity="0.4" />
      <line x1="12" y1="22" x2="44" y2="22" strokeWidth="4" />
      <line x1="12" y1="31" x2="24" y2="31" strokeOpacity="0.4" />
    </>, sz),
  stat: (sz) =>
    S(<>
      <line x1="12" y1="14" x2="40" y2="14" strokeWidth="3.5" />
      <line x1="12" y1="26" x2="28" y2="26" strokeOpacity="0.4" />
    </>, sz),
  card: (sz) =>
    S(<>
      <rect x="10" y="8" width="44" height="24" rx="2" strokeOpacity="0.4" />
      <line x1="16" y1="16" x2="40" y2="16" strokeOpacity="0.5" />
      <line x1="16" y1="23" x2="32" y2="23" strokeOpacity="0.35" />
    </>, sz),
  list: (sz) =>
    S(<>
      <circle cx="12" cy="12" r="1.5" /><line x1="18" y1="12" x2="50" y2="12" strokeOpacity="0.4" />
      <circle cx="12" cy="20" r="1.5" /><line x1="18" y1="20" x2="50" y2="20" strokeOpacity="0.4" />
      <circle cx="12" cy="28" r="1.5" /><line x1="18" y1="28" x2="50" y2="28" strokeOpacity="0.4" />
    </>, sz),
  form: (sz) =>
    S(<>
      <rect x="10" y="9" width="44" height="8" rx="2" strokeOpacity="0.4" />
      <rect x="10" y="23" width="44" height="8" rx="2" strokeOpacity="0.4" />
    </>, sz),
  button: (sz) =>
    S(<rect x="16" y="13" width="32" height="14" rx="3" strokeOpacity="0.6" />, sz),
  tabs: (sz) =>
    S(<>
      <line x1="10" y1="14" x2="22" y2="14" strokeWidth="2.5" />
      <line x1="26" y1="14" x2="38" y2="14" strokeOpacity="0.35" />
      <line x1="42" y1="14" x2="54" y2="14" strokeOpacity="0.35" />
      <line x1="10" y1="18" x2="54" y2="18" strokeOpacity="0.25" />
    </>, sz),
  avatar: (sz) =>
    S(<>
      <circle cx="32" cy="16" r="6" strokeOpacity="0.5" />
      <path d="M22 32 a10 10 0 0 1 20 0" strokeOpacity="0.5" />
    </>, sz),
  image: (sz) =>
    S(<>
      <rect x="12" y="9" width="40" height="22" rx="2" strokeOpacity="0.4" />
      <circle cx="22" cy="17" r="2.5" strokeOpacity="0.5" />
      <path d="M14 29 L26 20 L34 26 L42 18 L50 25" strokeOpacity="0.5" />
    </>, sz),
  table: () => null, // tables render their own grid, not a glyph
  flowgraph: (sz) =>
    S(<>
      <rect x="6" y="16" width="14" height="10" rx="1.5" strokeOpacity="0.5" />
      <rect x="27" y="4" width="14" height="10" rx="1.5" strokeOpacity="0.5" />
      <rect x="27" y="26" width="14" height="10" rx="1.5" strokeOpacity="0.5" />
      <path d="M20 19 L27 11" strokeOpacity="0.5" />
      <path d="M25.5 12.5 l1.5 -1.5 l0.3 2" strokeOpacity="0.5" />
      <path d="M20 23 L27 29" strokeOpacity="0.5" />
      <path d="M25.5 27 l1.5 2 l-2 -0.3" strokeOpacity="0.5" />
      <path d="M41 9 L52 20" strokeOpacity="0.5" />
      <path d="M49 19.5 l3 0.5 l-1.5 2" strokeOpacity="0.5" />
    </>, sz),
  search: (sz) =>
    S(<>
      <circle cx="28" cy="17" r="6" strokeOpacity="0.5" />
      <line x1="32.5" y1="21.5" x2="40" y2="29" strokeOpacity="0.5" />
    </>, sz),
  breadcrumb: (sz) =>
    S(<>
      <line x1="10" y1="20" x2="20" y2="20" strokeOpacity="0.3" />
      <path d="M23 18 l2 2 -2 2" strokeOpacity="0.5" />
      <line x1="28" y1="20" x2="38" y2="20" strokeOpacity="0.3" />
      <path d="M41 18 l2 2 -2 2" strokeOpacity="0.5" />
      <line x1="46" y1="20" x2="54" y2="20" strokeOpacity="0.5" />
    </>, sz),
  stepper: (sz) =>
    S(<>
      <circle cx="16" cy="20" r="3.5" strokeOpacity="0.5" />
      <line x1="19.5" y1="20" x2="28.5" y2="20" strokeOpacity="0.3" />
      <circle cx="32" cy="20" r="3.5" strokeOpacity="0.5" />
      <line x1="35.5" y1="20" x2="44.5" y2="20" strokeOpacity="0.3" />
      <circle cx="48" cy="20" r="3.5" strokeOpacity="0.3" />
    </>, sz),
  accordion: (sz) =>
    S(<>
      <rect x="10" y="8" width="44" height="6" rx="1" strokeOpacity="0.4" />
      <path d="M48 10 l2 2 -2 2" strokeOpacity="0.5" />
      <rect x="10" y="17" width="44" height="6" rx="1" strokeOpacity="0.4" />
      <path d="M48 19 l2 2 -2 2" strokeOpacity="0.5" />
      <rect x="10" y="26" width="44" height="6" rx="1" strokeOpacity="0.4" />
      <path d="M48 28 l2 2 -2 2" strokeOpacity="0.5" />
    </>, sz),
  sidebar: (sz) =>
    S(<>
      <rect x="10" y="6" width="44" height="28" rx="2" strokeOpacity="0.4" />
      <line x1="22" y1="6" x2="22" y2="34" strokeOpacity="0.4" />
      <line x1="14" y1="12" x2="18" y2="12" strokeOpacity="0.5" />
      <line x1="14" y1="18" x2="18" y2="18" strokeOpacity="0.5" />
      <line x1="14" y1="24" x2="18" y2="24" strokeOpacity="0.5" />
    </>, sz),
  pagination: (sz) =>
    S(<>
      <rect x="12" y="14" width="8" height="12" rx="1" strokeOpacity="0.4" />
      <rect x="22" y="14" width="8" height="12" rx="1" strokeOpacity="0.4" />
      <rect x="32" y="14" width="10" height="12" rx="1" strokeOpacity="0.6" strokeWidth="2" />
      <rect x="44" y="14" width="8" height="12" rx="1" strokeOpacity="0.4" />
    </>, sz),
  timeline: (sz) =>
    S(<>
      <line x1="16" y1="6" x2="16" y2="34" strokeOpacity="0.3" />
      <circle cx="16" cy="12" r="2" strokeOpacity="0.5" />
      <line x1="22" y1="12" x2="48" y2="12" strokeOpacity="0.4" />
      <circle cx="16" cy="20" r="2" strokeOpacity="0.5" />
      <line x1="22" y1="20" x2="40" y2="20" strokeOpacity="0.4" />
      <circle cx="16" cy="28" r="2" strokeOpacity="0.5" />
      <line x1="22" y1="28" x2="44" y2="28" strokeOpacity="0.4" />
    </>, sz),
  progress: (sz) =>
    S(<>
      <rect x="10" y="17" width="44" height="6" rx="3" strokeOpacity="0.4" />
      <path d="M13 20 h20" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
    </>, sz),
  badge: (sz) =>
    S(<rect x="18" y="13" width="28" height="14" rx="7" strokeOpacity="0.5" />, sz),
  rating: (sz) =>
    S(<>
      <polygon points="16,15 19,21 13,17 7,21 10,15 5,11 11,11 13,5 15,11 21,11" transform="scale(0.5) translate(6, 10)" strokeOpacity="0.5" />
      <polygon points="16,15 19,21 13,17 7,21 10,15 5,11 11,11 13,5 15,11 21,11" transform="scale(0.5) translate(28, 10)" strokeOpacity="0.5" />
      <polygon points="16,15 19,21 13,17 7,21 10,15 5,11 11,11 13,5 15,11 21,11" transform="scale(0.5) translate(50, 10)" strokeOpacity="0.5" />
    </>, sz),
  toggle: (sz) =>
    S(<>
      <rect x="16" y="13" width="32" height="14" rx="7" strokeOpacity="0.4" />
      <circle cx="39" cy="20" r="4" strokeOpacity="0.6" />
    </>, sz),
  slider: (sz) =>
    S(<>
      <line x1="10" y1="20" x2="54" y2="20" strokeOpacity="0.4" />
      <circle cx="28" cy="20" r="4.5" strokeOpacity="0.6" />
    </>, sz),
  datepicker: (sz) =>
    S(<>
      <rect x="16" y="9" width="32" height="22" rx="2" strokeOpacity="0.4" />
      <line x1="16" y1="16" x2="48" y2="16" strokeOpacity="0.4" />
      <line x1="24" y1="7" x2="24" y2="11" strokeOpacity="0.5" />
      <line x1="40" y1="7" x2="40" y2="11" strokeOpacity="0.5" />
    </>, sz),
  upload: (sz) =>
    S(<>
      <path d="M22 14h-.5c-.2-2-.2-3.8-2.2-3.8-1.5 0-2.8 1-3.2 2.5-1.5.2-2.5 1.5-2.5 3C13.6 17.5 15 19 17 19h5c1.5 0 2.8-1.2 2.8-2.8s-1.3-2.8-2.8-2.8z" strokeOpacity="0.5" />
      <path d="M19.5 15v4M17.5 17l2-2 2 2" strokeOpacity="0.5" />
      <rect x="10" y="6" width="44" height="28" rx="2" strokeDasharray="3 3" strokeOpacity="0.4" />
    </>, sz),
  select: (sz) =>
    S(<>
      <rect x="10" y="13" width="44" height="14" rx="2" strokeOpacity="0.5" />
      <path d="M46 19 l2 2 -2 2" transform="rotate(90 48 20)" strokeOpacity="0.6" />
      <line x1="40" y1="14" x2="40" y2="26" strokeOpacity="0.25" />
    </>, sz),
  "radio-group": (sz) =>
    S(<>
      <circle cx="16" cy="12" r="3" strokeOpacity="0.5" />
      <circle cx="16" cy="12" r="1" fill="currentColor" strokeWidth="0" />
      <line x1="24" y1="12" x2="48" y2="12" strokeOpacity="0.4" />
      <circle cx="16" cy="20" r="3" strokeOpacity="0.5" />
      <line x1="24" y1="20" x2="48" y2="20" strokeOpacity="0.4" />
      <circle cx="16" cy="28" r="3" strokeOpacity="0.5" />
      <line x1="24" y1="28" x2="48" y2="28" strokeOpacity="0.4" />
    </>, sz),
  "checkbox-group": (sz) =>
    S(<>
      <rect x="13" y="9" width="6" height="6" rx="1" strokeOpacity="0.5" />
      <path d="M14 12 l1.5 1.5 L18 10.5" strokeOpacity="0.6" />
      <line x1="24" y1="12" x2="48" y2="12" strokeOpacity="0.4" />
      <rect x="13" y="17" width="6" height="6" rx="1" strokeOpacity="0.5" />
      <line x1="24" y1="20" x2="48" y2="20" strokeOpacity="0.4" />
      <rect x="13" y="25" width="6" height="6" rx="1" strokeOpacity="0.5" />
      <line x1="24" y1="28" x2="48" y2="28" strokeOpacity="0.4" />
    </>, sz),
  alert: (sz) =>
    S(<>
      <rect x="10" y="11" width="44" height="18" rx="2" strokeOpacity="0.5" />
      <line x1="17" y1="17" x2="17" y2="21" strokeOpacity="0.6" />
      <circle cx="17" cy="24" r="0.5" fill="currentColor" strokeWidth="0" />
      <line x1="24" y1="20" x2="46" y2="20" strokeOpacity="0.4" />
    </>, sz),
  modal: (sz) =>
    S(<>
      <rect x="12" y="8" width="40" height="24" rx="2" strokeOpacity="0.5" />
      <line x1="12" y1="14" x2="52" y2="14" strokeOpacity="0.5" />
      <circle cx="47" cy="11" r="1" strokeOpacity="0.5" />
    </>, sz),
  "notification-list": (sz) =>
    S(<>
      <circle cx="14" cy="12" r="1.5" fill="currentColor" strokeWidth="0" strokeOpacity="0.6" />
      <line x1="20" y1="12" x2="50" y2="12" strokeOpacity="0.4" />
      <line x1="20" y1="20" x2="46" y2="20" strokeOpacity="0.3" />
      <line x1="20" y1="28" x2="42" y2="28" strokeOpacity="0.3" />
    </>, sz),
  "chat-window": (sz) =>
    S(<>
      <rect x="8" y="8" width="28" height="16" rx="2" strokeOpacity="0.5" />
      <path d="M12 24 l0 4 4 -4" strokeOpacity="0.5" />
      <rect x="28" y="16" width="28" height="16" rx="2" strokeOpacity="0.4" />
      <path d="M48 32 l0 4 -4 -4" strokeOpacity="0.4" />
    </>, sz),
};

export function Glyph(props: { kind?: Kind; mods?: Mod[] }) {
  const fn = props.kind ? glyphs[props.kind] : undefined;
  if (!fn) return null;

  // Calculate size classes for SVG based on mods
  let sizeClass = "w-16 h-10"; // default 64x40
  if (props.mods?.includes("tall")) {
    sizeClass = "w-24 h-[60px]"; // 96x60
  } else if (props.mods?.includes("taller")) {
    sizeClass = "w-32 h-20"; // 128x80
  }

  return <span className="wf-glyph block leading-[0]">{fn(sizeClass)}</span>;
}
