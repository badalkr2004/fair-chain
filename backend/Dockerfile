FROM node:20-slim

WORKDIR /app

# Install bun as package manager
RUN npm install -g bun

# Copy package.json, bun.lock and other config files
COPY package.json bun.lock tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies using bun
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables (secrets injected at runtime via .env or orchestrator)
ENV NODE_ENV=production
ENV PORT=8080

# Command to run migrations and start the app
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start"]