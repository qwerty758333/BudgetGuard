

\# BudgetGuard - Developer Setup Guide



\## Prerequisites



Make sure you have these installed on your computer:



\- \*\*Node.js 16+\*\* (check with: `node --version`)

&#x20; - Download from: https://nodejs.org/

&#x20; - Recommended: LTS (Long Term Support) version



\- \*\*npm 8+\*\* (check with: `npm --version`)

&#x20; - Usually comes with Node.js

&#x20; - If not, update with: `npm install -g npm`



\- \*\*Git\*\* (check with: `git --version`)

&#x20; - Download from: https://git-scm.com/



\## Installation Steps



\### 1. Clone the Repository



```bash

git clone https://github.com/\[YOUR\_USERNAME]/budgetguard.git

cd budgetguard

```



\### 2. Install Dependencies



```bash

npm install

```



This downloads all required packages. Takes 1-3 minutes.



\### 3. Start Development Server



```bash

npm run dev

```



Then open your browser to: `http://localhost:5173`



You should see the Vite welcome page with a React logo.



\## Development Workflow



\### Working on Features



1\. Create a feature branch:

&#x20;  ```bash

&#x20;  git checkout -b feat/feature-name

&#x20;  ```



2\. Make your changes in the code



3\. Commit your changes:

&#x20;  ```bash

&#x20;  git add .

&#x20;  git commit -m "feat: description of what you built"

&#x20;  ```



4\. Push to GitHub:

&#x20;  ```bash

&#x20;  git push origin feat/feature-name

&#x20;  ```



5\. Create a Pull Request on GitHub



\### Building for Production



```bash

npm run build

```



This creates an optimized `dist/` folder.



\### Testing Production Build



```bash

npm run preview

```



Then open browser to: `http://localhost:4173`



Should look identical to dev version.



\## Project Structure



```

budgetguard/

├── src/

│   ├── components/        # React components

│   ├── utils/            # Utility functions

│   ├── hooks/            # Custom React hooks

│   ├── App.tsx           # Main app component

│   ├── main.tsx          # App entry point

│   └── index.css         # Global styles

├── public/               # Static files

├── package.json          # Dependencies \& scripts

├── vite.config.ts        # Vite configuration

├── tailwind.config.ts    # Tailwind configuration

└── README.md             # Project overview

```



\## Tech Stack



\- \*\*React 18\*\* - UI library

\- \*\*TypeScript\*\* - Type safety

\- \*\*Tailwind CSS\*\* - Styling

\- \*\*Vite\*\* - Build tool

\- \*\*Recharts\*\* - Charts library

\- \*\*Framer Motion\*\* - Animations



\## Useful Commands



```bash

npm run dev       # Start development server

npm run build     # Create production build

npm run preview   # Test production build

npm install       # Install dependencies

git status        # See current changes

git log           # See commit history

```



\## Troubleshooting



\*\*Q: `npm install` fails\*\*

A: Try `npm install --legacy-peer-deps`



\*\*Q: Port 5173 already in use\*\*

A: Change port: `npm run dev -- --port 3000`



\*\*Q: Git config error\*\*

A: Set up git first:

```bash

git config --global user.name "Your Name"

git config --global user.email "your.email@example.com"

```



\*\*Q: Still stuck?\*\*

A: Ask in Slack! 📢



\## Deployment



The app is deployed on Netlify. 



\*\*Automatic deployment:\*\*

\- Push to main branch

\- Netlify automatically builds and deploys

\- Check https://app.netlify.com for status



\*\*Live URL:\*\* https://budgetguardbuildathon.netlify.app/

