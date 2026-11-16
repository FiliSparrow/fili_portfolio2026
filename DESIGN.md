---
name: Maia Branson portfolio
description: A portfolio that lives on one character grid, opened by ASCII butterflies.
colors:
  navy: "#060a1a"
  on-navy: "#eef2ff"
  on-navy-soft: "#aab8e2"
  butterfly-blue: "#3f7bff"
  butterfly-blue-deep: "#1c3a8a"
  blue-on-navy: "#6f9bff"
  paper: "#f2f4f8"
  paper-raised: "#e6e9f1"
  ink: "#0f1630"
  ink-soft: "#49526f"
  line: "#cfd5e3"
  blue-ink: "#2450d6"
typography:
  display:
    fontFamily: "Host Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(3.25rem, 10.5vw, 6rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "Host Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.5rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Host Grotesk Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Mono Variable, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  chip: "6px"
  card: "16px"
  sheet: "28px"
  pill: "999px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 3rem)"
  section: "clamp(6rem, 12vw, 11rem)"
components:
  cover:
    backgroundColor: "{colors.paper-raised}"
    rounded: "{rounded.card}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "0.3rem 0.55rem"
  nav-link:
    textColor: "{colors.on-navy-soft}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 0.9rem"
---

## Overview

The whole site sits on one character grid. A deep navy field with a faint cell grid carries a flock of butterflies drawn from ASCII characters. A cool paper sheet with rounded corners slides over that field and holds the work. At the end of the page the sheet lifts and the field returns for the contact section.

Motion is quick and never blocks reading. The one interaction that must feel right is a project cover growing into its case-study header.

## Colors

Two grounds, never mixed inside one region:

- **Field (dark):** `navy` ground, `on-navy` text, `on-navy-soft` secondary text. Butterflies use `butterfly-blue` and `butterfly-blue-deep` cells with pale characters. Used for the landing and the contact footer only.
- **Sheet (light):** `paper` ground, `ink` text, `ink-soft` secondary text, `line` rules. `blue-ink` is the single accent, used for focus rings and text selection.

Each project has its own cover colours (a dark ground and two cell tones), set in `src/projects.js`. Secondary text is always tinted blue-grey, never neutral grey.

## Typography

Host Grotesk carries all words, at weight 500 for display and headings and 400 for body. Geist Mono is reserved for things that belong to the grid: the ASCII itself, the "Placeholder" chip and small card and fact labels. Body text measures at most 65 characters. No uppercase tracked labels, and no label above a heading.

## Layout

- The butterfly field is fixed behind the page. The hero and the footer are transparent windows onto it.
- The hero is one full screen: navigation top right, name and introduction lower left, a "See the work" link at the bottom.
- Work cards sit on a 12-column grid in a staggered pair rhythm (5 and 7 columns, the second offset down). Below 760px everything is one column.
- Case studies are one column, up to 72rem wide, with text held to 65 characters.

## Elevation & Depth

No shadows. Depth comes from layering: the sheet sits over the field, and butterflies come in three sizes and opacities to read as near and far.

## Shapes

Covers and images use a 16px radius. The sheet uses 28px (20px on phones). Chips use 6px. Only small navigation links are pills.

## Components

- **Butterfly field** (`src/flock.js`): grid-snapped canvas drawn at about 30 frames a second. Butterflies steer around elements marked `data-avoid`, keep apart from each other, flee the mouse and scatter from a tap. With reduced motion it draws one still frame.
- **Decode** (`src/decode.js`): text settles from grid characters, left to right, in 400 to 450ms. Used on the name and case-study titles only.
- **Project card:** title and one-line summary above, cover, then category and "View" in mono below. The whole card is one link.
- **Cover to case study:** a same-document view transition, 450ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`. A short scatter of five butterflies flies out as it opens. Browsers without view transitions get a 400ms fade.
- **Focus list:** large discipline names that sharpen from a blur as they cross the middle of the screen.

## Do's and Don'ts

- Do keep motion under half a second for anything that blocks reading.
- Do mark every placeholder as a placeholder until real content replaces it.
- Do keep butterflies off text: add `data-avoid` to any new text placed on the field.
- Don't add shadows, gradients on text, glass effects or a cursor follower.
- Don't put butterflies on the paper sheet apart from the short scatter when a project opens.
- Don't use the mono face for body text or headings.
