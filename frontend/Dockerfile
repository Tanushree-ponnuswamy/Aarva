# ==============================================================================
#  AARVA Frontend - Dockerfile (Multi-stage Build)
#  Stage 1: Node.js 20 builds the React + Vite + Tailwind CSS bundle
#  Stage 2: Nginx Alpine serves static files & proxies /api to backend
# ==============================================================================

# ── Stage 1: Build Frontend Assets ───────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies using package-lock.json for reproducible builds
COPY package*.json ./
RUN npm ci

# Copy application source files
COPY . .

# Build argument to allow specifying custom API URL at build time if desired
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Run Vite production build
RUN npm run build

# ── Stage 2: Serve via Nginx Alpine ──────────────────────────────────────────
FROM nginx:alpine

# Remove default Nginx welcome assets
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy tailored Nginx reverse-proxy and SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
