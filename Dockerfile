# ============================================================
#  Dockerfile — Next.js Frontend (Development)
#  Farm System | Next.js 16 + Firebase
# ============================================================

FROM node:20-alpine

# Install system deps for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose Next.js dev port
EXPOSE 3000

# Required for Docker file-watching (hot reload on Linux)
ENV WATCHPACK_POLLING=true
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
