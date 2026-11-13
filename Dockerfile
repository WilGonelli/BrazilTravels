# ==============================================================================
# Multi-Stage Dockerfile for Brazil Travels (Raspberry Pi & Production Ready)
# Stage 1: Build static assets using Node.js
# Stage 2: Serve using ultra-lightweight Nginx Alpine (~20MB, <5MB RAM)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_STORAGE_MODE=sheets
ARG VITE_GOOGLE_APPS_SCRIPT_URL=""
ARG VITE_GOOGLE_API_KEY=""
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_GOOGLE_DRIVE_FOLDER_ID=""
ARG VITE_GOOGLE_SHEETS_SPREADSHEET_ID=""

# Set as environment variables for the Vite build process
ENV VITE_STORAGE_MODE=$VITE_STORAGE_MODE
ENV VITE_GOOGLE_APPS_SCRIPT_URL=$VITE_GOOGLE_APPS_SCRIPT_URL
ENV VITE_GOOGLE_API_KEY=$VITE_GOOGLE_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_DRIVE_FOLDER_ID=$VITE_GOOGLE_DRIVE_FOLDER_ID
ENV VITE_GOOGLE_SHEETS_SPREADSHEET_ID=$VITE_GOOGLE_SHEETS_SPREADSHEET_ID

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source files
COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src/ ./src/

# Compile TypeScript and bundle with Vite
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Lightweight Production Web Server (Ideal for Raspberry Pi Zero/3/4/5)
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized SPA Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure continuous operation on Raspberry Pi
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
