# =========================
# Build Stage
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Build production assets
RUN npm run build


# =========================
# Production Stage
# =========================
FROM nginx:alpine

# Copy Vite production build
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]