#!/bin/bash
# PostgreSQL Setup for Unified Platform – runs on VPS
set -euo pipefail

DB_NAME="unified_platform"
DB_USER="unified"
DB_PASS="${DB_PASS:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 20)}"

echo "Setting up PostgreSQL..."

sudo -u postgres psql <<SQL
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SQL

echo "✓ PostgreSQL setup complete"
echo ""
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
echo ""
echo "Add the above DATABASE_URL to your .env file!"
