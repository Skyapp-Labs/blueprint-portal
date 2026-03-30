# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# Compiles TypeScript to dist/ and prunes dev dependencies.
FROM node:20-alpine AS builder

WORKDIR /admin

# Copy dependency manifests first for better layer caching.
COPY package.json package-lock.json ./

# Install all deps (including devDependencies needed for tsc/nest build).
RUN npm ci --frozen-lockfile

# Copy source and build.
COPY . .
RUN npm run build

# Prune to production-only deps so the runtime image stays small.
RUN npm prune --omit=dev

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Lean production image — no build tools, no source, no dev deps.
FROM node:20-alpine AS runtime

# Install dumb-init for proper PID 1 signal handling (SIGTERM → graceful shutdown).
RUN apk add --no-cache dumb-init

WORKDIR /admin

# Run as a non-root user — defence in depth.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only what the app needs to run.
COPY --from=builder --chown=appuser:appgroup /admin/dist ./dist
COPY --from=builder --chown=appuser:appgroup /admin/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /admin/package.json ./package.json

# NestJS default port — override with PORT env var.
EXPOSE 3000

# SIGTERM is forwarded to the Node process via dumb-init, triggering NestJS
# enableShutdownHooks() for graceful drain before container stop.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
