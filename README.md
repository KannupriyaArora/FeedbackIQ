# FeedbackIQ

Intelligent feedback collection and analysis platform.

## Project Structure

```
feedbackiq/
├── client/          # Next.js 14 frontend (App Router, TypeScript, Tailwind CSS)
├── server/          # Node.js Express backend (TypeScript, nodemon)
├── .eslintrc.json   # Root ESLint config
├── .prettierrc      # Shared Prettier config
├── .gitignore
└── package.json     # Root workspace config
```

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x

## Setup

1. Install all dependencies from the root:

```bash
npm install
```

2. Copy environment files and fill in values:

```bash
cp client/.env.example client/.env.local   # (once you create one)
cp server/.env.example server/.env         # (once you create one)
```

## Development

Run both client and server concurrently:

```bash
npm run dev
```

Or run them individually:

```bash
# Client only (http://localhost:3000)
npm run dev --workspace=client

# Server only (http://localhost:4000)
npm run dev --workspace=server
```

## Build

```bash
npm run build
```

## Linting & Formatting

```bash
# Lint all workspaces
npm run lint

# Format all files with Prettier
npm run format
```

## Ports

| Service | Port |
|---------|------|
| Client  | 3000 |
| Server  | 4000 |
