# Deployment Plan

Below is a detailed step-by-step plan to deploy your Finance Watcher project to the Internet using a set of 3 Managed Services: **Vercel (Frontend)**, **Render.com (Backend)**, and **Supabase/Neon (Database)**.

This model ensures you have a highly professional CI/CD (Continuous Integration and Deployment) pipeline while remaining completely free or as cost-effective as possible.

---

## Step 0: Prepare Source Code (GitHub Repo)

Since both Vercel and Render automatically pull code from GitHub, you need to push your monorepo project (`finance-watcher`) to a Repository on GitHub.

1.  Log into [GitHub](https://github.com/) and create a new repository named `finance-watcher`.
2.  Open a terminal at the root directory of your project (`d:\00_WORKSPACE\finance-watcher`).
3.  Execute the following git commands (if you haven't already):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/finance-watcher.git
    git push -u origin main
    ```

---

## Step 1: Initialize PostgreSQL Database (Supabase / Neon)

You need to have an online database first to get the connection string (`DATABASE_URL`), which will then be provided to the Backend (Render).

### Option A: Using Supabase (Recommended for its excellent management tools)
1.  Go to [Supabase.com](https://supabase.com/) and log in with your GitHub account.
2.  Click **"New Project"**.
3.  Select your Organization, enter a Project Name (e.g., `finance-watcher-db`), **Enter Database Password** (Note: SAVE this password securely, do not lose it).
4.  Choose the server Region closest to you (e.g., **Singapore**).
5.  Click **Create new project** (Wait 1-2 minutes for the database to be created).
6.  Go to **Project Settings (Gear icon) -> Database**.
7.  Scroll down to the **Connection String** section -> Select the **URI** tab.
8.  Copy that string. It will look like this: `postgresql://postgres.[id]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`. (Remember to replace `[YOUR-PASSWORD]` with the password you created in step 3).

### Important notes for Database:
*   You can use tools like **DBeaver** or Prisma Studio to connect to this online database and inspect the data.
*   You **DO NOT NEED** to run manual commands to create tables. The backend (Prisma) will do this automatically during deployment.

---

## Step 2: Deploy NestJS Backend (Render.com)

The Backend needs to be deployed first to get an API link, which the Frontend will then use for configuration.

1.  Go to [Render.com](https://render.com/) and create an account/log in via GitHub.
2.  Click **"New"** -> Select **"Web Service"**.
3.  Select **"Build and deploy from a Git repository"** -> Connect to your GitHub account and grant access to the `finance-watcher` repo.
4.  **Web Service Configuration on Render**:
    *   **Name**: `finance-watcher-api` (or any name you prefer).
    *   **Region**: Singapore (Same region as the Database for the fastest speed).
    *   **Branch**: `main`.
    *   **Root Directory**: `apps/api` (CRITICAL: Tells Render where the backend is located in the monorepo).
    *   **Environment**: `Node`.
    *   **Build Command**: `npm install && npx prisma generate && npm run build` (Render will install libraries, build Prisma Client, and build NestJS code).
    *   **Start Command**: Command to start the server with automatic DB migration to create tables if they don't exist: `npx prisma migrate deploy && node dist/main` (Or `npm run start:prod` depending on the web's package.json config).
5.  **Environment Variables Configuration**: Scroll down to the Variables section, and add the following:
    *   `DATABASE_URL`: Paste the Supabase/Neon connection string obtained in Step 1.
    *   `JWT_SECRET`: Enter a random, secret string (e.g., `super-secret-jwt-key`).
    *   `JWT_REFRESH_SECRET`: Enter another random, secret string.
    *   `PORT`: `3001` (Must match the app port).
6.  Click **Create Web Service**.
7.  Wait for Render to pull the code and build (about 2-5 minutes). Once successful, it will provide you with a Base URL, for example: `https://finance-watcher-api.onrender.com`.

*Note for Render's Free tier: If there's no web traffic for 15 minutes, the server will automatically go to "sleep". When someone accesses it again, it takes about 30s - 1 minute for the server to "wake up". The $7/month paid tier removes this sleep mode.*

---

## Step 3: Deploy Next.js Frontend (Vercel)

After the BE has a link (Base API URL), it's time to deploy the display web.

1.  Go to [Vercel.com](https://vercel.com/) and log in via GitHub.
2.  Click **"Add New" -> "Project"**.
3.  Select "Import" for the `finance-watcher` repository from GitHub.
4.  **Vercel Configuration**:
    *   **Project Name**: `finance-watcher-web`.
    *   **Framework Preset**: It will automatically detect **Next.js**.
    *   **Root Directory**: Click "Edit" and select the path `apps/web`.
5.  **Environment Configuration (Environment Variables)**:
    *   Create a variable named: `NEXT_PUBLIC_API_URL`
    *   The Value is the link from Render in step 2 plus `/api/v1` (since your backend app uses this prefix in main.ts). Example: `https://finance-watcher-api.onrender.com/api/v1`.
6.  Click **"Deploy"**.
7.  Vercel will automatically build the Next.js code (About 1-3 minutes).
8.  When finished, Vercel will show confetti and provide 1-2 `.vercel.app` links. You can attach your custom domain (.com, .vn) for free under the Settings -> Domains tab.

---

## Operations Flow Summary (CI/CD Flow)

From now on, whenever you want to upgrade the application version:

1.  Edit the code on your local computer.
2.  Save, commit and run: `git push origin main`.
3.  **All remaining tasks are automatic**:
    *   Vercel detects changes in `apps/web` -> Automatically builds and updates the User Interface.
    *   Render detects changes in `apps/api` -> Automatically builds and updates the Server, while Prisma also checks if any tables changed schemas to update the Database.

Absolutely NO need to ssh into a VPS, configure Nginx, install SSL certificates, restart pm2... Everything is Serverless & Managed!
