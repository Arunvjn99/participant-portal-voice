# LAYOUT AUDIT - Conflicting Rules Analysis

## Global Rules (src/index.css)

### Rule 1: `.dashboard-layout__main` (lines 242-252)
```css
.dashboard-layout__main {
  max-width: 1280px;  /* CENTERING CONSTRAINT */
  margin: 0 auto;     /* CENTERS CONTENT */
  padding: var(--spacing-4);
}
```

**Status:**
- ✅ **Plans RELIES on this** - Gets centered layout at 1280px
- ❌ **Dashboard RELIES on this** - Also gets centered (inconsistent with desired full-width)
- ❌ **Review RELIES on this** - Also gets centered
- ❌ **PostEnrollment RELIES on this** - Also gets centered

**Ownership:**
- Currently: **Layout-owned** (DashboardLayout wrapper)
- Desired: **TBD** - Need to decide if centering should be:
  - Layout-controlled (all pages centered)
  - Page-controlled (each page decides)
  
**Action:**
- ⚠️ **DO NOT REMOVE** - Plans depends on this for its 1280px max-width
- 🔄 **INVESTIGATE** - How does Plans achieve its layout with this constraint?

---

### Rule 2: `.choose-plan__content` (lines 1457-1472)
```css
.choose-plan__content {
  grid-template-columns: 65fr 35fr;  /* FRACTIONAL GRID */
}
```

**Status:**
- ✅ **Plans uses this** - Defines 65/35 split
- ❌ **No other pages use this** - Plans-specific

**Ownership:**
- Currently: **Page-owned** (via CSS class)
- Desired: **Page-owned** (correct)

**Action:**
- ✅ **KEEP** - This is Plans' grid definition
- ℹ️ **UNDERSTAND** - This is the canonical pattern to replicate

---

### Rule 3: `.choose-plan__right` (lines 1485-1497)
```css
.choose-plan__right {
  position: sticky;
  top: var(--spacing-6);
}
```

**Status:**
- ✅ **Plans uses this** - Sticky sidebar
- ❌ **Other pages use different approaches**

**Ownership:**
- Currently: **Page-owned** (via CSS class)
- Desired: **Page-owned** (correct)

**Action:**
- ✅ **KEEP** - This is Plans' sidebar behavior
- ℹ️ **REPLICATE** - Other pages should copy this pattern

---

## Page-Specific Rules

### Dashboard (Dashboard.tsx line 23)
```tsx
<section className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
  <div className="...flex-1...">
  <div className="...lg:w-[340px]...">
```

**Status:**
- ❌ **Uses flex instead of grid** - Inconsistent with Plans
- ❌ **Fixed 340px sidebar** - Should be fractional like Plans (35fr)

**Ownership:**
- Currently: **Page-owned** (inline Tailwind)
- Desired: **Page-owned** (correct ownership, wrong pattern)

**Action:**
- 🔄 **MODIFY** - Change to match Plans' 65fr/35fr grid pattern
- ⚠️ **After** Plans pattern is fully understood

---

### Review (Review.tsx line 285)
```tsx
<div className="grid grid-cols-1 gap-6 
  lg:grid-cols-[minmax(0,1fr)_360px] 
  xl:grid-cols-[minmax(0,1fr)_400px] 
  2xl:grid-cols-[minmax(0,1fr)_420px]">
```

**Status:**
- ❌ **Uses fixed-width sidebar** - Plans uses 35fr (fluid)
- ❌ **Different pattern** - minmax(0,1fr) vs 65fr

**Ownership:**
- Currently: **Page-owned** (inline Tailwind)
- Desired: **Page-owned** (correct ownership, wrong pattern)

**Action:**
- 🔄 **MODIFY** - Change to match Plans' 65fr/35fr grid pattern
- ⚠️ **After** Plans pattern is fully understood

---

### PostEnrollmentDashboard (PostEnrollmentDashboard.tsx line 39)
```tsx
<div className="grid grid-cols-1 gap-6 
  lg:grid-cols-[minmax(0,1fr)_360px] 
  xl:grid-cols-[minmax(0,1fr)_400px] 
  2xl:grid-cols-[minmax(0,1fr)_420px]">
```

**Status:**
- ❌ **Same as Review** - Fixed-width sidebar, not fluid like Plans

**Action:**
- 🔄 **MODIFY** - Change to match Plans' 65fr/35fr grid pattern
- ⚠️ **After** Plans pattern is fully understood

---

### Contribution (Contribution.tsx line 278)
```tsx
<div className="grid grid-cols-1 gap-8 lg:grid-cols-[58%_1fr]">
```

**Status:**
- ❌ **Uses percentage (58%)** - Plans uses fractional (65fr)
- ❌ **Mixed units** - % + fr

**Action:**
- 🔄 **MODIFY** - Change to match Plans' 65fr/35fr grid pattern
- ⚠️ **After** Plans pattern is fully understood

---

## Summary of Conflicts

| Rule | Used By | Conflict | Action |
|------|---------|----------|--------|
| `.dashboard-layout__main` max-width | **ALL PAGES** | Plans needs it, others constrained by it | ⚠️ KEEP - investigate how Plans uses it |
| `.choose-plan__content` 65fr/35fr | **Plans only** | Others use different patterns | ℹ️ CANONICAL - replicate this |
| Fixed-width sidebars (360/400/420px) | Review, PostEnrollment | Inconsistent with Plans' 35fr | 🔄 CHANGE to 35fr pattern |
| Percentage grid (58% + 1fr) | Contribution | Inconsistent with Plans' 65fr/35fr | 🔄 CHANGE to 65fr/35fr |
| Flex layout (340px sidebar) | Dashboard | Inconsistent with Plans' grid | 🔄 CHANGE to 65fr/35fr grid |

---

## Key Question Requiring Investigation

**HOW DOES PLANS ACHIEVE ITS LAYOUT WITH max-width: 1280px?**

On a 1920px viewport:
- `.dashboard-layout__main` enforces max-width: 1280px
- Content is centered with `margin: 0 auto`
- `.choose-plan__content` uses 65fr/35fr grid
- At 1280px: 65fr = ~832px, 35fr = ~448px

**This is the pattern to replicate** - not the fixed-width sidebar pattern.

---

## Next Steps

1. ✅ **Document this as the canonical pattern** (this file)
2. 🔄 **Create layout contract** defining 65fr/35fr + max-width: 1280px
3. 🔄 **Apply to Review.tsx** first
4. ⏸️ **Wait for validation** before touching other pages
