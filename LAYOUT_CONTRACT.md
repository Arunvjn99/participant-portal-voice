# LAYOUT CONTRACT - Source of Truth

## 🎯 Canonical Reference: ChoosePlan.tsx (Plans Page)

All pages must visually align with the Plans page layout behavior.

---

## 📐 Layout Specification

### 1. Centering Strategy

**Global Container:** `.dashboard-layout__main`
```css
max-width: 1280px;
margin: 0 auto;
```

**Result:**
- Content is **centered** on viewports > 1280px
- White space appears equally on left/right sides
- On 1920px viewport: `(1920 - 1280) / 2 = 320px` white space per side
- On 1440px viewport: `(1440 - 1280) / 2 = 80px` white space per side
- On 1280px viewport: No white space (fills viewport)

**Rule:** ✅ **ALL pages inherit this from DashboardLayout wrapper**

---

### 2. Grid Ownership Rules

**Layout Layer (DashboardLayout):**
- ✅ Provides max-width container (1280px)
- ✅ Provides horizontal padding (responsive)
- ✅ Provides vertical spacing (gap-6)
- ❌ **NEVER defines columns** - that's page-owned

**Page Layer:**
- ✅ **Defines grid columns** (65fr 35fr pattern)
- ✅ Defines gap between columns
- ✅ Controls sidebar behavior (sticky, etc.)

**Rule:** Grid = Page-owned. Layout = Container only.

---

### 3. Desktop Grid Pattern (CANONICAL)

**At lg breakpoint (1024px+):**

```css
.choose-plan__content {
  display: grid;
  grid-template-columns: 65fr 35fr;
  gap: var(--spacing-8);  /* 32px */
  align-items: start;
}
```

**Fractional Breakdown:**
- **Main column:** 65fr (65% of available width)
- **Sidebar column:** 35fr (35% of available width)
- **At 1280px container:** 65fr = ~832px, 35fr = ~448px
- **At 1440px viewport:** Still 1280px container (centered)
- **At 1920px viewport:** Still 1280px container (centered)

**Rule:** ✅ Use **fractional units (fr)**, NOT fixed px or percentages

---

### 4. Sidebar Sizing

**Pattern:** Fluid fractional (35fr) within constrained container

| Viewport | Container Width | Main Column | Sidebar |
|----------|----------------|-------------|---------|
| **1024px** | 1024px (full) | 65fr ≈ 666px | 35fr ≈ 358px |
| **1280px** | 1280px (full) | 65fr ≈ 832px | 35fr ≈ 448px |
| **1440px** | 1280px (centered) | 65fr ≈ 832px | 35fr ≈ 448px |
| **1920px** | 1280px (centered) | 65fr ≈ 832px | 35fr ≈ 448px |

**Effect:** Sidebar grows from 358px to 448px, then **stops** at 1280px viewport.

**Rule:** ✅ **Sidebar is fluid below 1280px, fixed at ~448px above**

---

### 5. Sidebar Behavior

```css
.choose-plan__right {
  position: sticky;
  top: var(--spacing-6);  /* 24px */
  align-self: start;
}
```

**Rule:** ✅ Sidebar sticks to top when scrolling (within grid context)

---

### 6. Mobile/Tablet Pattern

**Below lg (< 1024px):**

```css
.choose-plan__content {
  grid-template-columns: 1fr;  /* Single column */
  gap: var(--spacing-6);       /* 24px */
}
```

**Rule:** ✅ Mobile = single column, full width, no sidebar side-by-side

---

### 7. Responsive Breakpoints

| Breakpoint | Container Padding | Grid Columns | Gap |
|------------|------------------|--------------|-----|
| **Base (< 768px)** | 16px (`--spacing-4`) | 1fr | 24px |
| **md (768px+)** | 24px (`--spacing-6`) | 1fr | 24px |
| **lg (1024px+)** | 32px (`--spacing-8`) | 65fr 35fr | 32px |

**Rule:** ✅ Padding increases with breakpoints, grid activates at lg

---

## 🚫 Anti-Patterns (Do NOT Use)

| ❌ Wrong | ✅ Correct | Reason |
|---------|-----------|--------|
| `lg:grid-cols-[minmax(0,1fr)_360px]` | `lg:grid-cols-[65fr 35fr]` | Fixed px breaks proportional scaling |
| `lg:grid-cols-[58% 1fr]` | `lg:grid-cols-[65fr 35fr]` | Mixed units are inconsistent |
| `lg:flex-row` + `lg:w-[340px]` | `lg:grid-cols-[65fr 35fr]` | Flex is not grid, 340px is wrong |
| `grid-cols-[1fr 400px]` at xl | `lg:grid-cols-[65fr 35fr]` | No breakpoint-specific changes |
| Removing max-width: 1280px | Keep it | Plans relies on this constraint |

---

## ✅ Implementation Checklist

To match Plans page:

1. ✅ Keep `.dashboard-layout__main` max-width: 1280px
2. ✅ Use `grid-template-columns: 65fr 35fr` at lg+
3. ✅ Use `gap: var(--spacing-8)` (32px) between columns
4. ✅ Use `position: sticky` on sidebar
5. ✅ Use `grid-template-columns: 1fr` below lg
6. ✅ No breakpoint-specific column changes (same 65fr 35fr at xl/2xl)

---

## 🎨 Visual Alignment Test

At 1440px viewport, all pages should show:
- **Left edge:** 80px white space
- **Right edge:** 80px white space
- **Content width:** 1280px (centered)
- **Main column:** ~832px
- **Sidebar:** ~448px
- **Gap:** 32px

**Rule:** If any page doesn't match this, it's wrong.

---

## 📝 Code Template

### CSS Approach (Like Plans):
```css
.page__content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-6);
}

@media (min-width: 1024px) {
  .page__content {
    grid-template-columns: 65fr 35fr;
    align-items: start;
    gap: var(--spacing-8);
  }
}

.page__sidebar {
  position: sticky;
  top: var(--spacing-6);
  align-self: start;
}
```

### Tailwind Approach (Alternative):
```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr] lg:items-start lg:gap-8">
  <div className="min-w-0">
    {/* Main content */}
  </div>
  <aside className="min-w-0 lg:sticky lg:top-6">
    {/* Sidebar */}
  </aside>
</div>
```

**Note:** Tailwind fractional units syntax: `lg:grid-cols-[65fr_35fr]`

---

## 🎯 Success Criteria

A page matches Plans when:

✅ Content is centered at 1280px max-width  
✅ Uses 65fr/35fr grid (not fixed px)  
✅ Sidebar is ~448px at lg+ (not 340/360/400/420px)  
✅ Single column below lg  
✅ Sticky sidebar behavior  
✅ No horizontal overflow  
✅ No layout shift between breakpoints  
✅ Visually identical alignment at 1440px viewport  

---

**Last Updated:** Layout analysis from ChoosePlan.tsx  
**Status:** ✅ Canonical - Do not modify Plans page  
**Next Step:** Apply this contract to Review.tsx only
