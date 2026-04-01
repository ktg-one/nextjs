---
name: tailwind-v4
description: "Tailwind CSS v4 patterns, @utility/@custom-variant directives, dark mode, v3→v4 migration. Official docs source."
user-invocable: false
---

# Tailwind CSS v4 Patterns (Official Docs Source)

> Based on Tailwind CSS v4 documentation pulled from Context7.

## Setup (Next.js 16 + PostCSS)

```bash
# Already in package.json — no additional install needed
# @tailwindcss/postcss v4  +  tailwindcss v4
```

```css
/* src/app/globals.css */
@import "tailwindcss";

/* Theme customization */
@theme {
  --color-brand: #6366f1;
  --color-brand-light: #818cf8;
  --color-brand-dark: #4f46e5;
  --font-display: "Inter", sans-serif;
}
```

## v3 → v4 Breaking Changes (Critical)

### CSS Import Change
```css
/* ❌ v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ v4 */
@import "tailwindcss";
```

### Ring Width Default Changed
```html
<!-- ❌ v3: ring = 3px -->
<button class="ring ring-blue-500">

<!-- ✅ v4: ring = 1px, use ring-3 for v3 behavior -->
<button class="ring-3 ring-blue-500">
```

### Shadow/Radius/Blur Scale Renamed
```html
<!-- ❌ v3 names -->
<div class="shadow-sm rounded-sm blur-sm">

<!-- ✅ v4 names -->
<div class="shadow-xs rounded-xs blur-xs">
<!-- shadow-sm in v4 = what was shadow in v3 -->
```

### outline-none Changed
```html
<!-- ❌ v3: outline-none set outline-color transparent + outline-offset 2px -->
<!-- ✅ v4: outline-none sets outline-style: none -->
<!-- Use outline-hidden for v3 behavior -->
<button class="focus:outline-hidden">
```

### Default Border Color Changed
```html
<!-- ❌ v3: border defaults to gray-200 -->
<div class="border">

<!-- ✅ v4: border defaults to currentColor — always specify color -->
<div class="border border-gray-200">
```

### CSS Variable Syntax Changed
```html
<!-- ❌ v3 arbitrary value with CSS var -->
<div class="bg-[--brand-color]">

<!-- ✅ v4 uses parentheses -->
<div class="bg-(--brand-color)">
```

### Hover Variant Updated
```html
<!-- v4: hover variant includes @media (hover: hover) check -->
<!-- Touch devices won't trigger hover states — this is correct behavior -->
<button class="hover:bg-blue-600">
```

### Variant Stacking Order Changed
```html
<!-- v4: variants apply left-to-right (was right-to-left in v3) -->
<div class="dark:group-hover:bg-blue-500">
<!-- v4: applies dark THEN group-hover -->
<!-- v3: applied group-hover THEN dark -->
```

## @utility Directive (New in v4)

```css
/* Define custom utilities with automatic variant support */
@utility text-shadow-sm {
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.15);
}

@utility text-shadow-md {
  text-shadow: 0 2px 4px rgb(0 0 0 / 0.15);
}

@utility scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

Usage:
```html
<!-- All variants work automatically -->
<h1 class="text-shadow-sm hover:text-shadow-md dark:text-shadow-md">
  Title
</h1>
```

## @custom-variant Directive (New in v4)

```css
/* Define custom variants */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));
@custom-variant theme-ocean (&:where([data-theme="ocean"] *));
```

Usage:
```html
<div data-theme="midnight">
  <p class="theme-midnight:text-white theme-ocean:text-blue-100">
    Themed text
  </p>
</div>
```

## Dark Mode

### Option 1: Media Query (default)
```html
<!-- Automatically uses prefers-color-scheme -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-gray-100">Content</p>
</div>
```

### Option 2: Class-based Toggle
```css
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark *));
```

```typescript
// Theme toggle component
'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <button onClick={() => setIsDark(!isDark)}>
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
```

## @theme Block (Replaces tailwind.config.js)

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #6366f1;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-destructive: #ef4444;
  --color-border: #e2e8f0;
  --color-background: #ffffff;
  --color-foreground: #0f172a;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Spacing */
  --spacing-page: 2rem;
  --spacing-section: 4rem;

  /* Border Radius */
  --radius-lg: 0.75rem;
  --radius-md: 0.5rem;
  --radius-sm: 0.25rem;
}
```

Usage:
```html
<div class="bg-primary text-primary-foreground rounded-lg p-page">
  <h2 class="font-sans">Heading</h2>
  <code class="font-mono">Code</code>
</div>
```

## @apply in v4

```css
/* In component-scoped stylesheets, requires @reference */
@reference "../../app/globals.css";

.custom-button {
  @apply rounded-lg bg-primary px-4 py-2 text-primary-foreground;
}
```

## cn() Utility Pattern

```typescript
// src/lib/utils.ts — already in scaffold
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage in components
import { cn } from '@/lib/utils'

function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg px-4 py-2 font-medium',
        variant === 'primary' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'ghost' && 'hover:bg-muted',
        className // allow override from parent
      )}
      {...props}
    />
  )
}
```

## Common Patterns

### Responsive Design
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

### Animation
```html
<div class="transition-colors duration-200 hover:bg-muted">
  Hover me
</div>

<div class="animate-pulse rounded bg-muted h-4 w-32">
  <!-- Skeleton -->
</div>
```

### Container
```html
<!-- v4: container no longer auto-centers — add mx-auto -->
<div class="container mx-auto px-4">
  Content
</div>
```

## Rules

1. **v4 syntax only** — no `@tailwind` directives, use `@import "tailwindcss"`
2. **Always specify border color** — defaults to `currentColor` in v4
3. **Use `ring-3`** for v3-equivalent ring width
4. **Use `outline-hidden`** not `outline-none` for v3 focus behavior
5. **CSS variables use parentheses** — `bg-(--my-var)` not `bg-[--my-var]`
6. **Theme in CSS** — use `@theme` block, not `tailwind.config.js`
7. **cn() for conditionals** — never string concatenation for class logic
