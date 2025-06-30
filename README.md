# 🏠 ProperView – Real Estate Listing & Management Platform

![Build](https://github.com/chrismhale/properview/actions/workflows/deploy.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

ProperView is a modern full-stack application for real-estate agents and visitors to create, manage, and view property listings.

It is designed to be **cloud-native from day one**: the backend is a fully
serverless stack (AWS Lambda + API Gateway + DynamoDB) provisioned via SST
(`sst deploy`).  The frontend is a Next.js 14 app that is statically generated
at build time and served through CloudFront.  Both halves are developed in a
single monorepo and shipped together by the deployment script you'll see
below.

Key design goals

1.  **Zero-server ops** – every compute component runs in Lambda; there are no
    containers or VMs to patch.
2.  **Predictable DX** – `npm test`, `npm run lint`, and `npm run build` work in
    every workspace; deploy is **one command**.
3.  **Windows friendly** – the repo builds on native Windows *and* WSL.  (For
    final production deploys we recommend WSL because OpenNext's image
    optimization bundle requires Linux binaries.)
4.  **100 % type safety** – strict TypeScript everywhere, shared DTOs, and end-to-end tests in Playwright/Jest.

---

## 🚀 Features

- Agent Dashboard (CRUD for listings)
- Public Listings with filters
- Inquiry Submission Form
- Animated UI transitions (Framer Motion)
- Toast-based notifications and error handling
- Protected routes with mock authentication
- Delete confirmation modals
- Reusable UI components (`<Input>`, `<Button>`, etc.)
- Responsive layouts with Tailwind CSS
- Pre-commit checks and CI enforcement

---

## 🧱 Architecture Overview

```
Frontend (Vite + React) ─▶ CloudFront ─▶ S3 Static Hosting
                                  │
API Calls                         ▼
React Hooks         ─────▶ API Gateway ─▶ Lambda ─▶ DynamoDB
```

- **Frontend:** Vite, React, TypeScript, Tailwind, Framer Motion, Jest
- **Backend:** AWS Lambda (Node.js), API Gateway, DynamoDB
- **Infra:** CDK (CloudFront, S3, DynamoDB, API Gateway, IAM)
- **CI/CD:** GitHub Actions, Jest, ESLint, Prettier, Husky

---

## 🖼 Demo Screenshots

| Agent Dashboard | Public Listings | Inquiry Form |
| --------------- | --------------- | ------------ |
|                 |                 |              |

> Add your screenshots to `docs/screenshots/` and replace with correct image paths.

---

## 🛠 Local Development & Deployment

### 0. Prerequisites

| Tool | Version | Notes |
| ---- | ------- | ----- |
| **Node.js** | 20.x LTS | Use `nvm` or `fnm` to switch versions. |
| **npm** | ≥ 10 | Comes with Node 20 – or install `pnpm` if you prefer. |
| **Git** | ≥ 2.34 | |
| **AWS credentials** | any | `~/.aws/credentials` profile with deploy rights (S3, Lambda, CloudFront, DynamoDB, IAM). |
| **WSL 2** (Windows) | optional but recommended | Reduces friction with OpenNext image-opt bundle. |


### 1. Clone & bootstrap repo

```bash
git clone https://github.com/chrismhale/properview.git
cd properview

# Install root-level dev tools & workspaces
npm ci         # or pnpm i / yarn

# Install per-workspace deps (they are isolated)
npm run install:all   # wrapper that calls `npm ci` in /web and /infra
```

### 2. Environment variables

Create `.env.local` in `web/` (already in `.gitignore`):

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000          # during dev
DYNAMODB_TABLE_NAME=ProperViewTable
# any other secrets
```

### 3. Run everything locally (hot reload)

```bash
# in one shell
npm run dev:web              # starts Next.js on http://localhost:3000

# in another shell
sst dev                      # runs API + DynamoDB Local + exposes env vars
```

The frontend picks up the mock API URL automatically via `NEXT_PUBLIC_API_URL`.

### 4. Tests & linting

```bash
npm test             # jest + react-testing-library + vitest
npm run lint         # ESLint + prettier
```

### 5. Production-like build (optional)

```bash
cd web
npm run build        # next build – ensures static generation succeeds
cd ..
```

### 6. Full cloud deploy (AWS)

```bash
# If you are on Windows **use WSL** for this step to avoid OpenNext binary issues
wsl
cd /mnt/c/Users/you/sites/properview   # adjust path

./scripts/deploy-all.sh                # ⏳ provisions everything in ~5 minutes
```

The script performs:

1.  `sst deploy` – builds the Next.js app with OpenNext, packages Lambda
    functions, and creates/updates all AWS resources.
2.  Prints the CloudFront URL on success.

You can redeploy safely; unchanged resources are skipped.

---

## 🧪 Testing & Coverage

### Frontend

```bash
cd client
npm run test        # Includes unit + integration
npm run format:check
npm run lint
```

### Backend

```bash
cd backend
npm run test
npm run format:check
npm run lint
```

> ✅ Thresholds enforced: 90%+ lines, branches, functions

---

## 📦 CDK Outputs

- S3 Bucket (static site)
- CloudFront Distribution
- API Gateway URL
- DynamoDB Table

---

## 🔐 Mock Authentication

- Simulated agent login using static token:

```ts
Authorization: Bearer agent-token-123
```

- Protected routes (Agent Dashboard) require login

---

## 📬 Inquiry Submission

- Public users can fill out a form
- Data is stored in `Inquiries`