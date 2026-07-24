---
name: proto-frames
description: Generate fast, monochrome mid-fidelity wireframes and clickable prototypes to preview the UI/UX implications of a feature or change. Use whenever someone describes a feature, backend change, new endpoint, new field, schema change, or user flow and wants to see how the front-end is affected — phrases like "what would the UI look like", "wireframe this", "prototype this flow", "preview the screens for", "mock up the front-end", or "show me the UX impact". Works for developers, PMs, designers, and QA, with or without a backend defined. Reads an optional shared feature-spec.md (intent, persona, screens, API) and a DESIGN.md if present, otherwise asks a few quick questions. You author ONLY a small JSON model (screens, nav, boxes, flow); a prebuilt app renders it as grey boxes + line-art glyphs with clickable screen transitions, modal overlays, and state switching. Monochrome only — shows layout, information architecture, and flow, never colors, spacing, real copy, or production styling. Prefer this over building real UI any time the goal is a quick structural + flow sanity-check rather than a buildable interface.
---

# Wireframe Preview

Turn a described feature or change into a quick, throwaway wireframe so anyone can sanity-check the front-end impact before real UI is built. The point is **mid fidelity at low cost**: rough boxes labeling what each screen section is, **what's in the navigation**, where the new/changed pieces land, **how the screens connect** (clicks → screens, buttons → modals), and how each box maps back to (a) the feature/backend behavior and (b) the design system. Not a buildable interface, never colored or styled.

You author **only a small JSON model** and pass it to the MCP server via `wireframe_open`. A prebuilt app renders it into the operating layer — screens, tabs, enumerated nav, monochrome glyphs, a clickable prototype, the comment/approve loop. No files are written to the user's project. You never write HTML or CSS, and you never touch the app bundle.

This skill is for whoever shows up — a developer mid-feature, a PM scoping an idea, a designer thinking through flows, a QA engineer mapping states. It must produce a useful wireframe from a single sentence and a sharper one from a full spec. **Never block on missing input, never require backend knowledge.**

Two situations to serve, equally:
1. **The user knows their screens** — screens are an *input*; lay out where the changed pieces land.
2. **The user is blank on screens** — screens are an *output*; proposing the screen breakdown from their intent is the whole point. Be generous and concrete when proposing.

## Fidelity: monochrome, but structure + IA + flow

This is **mid-fidelity**, not a polished mockup and not a bag of unlabeled grey boxes. The model conveys the three things a wireframe exists to communicate — **information architecture**, **element type**, and **flow** — while staying strictly monochrome. You must **never**:

- Specify colors, gradients, shadows, spacing, fonts, or any visual design. There are no style fields in the schema; the app renders everything grey by design.
- Write real or realistic copy. Use short generic labels ("Refund reason field", "Submit", "Recovery vs mandate"). Table body cells are placeholders (`—`).
- Render real components or real data. A chart is a box with `kind:"chart:donut"` — a grey donut *glyph*, never a real chart with values. A `kind` is a shape hint, not a component.
- Pull in any framework, CDN, font, or external resource.

What mid-fi *does* add over plain boxes, all monochrome: enumerated navigation (the actual menu items, not one "Sidebar" block), `kind` glyphs so a region reads as kpi/chart/table/form/etc., and `goto`/`opens`/`action` flow so the preview is clickable. Use them — they're the value. If you catch yourself reaching for color or real design, stop.

## Workflow

### 1. Gather the input (read files, then ask only for gaps)

The only things you truly need to start are **the feature intent in one sentence** and **who uses it**. Everything else comes from optional files, or you propose it and the user reacts.

**Read these files if they exist** (look in `docs/specs/<feature>.md`, the project root, or a `docs/` dir):
- `feature-spec.md` (or `docs/specs/<feature>.md`) — the shared feature spec: intent, persona, screens & states, optional API surface / auth / field changes / frontend-impact. Single input contract; sections may be blank ("propose this for me"). The Auth/permissions section tells you which screens need a permission-denied state. For backward compatibility also read a legacy `feature.md`/`api.md` if no `feature-spec.md` exists.
- `DESIGN.md` — component vocabulary (see step 4).

