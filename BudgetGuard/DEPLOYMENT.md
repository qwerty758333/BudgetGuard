\# BudgetGuard - Deployment Guide



\## Live Deployment (Netlify)



The app is automatically deployed on Netlify.



\*\*Live URL:\*\* https://budgetguard-\[your-id].netlify.app



\## How Deployment Works



1\. You push code to GitHub (main branch)

2\. Netlify automatically detects the push

3\. Netlify runs: `npm run build`

4\. Netlify uploads `dist/` folder to live server

5\. Your changes are live (usually within 1-2 minutes)



\## Checking Deployment Status



1\. Go to: https://app.netlify.com

2\. Find your "budgetguard" site

3\. Look at recent deployments

4\. Green checkmark = Successfully deployed

5\. Red X = Build failed (check logs)



\## Deployment Checklist



Before pushing to main:



\- \[ ] Code works in local dev (npm run dev)

\- \[ ] No console errors in DevTools

\- \[ ] Production build works (npm run build succeeds)

\- \[ ] No merge conflicts

\- \[ ] Committed all changes

\- \[ ] Ready for others to see!



\## If Deployment Fails



1\. Check Netlify build logs

2\. Look for error messages

3\. Common issues:

&#x20;  - Missing dependencies (add to package.json)

&#x20;  - Build script errors (check vite.config.ts)

&#x20;  - TypeScript errors (check console)

4\. Fix locally, push again



\## Manual Deploy (If Needed)



If auto-deploy doesn't work:



1\. Create production build: `npm run build`

2\. Go to Netlify dashboard

3\. Find your site

4\. Drag `dist/` folder onto the deploy area

5\. Wait for upload to complete





