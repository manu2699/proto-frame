// Schema for the wireframe JSON model the agent authors.
// Monochrome, mid-fidelity: structure + IA + flow, never colors or real design.

export type Kind =
  | "kpi"
  | "stat"
  | "chart:donut"
  | "chart:pie"
  | "chart:line"
  | "chart:area"
  | "chart:bars"
  | "chart:gauge"
  | "card"
  | "table"
  | "list"
  | "form"
  | "heading"
  | "input"
  | "button"
  | "tabs"
  | "avatar"
  | "image"
  | "search"
  | "breadcrumb"
  | "stepper"
  | "accordion"
  | "sidebar"
  | "pagination"
  | "timeline"
  | "progress"
  | "badge"
  | "rating"
  | "toggle"
  | "slider"
  | "datepicker"
  | "upload"
  | "radio-group"
  | "checkbox-group"
  | "select"
  | "alert"
  | "modal"
  | "notification-list"
  | "chat-window"
  | "flowgraph";

export type Mod =
  | "tall"
  | "taller"
  | "placeholder"
  | "solid"
  | "shaded"
  | "end"
  | "center"
  | "between"
  | "middle"
  | "compact"
  | "loose"
  | "narrow";

export type NodeType =
  | "box"
  | "row"
  | "col"
  | "grid"
  | "table"
  | "nav"
  | "raw";

// A single navigation item inside an enumerated nav group.
export interface NavItem {
  text: string;
  active?: boolean;
  badge?: string | number;
  goto?: string;   // screenId to switch to on click
  opens?: string;  // modalId to open on click
  backend?: string;
  ds?: string;
}

export interface NavGroup {
  label?: string;     // section heading, e.g. "WORKFLOW"
  items: NavItem[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  target?: number;
}

export interface WFNode {
  type?: NodeType;      // B: omit → inferred as "box" by normalize
  _id?: string;         // stamped at render time by stampModel — not authored
  label?: string;
  // compact shorthands (C, A, G) — expanded by normalize before render
  row?: WFNode[];       // C: shorthand for {type:"row", children:[...]}
  col?: WFNode[];       // C: shorthand for {type:"col", children:[...]}
  $ref?: string;        // A: reference to shared fragment
  new?: boolean;        // G: marks element added by this feature
  changed?: boolean;    // G: marks element changed by this feature
  kind?: Kind;
  mods?: Mod[];
  cols?: number;            // grid: --cols
  children?: WFNode[];

  // table
  headers?: string[];
  rows?: string[][];
  sortable?: boolean;           // renders a ↕ affordance after every header label
  sortCol?: number;             // 0-based; renders ▲/▼ on that header instead of ↕
  sortDir?: "asc" | "desc";

  // nav (IA)
  side?: "left" | "top";
  groups?: NavGroup[];

  // raw escape hatch
  html?: string;

  // annotations
  backend?: string;
  ds?: string;

  // flow / interaction (clickable prototype)
  goto?: string;            // screenId
  opens?: string;           // modalId
  action?: string;          // "submit" | "save" | "delete" | …

  // KPI / Stat enrichment
  value?: string;           // "87%", "$12.4M"
  subtitle?: string;        // "Recovery rate"  
  trend?: "up" | "down";    // arrow indicator

  // Form enrichment
  fields?: Array<{
    label: string;
    type?: "text" | "select" | "textarea" | "toggle" | "datepicker" | "upload";
    cols?: 1 | 2;
    placeholder?: string;
    dateValue?: string;
    uploadLabel?: string;
    checked?: boolean;
  }>;
  submitLabel?: string;        // renders a right-aligned primary submit button at the form footer

  // Card enrichment
  title?: string;           // bold heading inside card
  meta?: string[];          // ["Due: Jan 5", "Assigned: AK"]
  badges?: string[];        // ["Urgent", "Bug"] — rendered as chips
  stats?: string[];         // ["3 comments", "2 attachments"] — footer row

  // List enrichment
  items?: string[];         // bullet items

  // Tabs enrichment
  tabs?: string[];          // tab labels
  activeTab?: number;       // 0-based, default 0

  // Avatar enrichment
  initials?: string;        // "AK" — shown inside circle

  // Batch 0: Foundation — Types + Layout Mods & kind enrichment fields
  flex?: number;
  placeholder?: string;
  filters?: string[];
  crumbs?: string[];
  steps?: string[];
  activeStep?: number;
  sections?: { title: string; expanded?: boolean }[];
  sidebarGroups?: { label?: string; items: string[] }[];
  activeItem?: string;
  pages?: number;
  current?: number;
  selectable?: boolean;
  actions?: string[];
  events?: { label: string; meta?: string }[];
  percent?: number;
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "default" | "success" | "warning" | "error";
  rating?: number;
  max?: number;
  checked?: boolean;
  toggleLabel?: string;
  min?: number;
  sliderValue?: number;
  dateValue?: string;
  uploadLabel?: string;
  options?: string[];
  selected?: number;
  checkedItems?: number[];
  message?: string;
  alertType?: "info" | "warning" | "error" | "success";
  modalTitle?: string;
  modalFooter?: string[];
  notifications?: { text: string; meta?: string; unread?: boolean }[];
  messages?: { from: string; text: string; sent?: boolean }[];
  chartData?: ChartDataPoint[];

  // flowgraph enrichment (named graphNodes, not nodes — avoids collision with
  // screen/state `nodes` and normalize recursion)
  graphNodes?: { id: string; label: string; goto?: string; opens?: string }[];
  graphEdges?: { from: string; to: string; label?: string }[];
  direction?: "TB" | "LR";
}

export interface WFState {
  id: string;
  name: string;
  nodes: WFNode[];
}

export type ScreenRole = "list" | "detail" | "form" | "dashboard" | "empty" | "error" | "auth" | "settings";

export interface WFScreen {
  id: string;
  name: string;
  role?: ScreenRole;       // I: IA role shown as badge on screen tab
  states?: WFState[];      // undefined when using single-state shorthand (nodes directly on screen)
  nodes?: WFNode[];        // D: single-state shorthand; normalize wraps into states[]
}

export interface WFFlow {
  from: string;   // screenId
  via: string;    // trigger label
  to: string;     // screenId or modalId
}

export interface WFModal {
  id: string;
  name: string;
  nodes: WFNode[];
}

export interface WFModel {
  feature: string;
  change?: string;
  designSource?: string;
  shared?: Record<string, WFNode>;  // A: named fragments, ref via $ref
  flows?: WFFlow[];                  // H: screen transition map
  screens: WFScreen[];
  modals?: WFModal[];
}

// One stored review comment, keyed by stable wf-id.
export interface Comment {
  id: string;
  label: string;
  screen: string;
  state: string;
  text: string;
}
