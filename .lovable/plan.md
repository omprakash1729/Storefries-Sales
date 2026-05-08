## Storefries Cold Calling Sales Dashboard

A modern, editable CRM-style outbound sales dashboard branded with the Storefries logo, using the #88bf74 → #0073c8 gradient. Built as a multi-route TanStack Start app with all data seeded from the provided accounts list and persisted to localStorage during runtime.

### Brand & Design System
- Update `src/styles.css` with brand tokens:
  - `--brand-green: #88bf74`, `--brand-blue: #0073c8`
  - `--gradient-primary: linear-gradient(135deg, #88bf74, #0073c8)` for buttons/accents
  - Soft surfaces, rounded-xl cards, subtle shadows, sticky header
- Add Storefries logo + favicon to `public/` and reference in `__root.tsx` head
- Status badge tokens: prospect (slate), demo (blue), trial (amber), rejected (rose)

### Routes
```
src/routes/
  __root.tsx        sticky header (logo, title, month filter, date, "Save Source"), sidebar nav
  index.tsx         Dashboard: KPI strip, summary cards, funnel chart, rep performance, industry analytics
  accounts.tsx      Editable account table: search, filters, inline edit, add/delete, export CSV/XLSX
  rejected.tsx      Rejected accounts dashboard with reasons breakdown
  analytics.tsx     Deeper industry + rep analytics with charts
```

### Data Layer
- `src/lib/accounts-data.ts` — seed array (full provided dataset, ~200 rows)
- `src/lib/accounts-store.ts` — Zustand store with localStorage persistence
  - State: accounts[], reps[], globalMonth, filters
  - Actions: add/update/delete account, add rep, setMonth, setFilters
  - Derived selectors: KPIs, funnel counts, by-industry, by-rep, rejected
- Account model: `{ id, name, owner, industry, month, status, reason }`
- Status enum: `prospect | demo | trial | rejected`
- Default reps seeded from data: Bhuvaneshwari, Omprakash, Aswini (with color themes)

### Dashboard (index)
- KPI strip (6 cards): Total accounts, Prospects, Demos, Trials, Rejected, Conversion %
- Summary metric cards with progress bars (animated, hover lift)
- Conversion Funnel — Chart.js horizontal funnel: Prospect → Demo → Trial → (Rejected sidebar) with % drop-off
- Top Rep Performance — list with avatar initials, color theme, account count, demo/trial/reject split, efficiency bar
- Industry Analytics — grid of industry cards (count + scrollable account list + rep dots)

### Accounts Page
- Toolbar: search input (name/owner/industry), status filter, industry filter, month filter, "Add Account" gradient button, Export dropdown (CSV / XLSX)
- Table rows: company, industry, owner (inline select), month, status (inline badge dropdown), delete
- Add Account modal (Dialog): name, industry, owner, status, month — validated
- Add Sales Rep modal: name + color theme picker (blue/green/amber/teal/purple/red)
- Export uses `xlsx` package — exports current filtered view or all

### Rejected Page
- KPI: total rejections, top reason, top industry, top rep
- Bar chart: rejections by industry
- Table: rejected accounts with reason text, owner, industry, month

### Analytics Page
- Industry distribution doughnut chart
- Rep performance bar chart (stacked by status)
- Month comparison (April 2026 vs Feb–March 2026)

### Header Features
- Logo + "Storefries Sales" title + "Outbound Sales Department" subtitle
- Global month dropdown (drives store.globalMonth — affects every page)
- Live current date (locale formatted)
- "Save Source" button — downloads a JSON snapshot of current accounts + reps as `storefries-data-{date}.json` (downloading actual TSX source is impractical in a built app; snapshot is the practical equivalent)

### Tech
- TanStack Start (existing), Tailwind v4, shadcn/ui (Card, Dialog, Select, Input, Button, Badge, Table, DropdownMenu)
- `chart.js` + `react-chartjs-2` for funnel/bar/doughnut
- `xlsx` for Excel export
- `zustand` + `zustand/middleware/persist` for state + localStorage

### Implementation Order
1. Install deps (chart.js, react-chartjs-2, xlsx, zustand), copy logo/favicon to public, update styles.css tokens
2. Build store + seed data
3. Header + sidebar layout in `__root.tsx`
4. Dashboard page with KPIs, funnel, rep performance, industry analytics
5. Accounts page with editable table, modals, export
6. Rejected + Analytics pages
7. QA: filtering reactivity, inline edits persist, exports work
