# 📌 ProperView Project Planning

## 🧭 Project Overview

ProperView is a full-stack real estate listing and management platform. It allows agents to manage their property listings and visitors to browse active listings and submit inquiries. The stack uses AWS serverless services for the backend and Vite + React for the frontend.

## 🎯 Goals

- Build a production-grade full-stack application
- Use AWS Lambda, API Gateway, DynamoDB, and CloudFront
- Achieve 100% test coverage
- Follow coding rules in `RULES.md`
- Enable CI/CD with GitHub Actions

## ⚙️ Tech Stack

- **Frontend:** React (TypeScript) + Vite
- **Backend:** Node.js (TypeScript) with AWS Lambda via AWS SAM
- **Database:** Amazon DynamoDB
- **API Gateway:** REST endpoints for CRUD operations and inquiries
- **CDN/Hosting:** S3 + CloudFront
- **CI/CD:** GitHub Actions for test + deploy

## 🗂️ Folder Structure

```
/ (root)
├── client/              # Frontend Vite app
├── backend/             # AWS Lambda handlers + SAM templates
│   └── functions/       # Separate Lambda functions
├── infra/               # Infra templates (e.g., CloudFront + S3 config)
├── tests/               # Unit + integration tests
│   ├── client/
│   └── backend/
├── scripts/             # DB seeding and automation scripts
├── docs/                # Docs and planning
├── PLANNING.md
├── TASKS.md
├── RULES.md
├── README.md
```

## ✅ Features

- Agent dashboard (simulate login via static token)
- Public listings browser
- Inquiry submission
- Full CRUD for properties
- DynamoDB seed script

## 🔐 Auth Simulation

- Login as "agent" using a static bearer token (e.g., `Authorization: Bearer agent-token-123`)
- Middleware will simulate agent access using this token

## 🧪 Testing Strategy

- **100% unit test coverage required**
- Use `jest` for both backend and frontend
- Each test file must include:
  - One expected/valid case
  - One edge case
  - One failure case
- Use `/tests/client` and `/tests/backend` folders

## 🚀 Deployment

- **Frontend:** Build and deploy to S3 via GitHub Actions → distributed via CloudFront
- **Backend:** Deploy SAM app using GitHub Actions
- Separate test and production stages in GitHub workflows

## 📈 Analytics (Optional/Future Scope)

- Track listing views per agent/listing
- Use CloudWatch Logs or a simple counter in DynamoDB (future enhancement)



