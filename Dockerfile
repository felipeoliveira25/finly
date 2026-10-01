FROM node:20-alpine

WORKDIR /app

# Copy package manifests for all workspaces
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
# web package.json needed so npm workspaces resolves correctly
COPY apps/web/package.json ./apps/web/

# Install dependencies (all workspaces — shared-types is needed at build time)
RUN npm ci

# Copy source
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

# Build API
RUN npm run build --workspace=apps/api

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
