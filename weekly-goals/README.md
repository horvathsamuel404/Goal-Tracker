# Weekly Goals

A personal weekly goal tracker, built as a Progressive Web App with React, TypeScript and Vite.

**Status: step 2 of 3.** Sign in with email and password, add goals to any day of the week,
and mark them done or failed. Goals are saved in Supabase.

## Set up Supabase (once)

1. **Create the table.** In Supabase, open **SQL Editor > New query**, paste everything from
   `supabase/schema.sql`, and click **Run**.
2. **Turn off email confirmation.** Go to **Authentication > Sign In / Providers > Email**,
   switch off **Confirm email**, and save. (Supabase's built-in emails only contain a link,
   which would open in Safari instead of the home screen app.)
3. **Get your keys.** In **Project Settings > Data API** copy the Project URL, and in
   **Project Settings > API Keys** copy the publishable key (`sb_publishable_...`;
   the older `anon` key also works).
4. **Add them to Vercel.** In Vercel, open the project > **Settings > Environment Variables** and add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Then redeploy
   (Deployments > latest > Redeploy) so the app picks them up.
5. **For running on a computer**, copy `.env.example` to `.env.local` and fill in the same two values.

Then open the app, tap **Create account**, and pick an email and password.

## Deploy with Vercel

1. Create a new repository on GitHub and upload everything in this folder
   (the files themselves, not the .zip).
2. On vercel.com, sign in with GitHub, choose **Add New > Project**, and pick the repository.
   Set **Root Directory** to `weekly-goals` (the app lives in that folder). Vercel detects Vite. Keep the defaults (build command `npm run build`, output folder `dist`) and deploy.
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

- `src/App.tsx` the screens (week view, goals, history placeholder, tab bar)
- `src/Login.tsx` the sign-in screen (email and password)
- `src/goals.ts` loading and saving goals
- `src/supabase.ts` the Supabase connection
- `supabase/schema.sql` the database table and access rules
- `src/index.css` the look (colors, spacing, safe areas for the iPhone notch and home bar)
- `vite.config.ts` the PWA setup (manifest, service worker, offline caching)
- `index.html` the iPhone meta tags (full-screen mode, home screen name and icon)
- `public/` the app icons

## Next steps

3. Editing and moving goals, History and Past week, offline polish.
