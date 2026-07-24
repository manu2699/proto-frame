---
# DESIGN.md token frontmatter — Google Labs DESIGN.md format (https://github.com/google-labs-code/design.md).
# Machine-readable design tokens. Fill what you know; omit what you don't. Hex is the recommended color format.
version: alpha
name: <project> design system
description: Component vocabulary and visual rules for this project. Read by the proto-frames skill to ground every data-ds mapping in real component names.
colors:
  primary: "#000000"
  neutral: "#71717a"
typography:
  h1:
    fontFamily: <font>
    fontSize: 24px
    fontWeight: 600
  body:
    fontFamily: <font>
    fontSize: 14px
    fontWeight: 400
rounded:
  md: 6px
spacing:
  md: 12px
components:
  # <component-name>:
  #   <token-name>: <value | {token.reference}>
---

<!--
  DESIGN.md — the design-system source of truth, per Google Labs' open DESIGN.md format
  (https://github.com/google-labs-code/design.md). Lives at the PROJECT ROOT.

  This is a REFERENCE SCAFFOLD only. The proto-frames skill never auto-creates a
  DESIGN.md — it only reads one you've authored deliberately. Author this by hand (or with
  dedicated DESIGN.md tooling) when you want a real, standards-compliant vocabulary; if it's
  absent, the wireframe just falls back to generic HTML primitives with amber-marked guesses.

  Once it exists, the skill reads the Components section to constrain every `data-ds`
  annotation to names your team actually uses; names here are authoritative and copied verbatim.

  Sections below follow the canonical DESIGN.md order. Omit any that don't apply, but keep the order.
-->

# <project> Design System

## Overview
<!-- Brand & Style: the product's look and feel — personality, audience, the feel to evoke
     (playful vs professional, dense vs spacious). Guides decisions when no token/rule applies.
     Note the Source here: detected (how) / described / generic primitives — no design system yet. -->

## Colors
<!-- Color palettes and their semantic roles (primary, secondary, tertiary, neutral). Token values live in frontmatter. -->

## Typography
<!-- Type families, scale, weights, and when to use each. Token values live in frontmatter. -->

## Layout
<!-- Layout & Spacing: grid, spacing scale, breakpoints, container widths. -->

## Elevation & Depth
<!-- Shadows / layering rules, if any. -->

## Shapes
<!-- Corner rounding, borders, shape language. -->

## Components
<!--
  THE PART THE WIREFRAME SKILL USES. List components and the variants/sizes/states the skill
  may map boxes to — one per line, spelled exactly as your team names them. Example:
    Button — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg
    Input — types: text, email, number; sizes: sm, md
    Select / Combobox
    TextArea — sizes: sm, md, lg
    Table / DataGrid — striped, bordered
    Badge — status, count
    Alert — info, success, warning, error
    Card, Modal / Dialog, Tabs, Breadcrumb, Skeleton, Empty state
-->

## Do's and Don'ts
<!-- Short, concrete rules. e.g. "Do use primary for the single main action per screen." / "Don't mix Card and Modal for the same content." -->
