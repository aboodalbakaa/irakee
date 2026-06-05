#!/bin/bash
cd /root/irakee
# Read DATABASE_URL from .env, strip quotes
URL=$(grep '^DATABASE_URL=' .env | sed "s/DATABASE_URL=//" | sed 's/^"//' | sed 's/"$//')
export DATABASE_URL="$URL"
# Run prisma with explicit no config
npx prisma migrate dev --name init --schema=prisma/schema.prisma 2>&1