**Then fill gaps by asking — adaptively, in the user's own language.** Match the persona: developers may get endpoint/schema questions; PMs get outcome questions. **If they're blank on screens, do not push them to invent any** — ask only what the feature is for and who uses it, then propose in step 2. If there's no backend yet, that's fine — backend annotations become guesses (step 4) or are omitted. Keep elicitation to a couple of questions; never re-ask what the spec already answers.

### 2. Propose the screens and states, confirm, then draw

Pruning a text list is free; pruning rendered output is not. **Always confirm the list before drawing.**

From the gathered intent, propose a **concrete, generous** breakdown — the screens and states a feature like this normally needs, named plainly. For each screen, propose only the states it actually exercises (default/filled, empty, loading, error, permission-denied). Also note the **navigation** (the menu the screens hang off) and any **modals** the flow opens.

Present compactly and invite pruning:
> A feature like this usually needs these screens:
> 1. **Members page** — list of teammates, Invite button, pending invites (states: default, empty)
> 2. **Invite modal** — enter emails, send (states: default, error)
> 3. **Invitee accept screen** — what the invited person lands on (states: pending, accepted, expired)
>
> I'll draw these. Want to drop, add, rename, or merge any first?

Wait for approval, adjust, then draw (step 3).

**After the list is agreed, offer to save it** to `docs/specs/<feature>.md` (intent + persona + screens + states), so the next run — or any consumer skill — starts from a real spec. Fill only the sections you have.

### 3. Build the wireframe model (JSON only — NEVER write files)

Construct the **WFModel JSON object** in memory, then pass it to `wireframe_open`. **NEVER create a `.wireframes/` directory. NEVER write HTML, CSS, or JS files to the user's project. NEVER run `mkdir` for wireframes. NEVER copy template files.** The MCP server holds the model in memory and serves it dynamically — there is no file-based workflow.

The **only thing you author** is the `#wf-model` JSON. Its shape:

```jsonc
{
  "feature": "Recycler Overview",
  "change": "one-line backend change",         // shown in the review sidebar
  "designSource": "from DESIGN.md | detected: MUI | guess: generic primitives",
  "shared": {                                   // A: named fragments; ref with {"$ref":"key"}
    "left_nav": { "type":"nav", "side":"left", "groups":[...] }
  },
  "flows": [                                    // H: screen flow map (clickable strip in UI)
    { "from":"s_list", "via":"click row", "to":"s_detail" },
    { "from":"s_detail", "via":"Edit", "to":"s_edit" }
  ],
  "screens": [
    {
      "id": "s_overview", "name": "Overview",
      "role": "list",                           // I: IA role badge on tab. Values: list | detail | form | dashboard | empty | error | auth | settings
      "nodes": [ /* node tree */ ]              // D: single-state shorthand — omit "states" wrapper
    },
    {
      "id": "s_detail", "name": "Detail",
      "states": [                               // use states[] only when screen has >1 state
        { "id": "default", "name": "Default", "nodes": [ /* node tree */ ] },
        { "id": "empty",   "name": "Empty",   "nodes": [ /* node tree */ ] }
      ]
    }
  ],
  "modals": [                                   // optional; opened via opens:"<id>"
    { "id": "m_issue", "name": "Issue certificate", "nodes": [ /* node tree */ ] }
  ]
}
```

Use stable, meaningful `id`s for screens and modals — `goto`/`opens` reference them, and they keep comments anchored across edits.

### 4. Author the node tree (structure + IA + glyphs + flow + annotations)

Every `nodes` array holds a tree of **nodes**. Node `type` is a closed structural set; meaning lives in free-text fields.

#### Compact syntax — use this to cut ~35–40% of output tokens

The renderer expands these shorthands automatically:

| Shorthand | Expands to | Savings |
|-----------|-----------|---------|
| Omit `type` — if node has `kind` or `label` | `type:"box"` inferred | ~5–8% |
| `{"row":[...]}` | `{type:"row", children:[...]}` | ~3–5% |
| `{"col":[...]}` | `{type:"col", children:[...]}` | ~3–5% |
| `{"$ref":"key"}` | shared fragment expanded in-place | ~25–40% on repeated nav/sidebar |
| Screen with `nodes:[...]` (no `states`) | `states:[{id:"default",name:"Default",nodes:[...]}]` | ~2–3% |

