// Showcase for all render kinds — rewritten with compact syntax.
// Demonstrates: omitted type:"box", shorthand row/col, screen roles,
// flows, new/changed badges, and single-state shorthand.
import type { WFModel } from "../src/types";

const model: WFModel = {
  feature: "All Renderers Showcase",
  change: "Demonstrate all components, kinds, layout modifiers",
  designSource: "guess: engineering design specs",

  flows: [
    { from: "screen_navigation", via: "tab", to: "screen_forms_input" },
    { from: "screen_forms_input", via: "tab", to: "screen_data_display" },
    { from: "screen_data_display", via: "tab", to: "screen_feedback_status" },
  ],

  screens: [
    {
      id: "screen_navigation",
      name: "1. Navigation",
      role: "dashboard",
      nodes: [
        {
          col: [
            {
              row: [
                {
                  kind: "sidebar",
                  activeItem: "Invoices",
                  sidebarGroups: [
                    { label: "Dashboard", items: ["Overview", "Analytics"] },
                    { label: "Finance", items: ["Transactions", "Invoices", "Settings"] },
                  ],
                },
                { kind: "sidebar", label: "Sidebar Fallback" },
              ],
            },
            {
              row: [
                { kind: "breadcrumb", crumbs: ["Home", "Settings", "Billing", "Invoices"] },
                { kind: "breadcrumb", label: "Breadcrumb Fallback" },
              ],
            },
            {
              row: [
                { kind: "tabs", tabs: ["Overview", "Settings", "Analytics", "Logs"], activeTab: 1 },
                { kind: "tabs", label: "Tabs Fallback" },
              ],
            },
            {
              row: [
                { kind: "stepper", steps: ["Cart", "Delivery", "Payment", "Confirm"], activeStep: 2 },
                { kind: "stepper", label: "Stepper Fallback" },
              ],
            },
            {
              row: [
                { kind: "pagination", pages: 6, current: 3 },
                { kind: "pagination", label: "Pagination Fallback" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_forms_input",
      name: "2. Forms & Input",
      role: "form",
      nodes: [
        {
          col: [
            {
              row: [
                { kind: "search", placeholder: "Search transactions...", filters: ["All", "Pending", "Failed", "Cleared"] },
                { kind: "search", label: "Search Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "form",
                  label: "Register Material Lot",
                  fields: [
                    { label: "Supplier Name", type: "text" },
                    { label: "Material Type", type: "select" },
                    { label: "Received Quantity", type: "text" },
                    { label: "Receipt Date", type: "datepicker" },
                  ],
                  submitLabel: "Submit Registration",
                },
                {
                  kind: "form",
                  label: "Form (2-Col)",
                  fields: [
                    { label: "Full Name", type: "text", cols: 2 },
                    { label: "Work Email", type: "text", cols: 1 },
                    { label: "Role", type: "select", cols: 1 },
                    { label: "Bio", type: "textarea", cols: 2 },
                    { label: "Notifications", type: "toggle", cols: 1 },
                  ],
                },
                { kind: "form", label: "Form Fallback" },
              ],
            },
            {
              row: [
                { kind: "toggle", checked: true, toggleLabel: "Dark Mode Enabled" },
                { kind: "toggle", checked: false, toggleLabel: "Automatic Updates" },
                { kind: "toggle", label: "Toggle Fallback" },
              ],
            },
            {
              row: [
                { kind: "slider", label: "Volume Control", min: 0, max: 100, sliderValue: 65 },
                { kind: "slider", label: "Slider Fallback" },
              ],
            },
            {
              row: [
                { kind: "datepicker", label: "Due Date", dateValue: "June 25, 2026" },
                { kind: "datepicker", label: "Datepicker Fallback" },
              ],
            },
            {
              row: [
                { kind: "upload", uploadLabel: "Drag CSV files here" },
                { kind: "upload", label: "Upload Fallback" },
              ],
            },
            {
              row: [
                { kind: "radio-group", label: "Subscription Type", options: ["Free Tier", "Standard Monthly", "Professional Annual"], selected: 1 },
                { kind: "radio-group", label: "Radio Fallback" },
              ],
            },
            {
              row: [
                { kind: "checkbox-group", label: "User Preferences", options: ["Newsletters", "SMS logs", "Analytics"], checkedItems: [0, 2] },
                { kind: "checkbox-group", label: "Checkbox Group Fallback" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_data_display",
      name: "3. Data Display",
      role: "list",
      nodes: [
        {
          col: [
            {
              row: [
                { kind: "kpi", label: "KPI (Up)", value: "$45.2M", subtitle: "Total revenue", trend: "up", new: true },
                { kind: "stat", label: "Stat (Down)", value: "12%", subtitle: "Bounce rate", trend: "down", changed: true },
                { kind: "kpi", label: "KPI Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "table",
                  headers: ["User", "Access Level", "Status"],
                  selectable: true,
                  actions: ["Edit", "Delete"],
                  rows: [
                    ["Alice Vance", "Administrator", "Active"],
                    ["Bob Vance", "Editor", "Suspended"],
                    ["Charlie Vance", "Viewer", "Active"],
                  ],
                },
                { kind: "table", label: "Table Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "card",
                  title: "Card",
                  label: "Category label",
                  meta: ["2h ago", "Owner: AJ"],
                  badges: ["Production", "Active"],
                  stats: ["12 Tasks", "3 Comments"],
                },
                { kind: "card", label: "Card Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "timeline",
                  events: [
                    { label: "Created database cluster", meta: "10:30 AM" },
                    { label: "Triggered auto-failover test", meta: "11:15 AM" },
                    { label: "Completed compliance check", meta: "1:00 PM" },
                  ],
                },
                { kind: "timeline", label: "Timeline Fallback" },
              ],
            },
            {
              row: [
                { kind: "list", label: "List", items: ["Batch completed", "Filing generated", "Certificate issued"] },
                { kind: "list", label: "List Fallback" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_feedback_status",
      name: "4. Feedback & Status",
      role: "detail",
      nodes: [
        {
          col: [
            {
              row: [
                { kind: "alert", message: "Connection restored.", alertType: "success" },
                { kind: "alert", message: "Memory at 92%.", alertType: "warning" },
                { kind: "alert", message: "Database lock error.", alertType: "error" },
                { kind: "alert", label: "Alert Fallback" },
              ],
            },
            {
              row: [
                { kind: "badge", text: "In Production", variant: "success" },
                { kind: "badge", text: "Needs Review", variant: "warning" },
                { kind: "badge", text: "Deployment Failed", variant: "error" },
                { kind: "badge", text: "Draft Status", variant: "default" },
                { kind: "badge", label: "Badge Fallback" },
              ],
            },
            {
              row: [
                { kind: "progress", label: "Upload Progress", percent: 75 },
                { kind: "progress", label: "Progress Fallback" },
              ],
            },
            {
              row: [
                { kind: "rating", label: "Customer Rating", max: 5, rating: 4 },
                { kind: "rating", label: "Rating Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "notification-list",
                  label: "Security Alerts",
                  notifications: [
                    { text: "Suspicious login from IP 192.168.1.55", meta: "5m ago", unread: true },
                    { text: "TLS certificate renewed", meta: "1h ago" },
                    { text: "New API key generated", meta: "2d ago" },
                  ],
                },
                { kind: "notification-list", label: "Notifications Fallback" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_overlays",
      name: "5. Overlays & Composite",
      role: "detail",
      nodes: [
        {
          col: [
            {
              row: [
                {
                  kind: "modal",
                  modalTitle: "Delete Workspace",
                  modalFooter: ["Cancel", "Confirm Delete"],
                  children: [
                    { row: [{ kind: "alert", message: "Action is permanent.", alertType: "warning" }] },
                  ],
                },
                { kind: "modal", label: "Modal Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "chat-window",
                  label: "Support Thread",
                  messages: [
                    { from: "Bot", text: "How can we help?", sent: false },
                    { from: "Customer", text: "Webhook issue.", sent: true },
                    { from: "Agent", text: "Share endpoint URL?", sent: false },
                  ],
                },
                { kind: "chat-window", label: "Chat Fallback" },
              ],
            },
            {
              row: [
                {
                  kind: "accordion",
                  sections: [
                    { title: "General Settings", expanded: true },
                    { title: "Notifications Control", expanded: false },
                    { title: "Developer API Access", expanded: false },
                  ],
                },
                { kind: "accordion", label: "Accordion Fallback" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_content_media",
      name: "6. Content & Media",
      role: "detail",
      nodes: [
        {
          col: [
            {
              row: [
                { kind: "button", label: "Outline Button" },
                { kind: "button", mods: ["solid"], label: "Solid Button" },
              ],
            },
            {
              row: [
                { kind: "avatar", initials: "JD", label: "John Doe" },
                { kind: "avatar", label: "Avatar Fallback" },
              ],
            },
            {
              row: [
                { kind: "image", label: "Default Image" },
                { kind: "image", mods: ["tall"], label: "Tall Image" },
                { kind: "image", mods: ["taller"], label: "Taller Image" },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "screen_layout_modifiers",
      name: "7. Layout & Modifiers",
      role: "settings",
      nodes: [
        {
          col: [
            { row: [{ kind: "badge", text: "Aligned End", variant: "default" }, { kind: "badge", text: "Secondary", variant: "default" }], mods: ["end"] },
            { row: [{ kind: "badge", text: "Aligned Center", variant: "default" }, { kind: "badge", text: "Secondary", variant: "default" }], mods: ["center"] },
            { row: [{ kind: "badge", text: "Between Left", variant: "default" }, { kind: "badge", text: "Between Right", variant: "default" }], mods: ["between"] },
            { row: [{ kind: "badge", text: "Vertically Middle", variant: "default" }, { kind: "badge", text: "Tall Row", variant: "default" }], mods: ["middle", "tall"] },
            { row: [{ kind: "badge", text: "Compact Gap", variant: "default" }, { kind: "badge", text: "6px", variant: "default" }], mods: ["compact"] },
            { row: [{ kind: "badge", text: "Loose Gap", variant: "default" }, { kind: "badge", text: "20px", variant: "default" }], mods: ["loose"] },
            {
              row: [
                { col: [{ label: "flex = 1" }], flex: 1 },
                { col: [{ label: "flex = 3 (3× wider)" }], flex: 3 },
                { col: [{ label: "Narrow (min space)" }], mods: ["narrow"] },
              ],
            },
            {
              row: [
                {
                  label: "Box with nested children",
                  children: [
                    { row: [{ kind: "avatar", initials: "TM" }, { kind: "button", label: "Message" }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default model;
