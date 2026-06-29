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