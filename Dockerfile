# syntax=docker/dockerfile:1.7
###############################################
# Base (install deps)
###############################################
FROM mcr.microsoft.com/playwright:v1.47.2-jammy AS base
WORKDIR /app

# Install dependencies (use npm ci when lockfile exists)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi

# Copy sources
COPY . .

###############################################
# Build (TypeScript -> dist)
###############################################
FROM base AS build
WORKDIR /app
RUN npm run build

###############################################
# Development (hot-reload)
###############################################
FROM base AS dev
WORKDIR /app
# Hint: Keep HEADLESS true in containers unless you forward X11
ENV HEADLESS=true
ENV TZ=Asia/Tokyo
# Playwright image already includes necessary browsers and user
# Default command runs the dev server (tsx watch)
CMD ["npm", "run", "dev"]

###############################################
# Production runtime
###############################################
FROM mcr.microsoft.com/playwright:v1.47.2-jammy AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HEADLESS=true
ENV TZ=Asia/Tokyo

# Only runtime deps to reduce image size
COPY package.json ./package.json
RUN npm i --omit=dev

# App artifacts
COPY --from=build /app/dist ./dist
COPY --from=build /app/urls.txt ./urls.txt

# .env is provided at runtime via env_file or environment
CMD ["node", "dist/index.js"]
