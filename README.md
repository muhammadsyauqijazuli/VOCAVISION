# VOCAVISION - Vocational Student Predictive Analytics

VOCAVISION is a vocational student predictive analytics platform for early risk detection, performance insight, and academic intervention.

---

## Project Links

- Local app: http://localhost:3000
- Backend API: http://localhost:5000

## Quick start

You'll need Node.js installed. Then:

Install dependencies — pick your poison:

```bash
npm install
# or: yarn / pnpm install / bun install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're good.

## Deploying

Works out of the box on Vercel and Netlify.

## Notes

This workspace ships with a Flask backend and a Next.js frontend. Use the backend README for API and database setup details.

## Update Logs

### Version 1.3.0 - [April 30, 2026]

- Update Tailwind CSS to v4 and update dependencies.
- Added new authentication pages.
- Updated to latest Next.js
- Implemented authentication with BetterAuth and Prisma.
- Configured Role-Based Access Control (RBAC).
- Added user profile data mutations and queries in profile and settings pages.

### Development Progress - [June 02, 2026]

- Frontend: Redesigned sign-in landing page (responsive, 100vh hero, merged info sections).
- Frontend: Implemented `Guru` (teacher) Dashboard UI with live data integration.
  - Server page now fetches `/api/dashboard/stats` and `/api/students` and passes props to a client component.
  - Added `src/app/(with-layout)/guru/dashboard/_components/teacher-dashboard.tsx` and updated `page.tsx` to use real backend data.
  - Charts use Recharts; summary cards and alerts table show live counts and top-risk students.
- Repo hygiene: Added `.gitignore` entries for Python caches and virtualenvs; removed tracked `__pycache__` and `.pyc` files.

If you want more detail on any of these items (files changed, API contracts, or how to run the backend), tell me which area to expand.

### Version 1.2.3 - [Mar 16, 2026]

- Update Next.js to ^16.1.6 and configure image qualities

### Version 1.2.2 - [December 01, 2025]

- Updated to Next.js 16
- Updated dependencies.

### Version 1.2.1 - [Mar 20, 2025]

- Fix Peer dependency issues and NextConfig warning.
- Updated apexcharts and react-apexhcarts to the latest version.

### Version 1.2.0 - Major Upgrade and UI Improvements - [Jan 27, 2025]

- Upgraded to Next.js v15 and updated dependencies
- API integration with loading skeleton for tables and charts.
- Improved code structure for better readability.
- Rebuilt components like dropdown, sidebar, and all ui-elements using accessibility practices.
- Using search-params to store dropdown selection and refetch data.
- Semantic markups, better separation of concerns and more.

### Version 1.1.0

- Updated Dependencies
- Removed Unused Integrations
- Optimized App

### Version 1.0

- Initial Release - [May 13, 2024]
