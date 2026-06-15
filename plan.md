# Light Theme + Toggle Implementation Plan

## Strategy

Use CSS custom properties with a `data-theme` attribute on `<html>` to switch between dark/light palettes. Create a React context for theme state with localStorage persistence.

## Light Theme Color Palette

| Purpose              | Dark (current)           | Light                     |
| -------------------- | ------------------------ | ------------------------- |
| Background           | `#030d0a`                | `#f8f5f0` (warm ivory)    |
| Background secondary | `#051c15`                | `#ede8e0` (warm beige)    |
| Background tertiary  | `#041a15`                | `#e5dfd6`                 |
| Text                 | `#ffffff`                | `#1c1917` (warm charcoal) |
| Text muted           | `rgba(255,255,255,0.65)` | `rgba(28,25,23,0.65)`     |
| Accent (gold)        | `#d4af37`                | `#d4af37` (unchanged)     |
| Accent dark          | `#aa8010`                | `#aa8010` (unchanged)     |
| Glass panel          | `rgba(5,28,21,0.25)`     | `rgba(255,255,255,0.6)`   |
| Glass border         | `rgba(212,175,55,0.15)`  | `rgba(212,175,55,0.25)`   |
| Image overlay        | `rgba(3,13,10,0.2)`      | `rgba(248,245,240,0.15)`  |
| Shadows              | dark heavy               | lighter, warm             |
| Footer/nav border    | `white/10`               | `black/10`                |

## Files to Create

1. **`components/ThemeProvider.tsx`** — React context with `theme`, `toggleTheme`. Reads/writes localStorage. Sets `data-theme` attribute on `<html>`.
2. **`components/ThemeToggle.tsx`** — Sun/Moon icon button with smooth animation.

## Files to Modify

### 1. `app/globals.css`

- Expand `:root` with additional CSS variables (`--bg-tertiary`, `--overlay`, `--shadow-color`, `--border-color`, `--accent-dark`)
- Add `[data-theme="light"]` block with the full light palette
- Update `.glass-panel`, `.text-gradient`, `.noise` for theme awareness
- Add smooth `transition` on `background-color` and `color` on `body`

### 2. `app/layout.tsx`

- Import and wrap children with `<ThemeProvider>`
- Add `suppressHydrationWarning` to `<html>` (needed for data-theme set before hydration)

### 3. `app/page.tsx` (~80 hardcoded color replacements)

- Replace `bg-[#030d0a]` → `bg-[var(--bg)]`
- Replace `bg-[#051c15]` / `bg-[#041a15]` → `bg-[var(--bg-secondary)]` / `bg-[var(--bg-tertiary)]`
- Replace `text-[#d4af37]` → `text-[var(--accent)]`
- Replace `border-[#d4af37]/XX` → `border-[var(--accent)]/XX`
- Replace `text-white` / `text-white/XX` → `text-[var(--text)]` / `text-[var(--text-muted)]`
- Replace hardcoded gradient/glow colors with CSS variable equivalents
- Add ThemeToggle to the desktop nav
- Replace image overlay colors

### 4. `components/HeroAnimation.tsx`

- Replace hardcoded hex colors with CSS variables
- Replace `text-white/XX` with theme-aware variants

### 5. `components/MobileNav.tsx`

- Replace `bg-[#050505]` → `bg-[var(--bg)]`
- Replace `text-white/90` → theme-aware text color
- Add ThemeToggle button next to hamburger menu

### 6. `components/CustomCursor.tsx`

- No changes needed (gold cursor works on both themes)

### 7. `components/Countdown.tsx`

- Already uses `var(--accent)` — minimal/no changes needed

### 8. `components/EnvelopeReveal.tsx`

- **No changes** — intro stays dark-only (it's a cinematic moment)

### 9. `components/ScrollAnimations.tsx`

- Replace hardcoded `#d4af37` with `var(--accent)` in GSAP color animation

## Toggle Placement

- **Desktop**: Sun/Moon icon in the floating capsule nav bar (right side)
- **Mobile**: Inside the hamburger menu, or as a small fixed button alongside the hamburger

## Behavior

- Default to dark theme (matches current design)
- Persist choice in localStorage
- Smooth CSS transition on theme switch (background-color, color ~300ms)
- EnvelopeReveal always renders in dark mode regardless of theme
