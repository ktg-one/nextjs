---
name: frontend-design
description: "Frontend design patterns for production-grade UI. shadcn/ui component library, layout patterns, accessibility, responsive design, animation. Used by cs-frontend-dev agent."
user-invocable: false
---

# Frontend Design Patterns

> Component library: shadcn/ui. Styling: Tailwind CSS v4. Icons: Lucide React.

## shadcn/ui Component Library

shadcn/ui provides copy-paste components built on Radix UI + Tailwind CSS. Components live in `src/components/ui/` and are fully customizable.

### Available Components (46)
Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, ContextMenu, DataTable, DatePicker, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Skeleton, Slider, Sonner (toast), Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip

### Installation (via MCP or CLI)
```bash
# Install individual components
npx shadcn@latest add button
npx shadcn@latest add card dialog form input label

# Or use shadcn/ui MCP for component details and code
```

### Component Composition Pattern
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginCard() {
  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="name@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign in</Button>
      </CardFooter>
    </Card>
  )
}
```

## Layout Patterns

### App Shell
```typescript
// src/app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r lg:block">
        <Sidebar />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Navbar />
        </header>
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Marketing Shell
```typescript
// src/app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <MarketingNav />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8">
        <Footer />
      </footer>
    </div>
  )
}
```

### Page Header Pattern
```typescript
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
```

### Grid Layouts
```typescript
// Responsive card grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => <Card key={item.id} {...item} />)}
</div>

// Dashboard stat grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatCard title="Revenue" value="$45,231" change="+20.1%" />
  <StatCard title="Users" value="2,350" change="+18.2%" />
  <StatCard title="Orders" value="1,234" change="+4.1%" />
  <StatCard title="Conversion" value="3.2%" change="-0.4%" />
</div>
```

## Responsive Design

### Breakpoints (Tailwind v4)
| Prefix | Min Width | Target |
|--------|-----------|--------|
| `sm:` | 640px | Large phones landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

### Mobile-First Pattern
```html
<!-- Always start mobile, add breakpoints up -->
<nav class="flex flex-col gap-2 md:flex-row md:gap-4">
  <a class="text-sm md:text-base">Home</a>
  <a class="text-sm md:text-base">About</a>
</nav>

<!-- Show/hide by breakpoint -->
<button class="md:hidden">Menu</button>  <!-- mobile only -->
<nav class="hidden md:flex">Links</nav>  <!-- desktop only -->
```

## Accessibility (WCAG 2.1 AA)

### Required Patterns
```typescript
// 1. All interactive elements need accessible labels
<Button aria-label="Close dialog">
  <XIcon className="h-4 w-4" />
</Button>

// 2. Form fields need associated labels
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" aria-describedby="email-help" />
  <p id="email-help" className="text-sm text-muted-foreground">
    We'll never share your email.
  </p>
</div>

// 3. Focus management — visible focus rings
<button className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
  Click me
</button>

// 4. Color contrast — minimum 4.5:1 for text, 3:1 for large text
// Use text-foreground on background, text-muted-foreground for secondary

// 5. Announce dynamic content
<div role="status" aria-live="polite">
  {isPending && 'Loading...'}
</div>
```

### Keyboard Navigation
```typescript
// Radix UI (shadcn/ui base) handles keyboard nav automatically
// Dialog: Escape to close, Tab trap
// Dropdown: Arrow keys, Enter to select, Escape to close
// Tabs: Arrow keys to switch, Tab to enter/exit

// Custom keyboard handling when needed
function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleAction()
  }
}
```

## Animation Patterns

### Micro-interactions
```html
<!-- Hover transitions -->
<button class="transition-colors duration-150 hover:bg-primary/90">

<!-- Scale on press -->
<button class="transition-transform active:scale-95">

<!-- Fade in -->
<div class="animate-in fade-in duration-200">
```

### Loading States
```typescript
// Skeleton loading (matches shadcn/ui)
function CardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-20 animate-pulse rounded bg-muted" />
    </div>
  )
}

// Spinner
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
```

## Icons (Lucide React)

```typescript
import { Search, Plus, ChevronRight, Settings, User, LogOut } from 'lucide-react'

// Consistent sizing
<Search className="h-4 w-4" />           // in buttons, inputs
<Settings className="h-5 w-5" />          // in nav items
<ChevronRight className="h-3 w-3" />      // in breadcrumbs

// With text
<Button>
  <Plus className="mr-2 h-4 w-4" />
  New Item
</Button>
```

## Color System (Design Tokens)

```css
/* Standard shadcn/ui color tokens in @theme */
@theme {
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-card: #ffffff;
  --color-card-foreground: #0f172a;
  --color-primary: #0f172a;
  --color-primary-foreground: #f8fafc;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-accent: #f1f5f9;
  --color-accent-foreground: #0f172a;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #f8fafc;
  --color-border: #e2e8f0;
  --color-input: #e2e8f0;
  --color-ring: #0f172a;
}
```

### Usage
```html
<div class="bg-background text-foreground">
  <p class="text-muted-foreground">Secondary text</p>
  <button class="bg-primary text-primary-foreground">Action</button>
  <span class="border border-border rounded">Badge</span>
  <p class="text-destructive">Error message</p>
</div>
```

## Rules

1. **shadcn/ui first** — use library components before building custom
2. **Mobile-first** — start with mobile layout, add breakpoints up
3. **Accessible by default** — labels, focus rings, ARIA attributes
4. **Consistent spacing** — use Tailwind spacing scale, not arbitrary values
5. **Design tokens** — use semantic colors (primary, muted, destructive), not raw hex
6. **No layout shift** — set explicit dimensions on images, use skeleton loaders
7. **Radix UI keyboard nav** — shadcn/ui handles this; don't override with custom handlers
8. **Icon consistency** — Lucide React only, h-4 w-4 standard size