**Compact example vs. verbose:**
```jsonc
// verbose (old)
{"type":"row","children":[{"type":"box","kind":"button","label":"Save"}]}

// compact (preferred)
{"row":[{"kind":"button","label":"Save"}]}
```

**`$ref` example** — define nav once, reference on every screen:
```jsonc
"shared": {
  "left_nav": {"type":"nav","side":"left","groups":[{"items":[{"text":"Home","goto":"s_home"}]}]}
},
// on each screen's nodes:
{"row":[{"$ref":"left_nav"}, { ...main content... }]}
```

**Placeholder discipline (E):** enrichment content (items, messages, labels) — max 5 words. Use generic text, not realistic copy. The structure is the wireframe, not the content.

**Backend annotation required (F):** every node that is **new or changed** by the feature MUST carry a `backend` field. Layout containers and unchanged elements can omit it.

**Structural types:**

| type    | purpose                                   | key fields                                  |
|---------|-------------------------------------------|---------------------------------------------|
| `box`   | the atom (a labeled region)               | `label`, `kind`, `mods`, `backend`, `ds`, flow, `new`, `changed` |
| `row`   | horizontal flex row — items vertically centered by default; use `mods:["between"]` for title + action header rows | `children` |
| `col`   | vertical stack — shorthand: `{"col":[...]}`      | `children`                         |
| `grid`  | N-column grid (cards/tiles)               | `cols`, `children`                          |
| `table` | a table                                   | `headers[]`, `rows[][]`, `sortable`, `sortCol`, `sortDir`, `backend`, `ds` |
| `nav`   | enumerated navigation (IA)                | `side:"left"\|"top"`, `groups[]`            |
| `raw`   | escape hatch for anything else            | `html`                                      |

