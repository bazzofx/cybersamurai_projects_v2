# ==========================================
# Step 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install packages clean and fast
RUN npm ci

# Copy all source files
COPY . .

# Build the production assets
RUN npm run build

# ==========================================
# Step 2: Production Serving Stage
# ==========================================
FROM nginx:alpine

# Copy built artifacts from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx config with our SPA-optimized routing rules
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to traffic
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]