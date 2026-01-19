#!/bin/bash

# Verify database setup after reset
# Run this after `pnpm supabase:reset` to ensure everything is set up correctly

echo "🔍 Verifying Local Supabase Database Setup..."
echo ""

# Database connection string
DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql not found. Install PostgreSQL client for detailed verification.${NC}"
    echo ""
    echo "You can still verify manually:"
    echo "1. Open Studio: http://127.0.0.1:54323"
    echo "2. Check Authentication → Users (should see 3 users)"
    echo "3. Check Database → Tables (should see profiles, games, etc.)"
    echo ""
    exit 0
fi

echo "1️⃣  Checking Supabase status..."
if pnpm supabase:status &> /dev/null; then
    echo -e "${GREEN}✅ Supabase is running${NC}"
else
    echo -e "${RED}❌ Supabase is not running!${NC}"
    echo "Run: pnpm supabase:start"
    exit 1
fi
echo ""

echo "2️⃣  Checking database tables..."
TABLE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
if [ "$TABLE_COUNT" -gt 10 ]; then
    echo -e "${GREEN}✅ Tables exist ($TABLE_COUNT tables)${NC}"
else
    echo -e "${RED}❌ Tables missing! Found only $TABLE_COUNT tables${NC}"
    echo "Run: pnpm supabase:reset"
    exit 1
fi
echo ""

echo "3️⃣  Checking test users..."
USER_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM auth.users WHERE email LIKE '%example.com';")
if [ "$USER_COUNT" -eq 3 ]; then
    echo -e "${GREEN}✅ Test users created (3 users)${NC}"
    psql "$DB_URL" -c "SELECT email, email_confirmed_at IS NOT NULL as confirmed FROM auth.users WHERE email LIKE '%example.com' ORDER BY email;" | head -n 7
else
    echo -e "${RED}❌ Test users missing! Found only $USER_COUNT users${NC}"
    echo "Run: pnpm supabase:reset"
    exit 1
fi
echo ""

echo "4️⃣  Checking profiles..."
PROFILE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM public.profiles;")
if [ "$PROFILE_COUNT" -eq 3 ]; then
    echo -e "${GREEN}✅ Profiles created (3 profiles)${NC}"
    psql "$DB_URL" -c "SELECT username, display_name FROM public.profiles ORDER BY username;" | head -n 7
else
    echo -e "${YELLOW}⚠️  Expected 3 profiles, found $PROFILE_COUNT${NC}"
fi
echo ""

echo "5️⃣  Checking ratings..."
RATING_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM public.ratings;")
if [ "$RATING_COUNT" -eq 12 ]; then
    echo -e "${GREEN}✅ Ratings initialized (12 entries: 3 users × 4 modes)${NC}"
else
    echo -e "${YELLOW}⚠️  Expected 12 rating entries, found $RATING_COUNT${NC}"
fi
echo ""

echo "══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Database verification complete!${NC}"
echo ""
echo "Test users (all with password: testpassword123):"
echo "  • test@example.com"
echo "  • playerb@example.com"
echo "  • spectator@example.com"
echo ""
echo "Supabase Studio: http://127.0.0.1:54323"
echo "══════════════════════════════════════════════════════════════"