**`nav` — enumerate the menu (don't blob it).** This is how "what's in the left nav" gets conveyed. Group the items and mark the active one:

```jsonc
{ "type":"nav", "side":"left", "groups":[
  { "label":"Workflow", "items":[
    { "text":"Overview", "active":true, "goto":"s_overview" },
    { "text":"Battery Intake", "goto":"s_intake" },
    { "text":"Inbox", "badge":4 }
  ]},
  { "label":"Compliance", "items":[ { "text":"EPR Certificates", "goto":"s_certs" } ] }
]}
```

**`kind` — monochrome type glyphs** (a recognizable grey shape, never a real component or real data). Omit `kind` for a plain labeled box. Full vocabulary:

| group | kinds |
|---|---|
| Metrics | `kpi`, `stat` |
| Charts | `chart:donut`, `chart:pie`, `chart:line`, `chart:area`, `chart:bars`, `chart:gauge` |
| Content | `card`, `list`, `table`, `timeline`, `notification-list`, `chat-window`, `flowgraph` |
| Forms & inputs | `form`, `input`, `select`, `button`, `toggle`, `slider`, `datepicker`, `upload`, `radio-group`, `checkbox-group`, `search` |
| Navigation | `tabs`, `breadcrumb`, `stepper`, `accordion`, `sidebar`, `pagination` |
| Display | `heading`, `avatar`, `image`, `badge`, `rating`, `progress`, `alert`, `modal` |

**Enrichment fields — structural shape hints, not real data.** Some kinds render a richer shape when given structured sub-fields. All values max 5 words, generic text — they control the *shape* (field count, step count, tab labels), not content. Omit any field you don't need; the renderer falls back gracefully.

| kind(s) | enrichment fields | minimal example |
|---|---|---|
| `kpi`, `stat` | `value` (display string), `subtitle`, `trend:"up"\|"down"` | `"value":"—", "subtitle":"Total stock"` |
| `form` | `fields[]` — each `{label, type:"text"\|"select"\|"textarea"\|"toggle"\|"datepicker"\|"upload", cols?:1\|2}`; `submitLabel` — renders a right-aligned primary button at the bottom of the form (e.g. `"submitLabel":"Submit Registration"`) | `"fields":[{"label":"Name","type":"text"}], "submitLabel":"Save"` |
| `card` | `title` (bold heading), `meta[]` (small info row), `badges[]` (chip labels), `stats[]` (footer row) | `"title":"Lot A-001", "badges":["Released"]` |
| `list` | `items[]` — bullet strings | `"items":["Item one","Item two"]` |
| `tabs` | `tabs[]` — tab label strings, `activeTab` (0-based index) | `"tabs":["Details","History"], "activeTab":0` |
| `avatar` | `initials` — 1–2 char string | `"initials":"AK"` |
| `breadcrumb` | `crumbs[]` — path segment strings | `"crumbs":["Home","Orders","Detail"]` |
| `stepper` | `steps[]` — step label strings, `activeStep` (0-based) | `"steps":["Upload","Review","Submit"], "activeStep":1` |
| `accordion` | `sections[]` — each `{title, expanded?:true}` | `"sections":[{"title":"Details"},{"title":"History","expanded":true}]` |
| `sidebar` | `sidebarGroups[]` — each `{label?, items:[string]}` | `"sidebarGroups":[{"label":"Nav","items":["Home","Settings"]}]` |
| `pagination` | `pages` (total), `current` (1-based) | `"pages":5, "current":1` |
| `timeline` | `events[]` — each `{label, meta?}` | `"events":[{"label":"Created","meta":"Jun 18"},{"label":"Released"}]` |
| `progress` | `percent` (0–100) | `"percent":65` |
| `alert` | `text`, `alertType:"info"\|"warning"\|"error"\|"success"` | `"text":"Lot in quarantine", "alertType":"warning"` |
| `badge` | `text`, `variant:"default"\|"success"\|"warning"\|"error"` | `"text":"Released", "variant":"success"` |
| `rating` | `rating` (number), `max` | `"rating":4, "max":5` |
| `toggle` | `checked:true\|false`, `toggleLabel` | `"checked":false, "toggleLabel":"Enabled"` |
| `slider` | `min`, `max`, `sliderValue` | `"min":0, "max":100, "sliderValue":40` |
| `datepicker` | `dateValue` (display string) | `"dateValue":"2026-06-18"` |
| `upload` | `uploadLabel` | `"uploadLabel":"Upload CSV..."` |
| `radio-group`, `checkbox-group` | `options[]` — option label strings, `selected` (radio index), `checkedItems[]` (checkbox indices) | `"options":["Option A","Option B"], "selected":0` |
| `notification-list` | `notifications[]` — each `{text, meta?, unread?:true}` | `"notifications":[{"text":"Lot released","unread":true}]` |
| `chat-window` | `messages[]` — each `{from, text, sent?:true}` | `"messages":[{"from":"User","text":"Ready?","sent":true}]` |
| `chart:bars`, `chart:line`, `chart:area`, `chart:donut`, `chart:pie` | `chartData[]` — each `{label, value, target?}` (`target` only affects bars/line/area) | `"chartData":[{"label":"Jan","value":40},{"label":"Feb","value":65}]` |
| `chart:gauge` | `percent` (0–100, arc fill), `value` (center display string, defaults to `percent%`), `subtitle` | `"percent":72, "subtitle":"Health score"` |
| `table` | `sortable:true` (renders `↕` on every header), `sortCol` (0-based, overrides with `▲`/`▼`), `sortDir:"asc"\|"desc"` | `"sortable":true, "sortCol":1, "sortDir":"desc"` |
| `flowgraph` | `graphNodes[]` — each `{id, label, goto?, opens?}`; `graphEdges[]` — each `{from, to, label?}`; `direction:"TB"\|"LR"` (default `"TB"`) | `"direction":"LR", "graphNodes":[{"id":"a","label":"Intake"},{"id":"b","label":"Review"},{"id":"c","label":"Done"}], "graphEdges":[{"from":"a","to":"b"},{"from":"b","to":"c","label":"approve"}]` |

#### Interaction recipes — fake behavior with states

Real client-side behavior (actual sorting, filtering, dragging) is out of scope — the tool shows structure and flow, not working UI. Fake it instead: author two states on the same screen, one showing the "before" and one showing the "after" the interaction would produce. The reviewer flips between states; nothing runs.

**Sortable table** — pair with `sortable`/`sortCol`/`sortDir` above. Second state re-orders `rows` and points the arrow at the sorted column:

```jsonc
// state "Default"
{ "kind":"table", "sortable":true, "headers":["Order","Total","Status"],
  "rows":[["A-102","$40","Open"],["A-101","$90","Open"]] }
// state "Sorted by Total"
{ "kind":"table", "sortable":true, "sortCol":1, "sortDir":"desc",
  "headers":["Order","Total","Status"],
  "rows":[["A-101","$90","Open"],["A-102","$40","Open"]] }
```

**Filtered list/table** — `search` kind with `filters[]` chips above the table; add a `"Filtered"` state with fewer rows and an active-filter chip:

```jsonc
// state "Default": { "kind":"search", "filters":["Status","Date"] }, table with 5 rows
// state "Filtered": { "kind":"search", "filters":["Status: Open ✕","Date"] }, table with 2 rows
```

**Bulk selection** — `selectable:true` on a table plus a state where an action row appears above it (e.g. a `row` with `"2 selected"` label and `actions:["Delete","Export"]`) — already-supported fields, just an undocumented pairing.

**`mods`** — sizing/emphasis/alignment. Combine as needed: `["tall"]`, `["taller"]`, `["placeholder"]` (muted empty/error text), `["solid"]`, `["shaded"]`, `["compact"]`, `["loose"]`, `["narrow"]`, `["center"]`, `["end"]`, `["between"]`, `["middle"]`.

**Flow — make the prototype clickable** (the reviewer walks the IA):
- `goto:"<screenId>"` — clicking switches to that screen.
- `opens:"<modalId>"` — clicking opens that modal overlay.
- `action:"submit"|"save"|"delete"|…` — labels intent (pair with `backend`).

Put these on nav items and on `kind:"button"` boxes (or any box). A small affordance (`→`/`⊕`) shows on the node so flow is visible even in Comment mode.

**Annotations — the high-value mapping.** Every box that is **new or modified by the change** carries both:
- `backend` — the concrete backend element: new/changed column, endpoint, field, event, permission. Source from the spec's API/field sections, else from what the user described. Be specific. If there's genuinely no backend, describe behavior ("saves refund reason") or omit — don't invent endpoint names.
- `ds` — the design-system mapping: component name + variant/size from the user's real vocabulary (below). When nothing fits, prefix with `guess: ` (e.g. `"guess: Badge / status"`); the app renders guesses in amber on hover. Never pass a guess off as confirmed.
- `new: true` — (G) marks element as newly added by this feature. Renders a `✦ new` badge on the node in the wireframe.
- `changed: true` — (G) marks element as modified by this feature. Renders a `~ changed` badge.

Pure layout context (nav containers, unchanged sections) gets no annotations — keep the signal on what changed.

**Table example** — real column names in `headers`, placeholder body rows:

```jsonc
{ "type":"table", "headers":["Order","Status","Total"],
  "rows":[["—","—","—"],["—","—","—"]],
  "backend":"GET /orders", "ds":"DataGrid / striped" }
```

Keep it cheap: a screen is a handful of nodes, short labels, only the states that matter.

#### Sourcing the design-system vocabulary (`DESIGN.md`)

The `ds` mapping is only useful if it uses the names the user's team uses. Don't guess from your own library knowledge. The vocabulary lives in a **`DESIGN.md`** — the open [Google Labs DESIGN.md format](https://github.com/google-labs-code/design.md). The **Components** section is the vocabulary you read. Source it in order:

1. **Read an existing `DESIGN.md`** at the project root (accept legacy lowercase `design.md` or one under `docs/`). Constrain every `ds` value to names that appear there, spelled exactly.
2. **When none exists, auto-detect and create one.**
   - **Step A — spawn a detection agent** (`Agent`, subagent_type `Explore`): "Scan this repo for a component library. Check package.json deps (MUI, Chakra, Ant Design, shadcn/ui, Radix, etc.), a `components/`/`src/components/` dir, a Storybook `stories/` dir, or an internal design package. Return: (1) the detected library + version if any, (2) up to 30 component names with key variants/sizes/states as `ComponentName — variants: x, y; sizes: sm, md, lg`. Return ONLY this list."
   - **Step B — write `DESIGN.md`** from `assets/DESIGN.md`, filling the Components section with the agent's findings; set the `name:` frontmatter to the detected library. Tell the user you created it.
   - **Step C — generic fallback.** If detection finds nothing concrete, write no file; map boxes with generic primitives and mark every `ds` as `guess: `. Tell the user how to add a `DESIGN.md` later.

   Detection/write happens once per project; if `DESIGN.md` exists (even a stub), read it and skip. The user owns the vocabulary; you own the assignment.

### 5. Open the preview, then iterate on the model

**Use the MCP path. Period.** Call `wireframe_open` immediately after constructing the model. Do NOT write files to `.wireframes/` or anywhere else. There is no file-based fallback.

#### Live loop via the wireframe MCP server (no paste, no files)

1. Call **`wireframe_open`** with `{ feature: "<slug>", model: <WFModel JSON> }`. The server holds the model in memory, serves it dynamically on localhost, opens the browser, and returns the URL. No files are written to the user's project. The browser's **"Send to agent"/"Copy feedback"** and **"✓ Approve"** buttons stream their block straight to you.
2. Tell the user to comment/approve, then call **`wireframe_wait_feedback`** with `{ feature, timeoutMs }`. It blocks until the next block arrives and returns the **exact structured text** parsed below.
3. Parse the feedback block (see §Consuming below). Apply changes to the JSON model only. Then call **`wireframe_update`** with `{ feature, model: <updated JSON object> }` — it updates the in-memory model and automatically reloads the already-open browser tab. No manual refresh needed. Call `wireframe_wait_feedback` again to receive the next round. Use `wireframe_status` for `{ approved, openComments }`. Loop until a `WIREFRAME APPROVED` block arrives, then go to step 6.

The MCP server only changes the *transport* — it never generates, renders, or restyles.

#### If wireframe_open call fails

If `wireframe_open` returns an error, report the error to the user and ask them to check their MCP server configuration. Do NOT fall back to writing files — there is no file-based fallback. The wireframe preview requires the MCP server to be running.

#### Consuming a feedback block

When you receive a block delimited `===== WIREFRAME FEEDBACK: <feature> =====` … `===== END FEEDBACK (N items) =====`, treat it as a strict instruction set:

- **Apply only the listed items. Change nothing else.** No "improving" adjacent boxes, no restyling, no touching unnamed screens/states.
- **Match each item by its `#wf-id`**, not the label. The id is stamped on the element and is stable across relabeling; `label="…"` is human reference only. In the model, the id maps to a node in document order — find the node the item describes within its `screen`/`state` scope.
- **Respect the `screen=` and `state=` scope.**
- **Verify the count** in the footer; if you parse fewer/more than N, say so (possible truncated paste).
- **Confirm what you did** — "applied N of N", each id + change. Flag any id that no longer exists.

### 6. Approval & handoff (the terminal signal)

The loop ends in more changes (a feedback block) or **sign-off** ("✓ Approve"). The approval block is delimited `===== WIREFRAME APPROVED: <feature> =====` … `===== END APPROVAL (K mapped boxes, N open comments) =====` and now carries:

- **Screens** — each with id, name, IA role, and enumerated states
- **Modals** — each with id, name, and form field inventory
- **Flow map** — screen→screen and screen→modal transitions
- **New & Changed elements** — every element marked `✦ new` or `~ changed`
- **Form fields** — field names and types for both in-screen and modal forms
- **Box mapping** — every annotated element's `id | label | screen | state | API | COMPONENT | FLOW`

When you receive one:

- **Read it as understanding, not a build spec.** It's the low-fidelity grasp of *what the feature needs* — screens, IA, flow, and how each changed piece ties to a backend element and a component. Not code, not visual design. Never reproduce grey boxes as components or infer pixels/spacing/color.
- **Check open comments first.** If `N open comments`, surface and resolve them before going further.
- **Never modify the original feature spec file** (e.g., `docs/specs/<feature>.md`) with UI mappings. Treat the original input spec as read-only product intent.
- **Re-read the input spec before writing the plan.** The approval block carries UI structure; the input spec carries implementation details the wireframe doesn't model (database schema, validation rules, auth/permissions, error handling, race conditions). You must cross-reference both.
- **Produce an implementation plan file, then wait.** Write `docs/specs/<feature>_implementation.md`. Follow the template below. Present to the user, and **wait for a greenlight** before writing feature code.

#### Implementation plan template

The plan file must cover every section below. Pull data from both the approval block AND the input spec. If a section has no relevant input, write "N/A" — don't omit the heading.

```markdown
# <Feature> — Implementation Plan

**Status:** Wireframe approved (<date>). Ready for build.

**Approval mapping:** <K> boxes mapped to endpoints, components, and flows.

---

## Screen & Modal Breakdown

For EACH screen in the approval block, write a subsection:

### Screen N: <Name> (`<id>`)

**Route:** `/<path>` (from input spec routes or propose one)

**States:** list every state from the approval block (default, empty, error, etc.)

**Components:** for each mapped box on this screen:
- `<ComponentName>` — what it shows
  - Data: which API endpoint feeds it (from the `API` column)
  - Design: which design-system component (from the `COMPONENT` column)

**State & Queries:**
- Hook names: derive from the API endpoints (e.g. `GET /lots` → `useLotsQuery()`)
- Local state: tabs, filters, pagination — anything the UI manages client-side

**Interactions:** for each flow originating from this screen:
- What the user clicks → where it goes (from the Flow map section)

**Responsive:** note layout behavior if input spec mentions it

Do the same for EACH modal — add trigger source, form fields (from the approval
block's Form Fields section), submission endpoint, success/error behavior, and
mutation hook names.

---

## Navigation Integration

**Routes:** full route table derived from screens
**Route protection:** auth/permission rules from input spec's auth section

---

## Feature-Folder Structure

Propose a file tree: `service/`, `components/`, `pages/`, `modals/`, `types.ts`.
One component per mapped box, one page per screen, one modal per modal.

---

## Data Flow Summary

Numbered list: which screen loads what, which modal POSTs where, which mutation
triggers which query invalidation. Trace the full user journey.

---

## Validation & Error Handling

- **Frontend:** form validation rules (required fields, numeric ranges, etc.)
  derived from form field types in the approval block AND input spec constraints.
- **Backend:** summarize relevant constraints from input spec (RLS, locks, status
  rules, race conditions).
- **Permissions:** which mutations need admin, which reads are open to members.

---

## Gaps & Cross-Reference Checklist

Compare the approval block against the input spec and flag anything the wireframe
didn't cover:
- [ ] API endpoints in spec but not mapped to any box
- [ ] Database fields in spec but not surfaced in any screen
- [ ] Business rules in spec not reflected in UI states (e.g. "prevent using
      lots if not released")
- [ ] Auth/permission states not modeled (permission-denied screens)
- [ ] Enum values in spec not fully represented in UI selects/filters

This section is the safety net — it catches what the wireframe missed.
```

Lifecycle: confirm screens (step 2) → draw the model (3–4) → iterate via feedback blocks (5) → **approve → re-read input spec → write rich plan → wait** (6).

## Examples

**Example A — developer, full input.** `feature-spec.md` (API filled) and `DESIGN.md` exist.
Input: "Wireframe the refund flow."
- Step 1: read both; ask nothing.
- Step 2: "Admins issue refunds, customers see confirmation. Screens: Admin refund form (default, error), Customer confirmation, Admin order list (adds Refunded badge); nav: Orders / Refunds. Drawing these — adjust?"
- Steps 3–4: construct the model JSON — a `nav` listing Orders/Refunds, the refund form (`kind:"form"`) with the reason box (`backend`,`ds` from the spec), a `kind:"button"` Submit with `action:"submit"`, the order list as a `table`. Call `wireframe_open` with the model. "Make Reason a Select" → edit that node's `ds`/label, call `wireframe_update`.

**Example B — PM, blank on screens, no files.**
Input: "Show me what the screens look like for letting users invite teammates."
- Step 1: no files. Ask only: "What does this let someone do, and who does it?"
- Step 2: propose the Members page / Invite modal / Invitee accept screen set with states; confirm; offer to save to `docs/specs/invite-teammates.md`.
- Steps 3–4: model the agreed set — a `nav` with the menu, the Members `table`, an "Invite" `kind:"button"` with `opens:"m_invite"`, the invite `modals[]` entry. `backend` describes behavior ("sends invite") since no endpoints; `ds` values are `guess: ` (no `DESIGN.md`).

## Keep it cheap
The token budget is the constraint, and you only write JSON. A screen is a handful of nodes, not a layout study. Fewer nodes, shorter labels, only the states and flow that matter. Start lean; the user can ask for more.
