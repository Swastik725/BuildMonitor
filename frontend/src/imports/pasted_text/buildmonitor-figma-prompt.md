# Figma Make prompt — BuildMonitor

Copy everything below into Figma Make as one prompt.

---

Design a web app called **BuildMonitor** — a DevOps observability platform for developers and small engineering teams. It tracks CI/CD pipeline runs, infrastructure health, and application uptime/error monitoring in one dashboard.

## Product context

Users are developers and DevOps engineers who check this dashboard multiple times a day, often under stress (a deploy just failed, a service is down). The design has to prioritize scan-ability and calm authority — this is a tool people trust during incidents, not a marketing site.

Core screens needed:
1. **Login / signup** — email+password and "continue with Google/GitHub" options
2. **Dashboard (home)** — overview cards: active projects, recent deployments, uptime status, open incidents/errors at a glance
3. **Project detail view** — deployment history (list/timeline), current status, linked repo info
4. **Deployment detail** — single deployment: build logs summary, status (success/failed/in-progress), timestamps, triggered-by user
5. **Organization/team view** — list of projects under an org, members
6. **Settings** — profile, connected accounts (Google/GitHub), organization management

## Design direction — classy, not neon

Avoid: neon greens/purples on dark backgrounds, glowing status dots, gradient buttons, glassmorphism, cyberpunk/hacker aesthetic, anything that looks like a crypto dashboard or a "hacking" movie UI. No glow effects, no excessive dark-mode-only neon accents.

Instead, aim for: a **refined, editorial, quiet-confidence** aesthetic — closer to Linear, Vercel's dashboard, Stripe's dashboard, or Arc browser's calmer UI moments. Think "a well-run engineering org's internal tool," not "hacker terminal."

Specific direction:
- **Base palette**: neutral off-whites/warm grays for light mode, deep charcoal (not pure black) for dark mode. One restrained accent color — a muted blue, ink navy, or deep forest green — used sparingly for primary actions and active states only.
- **Status colors**: success/failure/warning states should use desaturated, muted tones (soft green, muted amber, muted red/brick) — not saturated red/green traffic-light colors. Status should be legible via icon + label, not just color.
- **Typography**: a clean, high-quality sans-serif for UI (e.g. Inter, Geist, or similar) with a monospace font (e.g. JetBrains Mono, IBM Plex Mono) reserved specifically for logs, commit hashes, build IDs, and code-like data — this contrast is what makes DevOps tools feel credible.
- **Density**: compact, information-dense rows for logs/deployments (these get scanned quickly), but generous whitespace on dashboard summary cards. Don't cram everything — mix density deliberately by context.
- **Borders over shadows**: prefer thin 1px hairline borders and flat surfaces over heavy drop shadows. Shadows only for genuine overlays (modals, dropdowns).
- **Iconography**: simple outline icons (not filled/glyph-heavy), consistent stroke width, no decorative illustration icons.
- **Corners**: small consistent radius (6–10px), not overly rounded/pill-shaped except for status badges/tags.
- **No mid-sentence bold, no all-caps headers, sentence case throughout** — e.g. "Deployment history" not "DEPLOYMENT HISTORY."

## Animation and motion references

Keep motion purposeful and subtle — used to reinforce state changes, not decorative. Reference points to describe the *feel* (do not copy layouts):
- **Linear.app** — subtle hover elevation, smooth panel transitions, calm loading skeletons
- **Vercel dashboard** — real-time status transitions (building → ready) with understated color shifts, not flashy animation
- **Stripe dashboard** — smooth number count-up on stat cards, gentle fade-ins on data load
- **Raycast** — crisp, fast micro-interactions (button press states, list item hover) with no bounce/overshoot easing

Motion principles: ease-out curves, 150–250ms durations for UI transitions, no bounce/spring effects, skeleton loaders (not spinners) for data-heavy views, a subtle pulsing indicator only for "in progress/live" states (e.g. a build currently running) — this is the one place gentle motion signals real-time activity.

## Design system requirements

Build this as a proper design system, not one-off screens:
- Define a color token set: background/surface layers (page, card, elevated/popover), text (primary, secondary, muted), border (default, strong), and semantic status colors (success, warning, danger, info) — each with light and dark mode values
- Define type scale: page titles, section headings, body text, captions/metadata, and monospace/code text
- Reusable components: buttons (primary, secondary, ghost), input fields, status badges/pills, data table rows, cards, navigation sidebar, top bar with org/project switcher
- Support both light and dark mode from the start, with dark mode as the default (developers tend to prefer it for this kind of tool)

## Deliverable

Produce the full flow: login → dashboard → project detail → deployment detail → org view → settings, using one consistent design system across all screens. Prioritize the dashboard and project detail views as the highest-fidelity screens since they'll be shown most in a demo.