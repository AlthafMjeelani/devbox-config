---
name: admin-panel-dashboard-design
description: Design and build website admin panels, dashboards and control centers with a polished modern look and feel - layout shell, navigation, data tables, forms, charts, theming (light/dark), and states. Use for CMS/back-office/SaaS admin UIs.
---

# Admin Panel / Control Center Design

## Look and feel
- Calm, dense-but-breathable UI: neutral surfaces, one accent color, semantic colors (success/warn/danger/info) used sparingly.
- 4/8 px spacing scale, 8-12 px radii, subtle 1 px borders over heavy shadows, one type family (Inter/Geist) with tabular numbers for data.
- Light and dark themes from CSS variables / design tokens (shadcn/ui, Radix, Tailwind; Material 3 for Flutter web).

## App shell
- Left sidebar (collapsible to icons, grouped sections, active state, role-filtered items), top bar (breadcrumbs, global search / command palette `Cmd+K`, notifications, theme toggle, user menu).
- Content max-width for forms; full-width for tables. Responsive: sidebar becomes a drawer below 1024 px.

## Core screens
1. **Overview dashboard**: KPI cards (value, delta, sparkline), 1-2 primary charts, recent activity, quick actions. Max ~6 widgets above the fold.
2. **List views**: server-side paginated/sortable/filterable data table (TanStack Table), column visibility, saved filters, bulk actions, row actions menu, CSV export, sticky header.
3. **Detail/edit**: tabs or sections, inline validation (React Hook Form + Zod), sticky save bar, unsaved-changes guard, audit/history tab.
4. **Settings, users and roles**: RBAC matrix, invite flow, API keys with copy-once reveal.
5. **Auth pages**: login, MFA, reset - minimal and centered.

## States (never skip)
Loading skeletons matching layout, empty states with a clear action, error states with retry, optimistic updates with toasts, destructive actions behind a confirm dialog naming the target.

## Charts
Pick the simplest chart (line for trend, bar for compare, no 3D/pie with >5 slices); label axes and units, accessible colors, tooltips, responsive.

## Quality checklist
Keyboard navigable, visible focus, contrast >= 4.5:1, aria labels on icon buttons, 44 px touch targets on mobile, no layout shift, consistent date/number/currency formats, permission checks enforced server-side. Test with Playwright / the `webapp-testing` skill and review with `design-review`.

## Related skills
`ui-ux-pro-max`, `design-system`, `shadcn`, `web-design-guidelines`, `react-state-and-query`, `auth-and-identity`, `fullstack-type-safety`.
