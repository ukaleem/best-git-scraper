# RepoRadar — GitHub Intelligence & Repo Discovery Engine

A high-performance repository intelligence and discovery platform built for developers, indie hackers, and software agencies. RepoRadar scans trending open-source ecosystems, creator buzz, and GitHub activity to evaluate codebases for commercial viability, client deliverables, monetization potential, and turnkey fork blueprints.

---

## ⚡ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend API:** Node.js, Express, Google Gen AI SDK (`@google/genai` with Gemini 3.8 Flash)
- **Bundler & Build Tool:** Vite
- **Deployment Targets:** Local (Vite / Express), Vercel (Serverless Functions + Static CDN), Cloud Run, Docker

---

## 📋 Prerequisites

Before running the application, make sure you have:

1. **Node.js**: Version `18.0.0` or higher (`20.x` or `22.x` recommended).
   - Check your version: `node -v`
2. **Package Manager**: `npm` (comes with Node.js), `pnpm`, or `bun`.
3. **Google Gemini API Key**:
   - Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
4. **(Optional) GitHub Personal Access Token**:
   - GitHub allows 60 unauthenticated requests/hour per IP. Adding a token increases this limit to 5,000 requests/hour.

---

## 💻 Local Development Setup

### 1. Clone or Extract the Project

```bash
# If cloned via Git:
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your editor and provide your Gemini API key:

```env
# Required for AI Deep Search and Repository Audits
GEMINI_API_KEY="AIzaSyYourActualKeyHere"

# Optional: Increases GitHub API rate limits from 60 to 5,000 requests/hour
# GITHUB_TOKEN="ghp_yourPersonalAccessTokenHere"
```

### 4. Run the Local Development Server

```bash
npm run dev
```

- The app will start at: **`http://localhost:3000`**
- In development mode, Vite serves the frontend and automatically proxies `/api/*` calls through the integrated Express API router.

### 5. (Optional) Run the Production Build Locally

To test the compiled production build on your machine using the standalone Express server:

```bash
# 1. Compile the frontend assets into dist/
npm run build

# 2. Run the production Express server
npm start
```

Open **`http://localhost:3000`** in your browser.

---

## 🚀 Deploying to Production on Vercel

RepoRadar is pre-configured for instant deployment on [Vercel](https://vercel.com) using **`vercel.json`** and **`api/index.ts`**, which handles backend `/api/*` endpoints via Vercel Serverless Functions while serving the Vite frontend from Vercel's Edge CDN.

---

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to a Git provider**:
   - Push your project to GitHub, GitLab, or Bitbucket.

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **"Add New..."** > **"Project"**.
   - Select your Git repository and click **"Import"**.

3. **Configure Project Settings**:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (or `vite build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (default)

4. **Set Environment Variables**:
   Under the **Environment Variables** section, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio
   - `GITHUB_TOKEN`: *(Optional)* Your GitHub personal access token (recommended for production traffic to prevent rate limiting)

5. **Deploy**:
   - Click **"Deploy"**.
   - Vercel will build the frontend into `dist/`, provision `api/index.ts` as a Serverless Function, and generate your live production URL (e.g. `https://your-project.vercel.app`).

---

### Method 2: Deploy via Vercel CLI

1. **Install the Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Authenticate with Vercel**:
   ```bash
   vercel login
   ```

3. **Link and Deploy**:
   From your project root directory:
   ```bash
   vercel
   ```
   Follow the interactive prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account/team
   - Link to existing project? **N**
   - What's your project's name? `reporadar` (or press Enter)
   - In which directory is your code located? `./`
   - Want to modify settings? **N**

4. **Add Environment Variables to Vercel**:
   ```bash
   vercel env add GEMINI_API_KEY production
   # When prompted, paste your API key
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## ⚙️ How Vercel Configuration Works

The repository includes a ready-to-use **`vercel.json`**:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ]
}
```

- **Static Frontend**: Requests for pages, CSS, scripts, and assets are served directly from `dist/` by Vercel's global CDN.
- **Serverless API**: All requests to `/api/*` are routed to `/api/index.ts`, which boots the Express API router without exposing your `GEMINI_API_KEY` to the client browser.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key used for AI Deep Search across dev ecosystems and commercial repository audits. Get from [Google AI Studio](https://aistudio.google.com). |
| `GITHUB_TOKEN` | Optional | GitHub personal access token (classic or fine-grained with public read access). Raises GitHub API limit from 60 to 5,000 requests/hour. |
| `PORT` | Optional | Server port for standalone Node server (defaults to `3000`). |

---

## 📂 Project Structure

```
├── api/
│   └── index.ts               # Vercel Serverless Function entry point
├── public/                    # Static public assets
├── server/
│   ├── curatedRepos.ts        # Curated catalog of agency & dev-ready repos
│   ├── gemini.ts              # Gemini 3.8 Flash SDK client & timeout configuration
│   └── routes.ts              # Express API endpoints (/trending, /search, /deep-search, /analyze)
├── src/
│   ├── components/
│   │   ├── AnalysisModal.tsx      # Commercial viability & monetization auditor
│   │   ├── CustomAnalyzeModal.tsx # Custom URL inspector modal
│   │   ├── DeepSearchHeader.tsx   # Search bar, AI filters & discovery presets
│   │   ├── ForkModal.tsx          # GitHub CLI & clone quickstart blueprint
│   │   ├── RepoCard.tsx           # Repository card with agency metrics
│   │   └── SavedReposDrawer.tsx   # Agency pipeline & bookmarked repos drawer
│   ├── types.ts               # Shared TypeScript data models
│   ├── App.tsx                # Main application layout & state
│   ├── main.tsx               # React DOM entry point
│   └── index.css              # Tailwind CSS styles
├── server.ts                  # Standalone Express production server
├── vite.config.ts             # Vite configuration with embedded dev API middleware
├── vercel.json                # Vercel deployment & routing configuration
├── tsconfig.json              # TypeScript compiler configuration
└── package.json               # Project dependencies and npm scripts
```

---

## 🛠️ Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:3000` with hot-reload and API middleware. |
| `npm run build` | Builds optimized production static bundle into `dist/`. |
| `npm start` | Runs standalone Node/Express server serving production build on port `3000`. |
| `npm run lint` | Runs TypeScript compiler type-check (`tsc --noEmit`). |
| `npm run clean` | Cleans up previous build artifacts in `dist/`. |

---

## 🔍 Troubleshooting & FAQ

### 1. "AI Deep Search error: TypeError: fetch failed / Headers Timeout Error"
- This error occurs if the AI provider takes longer than the default network socket timeout. The server is configured with an extended 60-second timeout and fallback detection.
- Make sure your `GEMINI_API_KEY` is valid and has active quotas in Google AI Studio.

### 2. "API rate limit exceeded for IP"
- GitHub's public API limits unauthenticated IP requests to 60/hr. If you hit this limit, set the `GITHUB_TOKEN` environment variable in your `.env` or Vercel dashboard.

### 3. Vercel Serverless Function Timeout
- On Vercel Hobby accounts, Serverless Functions have a maximum execution duration of 15 seconds. If an AI search takes longer, the built-in fallback engine will return curated repos matching the query so the user never sees a broken screen. On Vercel Pro, you can configure `maxDuration: 60` in `vercel.json` if needed.

### 4. Port 3000 is already in use locally
- Specify an alternate port or terminate the existing process using port 3000:
  ```bash
  # On macOS/Linux:
  lsof -ti:3000 | xargs kill -9
  ```

---

## 📄 License

MIT License — Feel free to use, modify, fork, and deploy this application for personal or commercial agency projects.
