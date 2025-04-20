#!/bin/sh
set -e

# Function to check if Postgres is ready
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if bunx prisma migrate status > /dev/null 2>&1; then
      echo "PostgreSQL is ready!"
      return 0
    fi
    
    attempt=$((attempt+1))
    echo "Waiting for PostgreSQL... (attempt $attempt of $max_attempts)"
    sleep 2
  done
  
  echo "Failed to connect to PostgreSQL after $max_attempts attempts!"
  return 1
}

# Wait for PostgreSQL to be ready
wait_for_postgres

# Run migrations if the RUN_MIGRATIONS env variable is set
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  bunx prisma migrate deploy
  echo "Migrations complete!"
fi

# Seed the database if the SEED_DATABASE env variable is set
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database..."
  bun run prisma:seed
  echo "Database seeding complete!"
fi

# Regenerate the Prisma client
echo "Generating Prisma client..."
bunx prisma generate

# Start the application with Node.js
echo "Starting the application with Node.js..."
exec "$@" 