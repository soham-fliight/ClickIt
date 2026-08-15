# ClickIt

A WorkJam-class workforce app for supermarket floors: **rosters, shift offers, clocks, leave, and real permissions** — with a UI that does not feel like UKG Pro.

Demo tenant is **Northside Fresh** (Bondi Junction, Newtown Metro, Parramatta). Walk the store as any role from the home screen.

## Why this exists

Woolworths-style retailers already had a floor app people understood (WorkJam). Switching the living roster to UKG Pro typically means:

- a desktop-era timesheet UI on a phone
- shift swaps buried under approvals nobody can find
- permissions that are checkboxes, not jobs
- integrations that are “a CSV, good luck”

ClickIt is the opposite: mobile-first for the floor, a clean week roster for leads, and an integration hub that names the objects it actually syncs.

## What you can do

| Area | Behaviour |
| --- | --- |
| **Today** | Next shift, clock in, tasks, store news |
| **My roster** | Published week only — drafts stay with managers |
| **Team roster** | Department / store / area views, coverage chips, publish |
| **Shift market** | Open claims (instant), giveaways & swaps (lead approval) |
| **Clock** | In / break / out, geofence copy, award-split timesheet |
| **Availability** | Preferred windows + leave requests |
| **Approvals** | Two-button queue for swaps and leave |
| **Team / news / tasks** | Directory, feed, floor checklists |
| **Integrations** | UKG Pro import, Xero, MYOB, Entra ID, calendars, Slack, POS, Fair Work award engine |
| **Permissions** | Eight roles, named grants, visible matrix |

### Roles

Team member · Team lead · Department manager · Store manager · Area manager · People & culture · Payroll · Admin

Switch anyone from the header. The nav and the buttons change with the role.

### Shift rules (enforced)

- You can only give away **your** shift
- Claims check **qualification**, **store**, and **clashes**
- Open shifts assign immediately; giveaways/swaps wait for `shifts.approve`
- Team leads can only approve **their department**
- Publish is `schedule.publish` only

Award splits follow a simplified **General Retail Industry Award**: evening after 6pm, Saturday +25%, Sunday +50%. Nightfill can run through midnight as one shift.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- In-memory demo store (refresh-safe via Reset)
- Vitest for permission + shift-engine rules

## Run

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Start as **Alex Chen** (checkout) and claim the Saturday closer, then switch to **Priya Nair** (store manager) and approve Mei’s swap.

```bash
npm run build
npm run lint
```

## Integrations in the demo

These are product-complete connectors (status, objects, direction, sync log) ready to hang real adapters on:

1. **UKG Pro WFM** — import residual schedules, punches, employee numbers
2. **Xero Payroll** / **MYOB** — award-coded timesheet export
3. **Microsoft Entra ID** — SSO for salaried roles
4. **Google / Outlook Calendar** — published shifts only
5. **Slack / Teams** — open-shift pings
6. **Store timeclock / POS** — kiosk punches
7. **Fair Work award engine** — GRIA splits on every shift

No production secrets are required. The demo is self-contained.
