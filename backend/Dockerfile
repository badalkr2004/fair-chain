FROM node:20-slim

WORKDIR /app

# Install bun as package manager
RUN npm install -g bun

# Copy package.json, bun.lock and other config files
COPY package.json bun.lock tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies using bun
RUN bun install
# RUN bunx prisma generate

# Copy source code
COPY . .

# Make entrypoint script executable
# COPY docker-entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Build the application with node target
# RUN bun run build

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV RUN_MIGRATIONS=true
ENV SEED_DATABASE=false
ENV DATABASE_URL=postgresql://neondb_owner:npg_1KNtSezUgj2v@ep-bitter-fire-a4q6415e-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Use our entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

# Command to run the app
CMD ["bun", "run", "start"] 