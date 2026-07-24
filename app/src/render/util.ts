// Shared render helpers.

import type { WFNode } from "../types";

export function modClasses(n: WFNode): string {
  // Return style-only modifiers that stay in CSS
  return (n.mods || [])
    .filter((m) => ["solid", "shaded", "placeholder"].includes(m))
    .map((m) => "wf-" + m)
    .join(" ");
}

export function layoutClasses(n: WFNode): string {
  // Convert layout/spacing/flex modifiers to Tailwind classes
  const classes: string[] = [];
  
  if (n.mods) {
    for (const m of n.mods) {
      if (m === "compact") classes.push("gap-1.5");
      else if (m === "loose") classes.push("gap-5");
      else if (m === "end") classes.push("justify-end");
      else if (m === "center") classes.push("justify-center");
      else if (m === "between") classes.push("justify-between");
      else if (m === "middle") classes.push("items-center");
      else if (m === "narrow") classes.push("flex-none");
      else if (m === "tall") classes.push("min-h-[120px]");
      else if (m === "taller") classes.push("min-h-[200px]");
    }
  }
  
  return classes.join(" ");
}
