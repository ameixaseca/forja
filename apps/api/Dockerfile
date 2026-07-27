# Build context: repo root (monorepo). Matches docs/ci-cd/.github/workflows/deploy-api.yml
# (`context: .`, `file: apps/api/Dockerfile`) — aspirational deploy workflow, not yet wired
# into .github/workflows, but this Dockerfile fulfills its expectation (Fase 5 tasks 7.1).
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schema/package.json packages/schema/package.json
COPY packages/config-eslint/package.json packages/config-eslint/package.json
COPY packages/config-typescript/package.json packages/config-typescript/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/schema packages/schema
COPY packages/config-eslint packages/config-eslint
COPY packages/config-typescript packages/config-typescript
COPY apps/api apps/api
RUN pnpm --filter @forja/schema run build
RUN pnpm --filter @forja/api run build
RUN pnpm --filter @forja/api deploy --prod --legacy /out/api

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/api ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
