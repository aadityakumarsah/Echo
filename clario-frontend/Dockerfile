# Two-stage build for Clario Frontend

# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy lock file first for better caching
COPY package.json bun.lock* package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install serve to run the frontend
RUN npm install -g serve

WORKDIR /app

# Copy built assets from build stage
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -g 1000 appuser && adduser -D -u 1000 -G appuser appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
