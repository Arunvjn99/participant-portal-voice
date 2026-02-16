# HeroUI-Inspired Design System

This project uses a **HeroUI-inspired** visual system ([HeroUI v3](https://v3.heroui.com)) implemented with **Tailwind v3** and existing theme tokens. The official HeroUI v3 library requires Tailwind CSS v4 and React 19; we kept your stack and applied the same design language in code.

## What Was Done

### Design tokens (`src/theme/tokens.css`)

- **`--heroui-radius`** / **`--heroui-radius-sm`** — 12px / 8px radius
- **`--heroui-card-shadow`** / **`--heroui-card-hover-shadow`** — card elevation
- **`--heroui-input-*`** — input border and focus ring
- **`--heroui-switch-*`** — switch track colors
- **`--heroui-transition`** — 0.2s cubic-bezier

### Components updated to HeroUI-style

| Component | Path | Changes |
|-----------|------|--------|
| **Card** | `src/components/ui/card.tsx` | Rounded-xl, HeroUI shadow tokens, border, no extra hover shadow on base card. Uses `bg-card` / `text-card-foreground` for theme. |
| **Input** | `src/components/ui/Input.tsx` | Optional label, rounded-lg, 2px border, focus ring (`focus:border-primary focus:ring-2 focus:ring-primary/20`), optional `description`, error state. Tailwind-only (no `.input` / `.input-wrapper` classes). |
| **Dropdown** | `src/components/ui/Dropdown.tsx` | Rounded-lg, 2px border, focus-within ring, HeroUI-style list (rounded-lg, shadow, selected state `bg-primary/10`). Same API. |
| **Switch** | `src/components/ui/Switch.tsx` | **New.** Track + thumb, rounded-full, primary when checked, optional label/description, keyboard and aria support. |
| **DashboardCard** | `src/components/dashboard/DashboardCard.tsx` | Uses `--heroui-card-shadow` and `--heroui-card-hover-shadow`; selected state uses `border-primary` and primary tint. |

### Using the new Switch (toggle)

```tsx
import { Switch } from "@/components/ui/Switch";

<Switch
  checked={enabled}
  onCheckedChange={setEnabled}
  label="Enable feature"
  description="Optional helper text"
/>
```

### Using Input (same API, improved styling)

`label` is now optional. New optional prop: `description` (helper text under the field).

### Using Dropdown

API unchanged; styling matches Input (rounded-lg, border, focus ring, list styling).

## Alignment with HeroUI v3

- **Cards:** Rounded-xl, light shadow, clear border, theme-aware.
- **Inputs:** Rounded-lg, 2px border, focus ring, error and disabled states.
- **Select/Dropdown:** Same container style as input; list with shadow and selected highlight.
- **Switch:** Track + thumb, smooth transition, primary when on.

## Upgrading to HeroUI v3 (optional)

To use the full [HeroUI v3](https://v3.heroui.com) library (Card, Input, Select, Switch, etc.):

1. Upgrade to **Tailwind CSS v4** and **React 19** (you already have React 19).
2. Install: `npm i @heroui/styles@beta @heroui/react@beta`.
3. In main CSS: `@import "tailwindcss"; @import "@heroui/styles";`
4. Wrap the app with the HeroUI provider and replace these components with `@heroui/react` where desired.

Until then, the current implementation keeps your stack (Tailwind v3, Vite) and delivers a HeroUI-like UI.
