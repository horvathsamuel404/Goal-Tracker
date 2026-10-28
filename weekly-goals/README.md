# Weekly Goals

A personal weekly goal tracker, built as a Progressive Web App with React, TypeScript and Vite.

**Status: step 1 of 3, an installable shell.** It shows the calendar-style week view
(Sunday to Saturday, real dates, today highlighted, week arrows, tabs). Goals are not saved yet.

## Deploy with Vercel

1. Create a new repository on GitHub and upload everything in this folder
   (the files themselves, not the .zip).
2. On vercel.com, sign in with GitHub, choose **Add New > Project**, and pick the repository.
   Vercel detects Vite. Keep the defaults (build command `npm run build`, output folder `dist`) and deploy.
3. Open the `.vercel.app` address in **Safari** on your iPhone, tap **Share**, then
   **Add to Home Screen**. The app opens full-screen like a native app.

Every time you push a change to GitHub, Vercel redeploys automatically.

## Run on a computer (optional)

Needs Node 20.19+ or 22.12+.

```
npm install
npm run dev
```

## What is where

- `src/App.tsx` the screens (week view, history placeholder, tab bar)
- `src/index.css` the look (colors, spacing, safe areas for the iPhone notch and home bar)
- `vite.config.ts` the PWA setup (manifest, service worker, offline caching)
- `index.html` the iPhone meta tags (full-screen mode, home screen name and icon)
- `public/` the app icons

## Next steps

2. Database and login (Supabase), then adding goals to a day and marking them done or failed.
3. Editing and moving goals, History and Past week, offline polish.
