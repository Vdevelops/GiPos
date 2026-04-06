# GiPos

This is a [Turborepo](https://turbo.build/repo) monorepo.

## What's inside?

This monorepo includes the following apps:

- `apps/web`: A [Next.js](https://nextjs.org) application

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0.0

### Installation

Install dependencies:

```bash
pnpm install
```

### Development

To develop all apps in parallel:

```bash
pnpm dev
```

To develop a specific app:

```bash
pnpm --filter web dev
```

### Build

To build all apps:

```bash
pnpm build
```

To build a specific app:

```bash
pnpm --filter web build
```

### Lint

To lint all apps:

```bash
pnpm lint
```

### Start

To start all apps in production mode:

```bash
pnpm start
```

## Learn More

To learn more about the tools used in this monorepo, take a look at the following resources:

- [Turborepo Documentation](https://turbo.build/repo/docs) - learn about Turborepo features and API.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
