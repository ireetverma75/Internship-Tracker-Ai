# DESIGN.md — Design System and UX
# Internship Tracker AI

---

## 1. Visual Direction

Premium career-tech SaaS. Dark-first. Data-dense but uncluttered.
Personality: confident, intelligent, purposeful. Not generic AI-dashboard aesthetic.

---

## 2. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `midnight` | #0B1020 | Page background |
| `surface` | #111827 | Cards, modals |
| `surface-raised` | #1A2235 | Hover states, nested cards |
| `border` | #1E2D45 | Card borders |
| `border-subtle` | #263348 | Input borders |
| `electric-blue` | #4F7CFF | Primary CTA, active nav, links |
| `cyan` | #35D5F2 | Icons, highlights, match score accent |
| `white` | #F8FAFC | Primary text |
| `muted` | #94A3B8 | Secondary text |
| `dim` | #4B5563 | Placeholder text |
| `green` | #22C55E | Selected, success |
| `amber` | #F59E0B | Assessment, warning |
| `red` | #EF4444 | Rejected, error |
| `purple` | #A855F7 | Interview status |

---

## 3. Typography

Font: **Inter** (Google Fonts) with fallback system-ui.

| Scale | Size | Weight | Usage |
|---|---|---|---|
| `display` | 2.5rem / 40px | 700 | Hero headline |
| `h1` | 1.875rem / 30px | 700 | Page title |
| `h2` | 1.5rem / 24px | 600 | Section header |
| `h3` | 1.125rem / 18px | 600 | Card title |
| `body` | 0.875rem / 14px | 400 | Default text |
| `caption` | 0.75rem / 12px | 400 | Labels, metadata |
| `micro` | 0.625rem / 10px | 500 | Tags, badges |

Tabular numerals (`font-variant-numeric: tabular-nums`) for all metric displays.

---

## 4. Component Specifications

### Buttons
- **Primary:** bg-electric-blue, white text, rounded-xl, px-4 py-2.5, hover: brightness-110, active: scale-95
- **Secondary:** bg-surface-raised border-border, muted text, hover: border-electric-blue
- **Destructive:** bg-red/10 border-red, red text
- **Ghost:** transparent, hover: bg-surface-raised
- **Icon button:** p-2, rounded-lg
- All: focus-visible ring in electric-blue

### Inputs and Forms
- bg-surface, border-border-subtle, rounded-xl
- Focus: border-electric-blue ring-1
- Error: border-red + inline error message below field
- Label above input, required asterisk in red

### Internship Cards
- bg-surface, border-border, rounded-2xl, p-4 shadow-lg
- Header: Company logo placeholder + company name + role title
- Body: Location badge, mode badge, stipend, deadline
- Footer: Top 3 matched skill chips + match score ring
- Hover: border-electric-blue/50, shadow-electric-blue/10 transform -translate-y-0.5
- Saved toggle: bookmark icon top-right

### Match Score Ring
- SVG circle, stroke = electric-blue for matched, red for gap
- Animated stroke-dashoffset on mount
- Center: score percentage in h2 + "Match" caption

### Skill Badges
- Matched: bg-cyan/10 text-cyan border-cyan/30
- Missing: bg-red/10 text-red border-red/30
- Neutral: bg-surface-raised text-muted border-border

### Status Labels
| Status | Color scheme |
|---|---|
| Saved | bg-blue/10 text-electric-blue |
| Applied | bg-amber/10 text-amber |
| Assessment | bg-purple/10 text-purple |
| Interview | bg-cyan/10 text-cyan |
| Selected | bg-green/10 text-green |
| Rejected | bg-red/10 text-red |

### Modals
- Backdrop: black/60 blur-sm
- Panel: bg-surface, rounded-2xl, border-border, shadow-2xl
- Max-width: 480px (sm), 640px (md), 768px (lg)
- Entrance: opacity 0→1 + scale 0.95→1 (150ms ease-out)
- Exit: reverse (100ms)

### Toast Notifications
- Position: bottom-right
- Success: green left border
- Error: red left border
- Info: electric-blue left border
- Auto-dismiss: 4 seconds
- Entrance: slide-in-from-bottom + fade-in

### Skeleton Loaders
- bg-surface-raised with shimmer animation (background-position sweep)
- Match card shape for internship lists
- Match stat shapes for dashboard cards

### Empty States
- Centered illustration (SVG or emoji) + h3 + description + CTA button
- Specific messages per context (no generic "No data found")

### File Upload
- Dashed border zone, rounded-2xl
- Drag-over: border-electric-blue bg-electric-blue/5
- Progress: linear progress bar with percentage
- Success: green checkmark + filename
- Error: red alert icon + error message

---

## 5. Navigation

### Desktop Sidebar (≥ 768px)
- Width: 260px expanded, 80px collapsed
- bg-midnight, border-r border-border
- Brand logo + name at top
- Nav items with icon + label
- Active: bg-electric-blue/15 + left indicator bar (electric-blue)
- Collapse button at bottom

### Mobile (< 768px)
- Top navbar with hamburger
- Slide-in drawer from left (Framer Motion)
- Backdrop closes drawer

### Top Navbar
- Height: 64px, sticky top-0
- bg-midnight/90 backdrop-blur-md
- Breadcrumb left, search center (desktop), actions right
- Actions: backend status indicator, Add button, notifications, avatar

---

## 6. Animations

All animations use **Framer Motion**. Honor `prefers-reduced-motion`.

| Animation | Trigger | Spec |
|---|---|---|
| Page entrance | Route change | opacity 0→1 + y 16px→0, 250ms ease-out |
| Dashboard cards | Mount | Stagger 60ms, y 20px→0, opacity 0→1 |
| Counter | Mount | Count up from 0 over 800ms |
| Chart | Mount | Bars grow from 0, donut draws stroke-dashoffset |
| Match score ring | Mount | Stroke animates 0→score over 1000ms |
| Resume upload | Upload | Progress bar animates width |
| AI loading | Analysis | Pulsing skeleton + rotating Sparkles icon |
| Modal | Open/close | Scale + opacity 150ms / 100ms |
| Card hover | Hover | -translate-y-0.5 + shadow glow |
| Sidebar collapse | Click | Width 260→80 over 250ms ease-in-out |
| Toast | Show/hide | Slide + fade |
| Status change | Click | Color transition 200ms |

**Reduced motion:** All transitions collapse to opacity-only, 50ms.

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| `sm` | 640px | Single column, stack all cards |
| `md` | 768px | Sidebar shown, 2-col grid |
| `lg` | 1024px | 3-col grid for internships |
| `xl` | 1280px | Full dashboard layout |

---

## 8. Accessibility

- Every interactive element has visible focus ring (electric-blue, 2px offset)
- All images have descriptive alt text
- Form inputs have associated `<label>` elements
- Modals trap focus and restore on close
- Dynamic content announced via ARIA live regions
- Color is never the sole indicator of meaning (always icon or text label too)
- Minimum contrast ratio 4.5:1 for body text, 3:1 for large text
- Keyboard navigation: Tab, Enter, Space, Escape for all modals/dialogs
