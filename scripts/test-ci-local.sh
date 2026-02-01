#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Local CI Test Runner                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
SKIP_E2E=false
SKIP_SECURITY=false
KEEP_RUNNING=false
HEADED=false

for arg in "$@"; do
  case $arg in
    --skip-e2e) SKIP_E2E=true ;;
    --skip-security) SKIP_SECURITY=true ;;
    --keep-running) KEEP_RUNNING=true ;;
    --headed) HEADED=true ;;
    --help)
      echo "Usage: ./scripts/test-ci-local.sh [options]"
      echo ""
      echo "Options:"
      echo "  --skip-e2e       Skip E2E tests"
      echo "  --skip-security  Skip security/RLS tests"
      echo "  --keep-running   Don't stop Supabase after tests"
      echo "  --headed         Run E2E tests in headed mode"
      echo ""
      exit 0
      ;;
  esac
done

# Check if Docker is running
echo -e "${YELLOW}Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ERROR: Docker is not running!                             ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Please start Docker Desktop first, then run this script again.${NC}"
  echo ""
  echo "On Windows: Open Docker Desktop from the Start menu"
  echo "On Mac: Open Docker Desktop from Applications"
  echo "On Linux: Run 'sudo systemctl start docker'"
  echo ""
  exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
  if [ "$KEEP_RUNNING" = false ]; then
    echo -e "\n${YELLOW}Stopping Supabase...${NC}"
    pnpm exec supabase stop 2>/dev/null || true
  fi
}

# Set trap for cleanup (only if not keeping running)
if [ "$KEEP_RUNNING" = false ]; then
  trap cleanup EXIT
fi

# Step 1: Check if Supabase is running
echo -e "${YELLOW}[1/7] Checking Supabase status...${NC}"

# Clean up any stale containers first
echo "Cleaning up old containers..."
pnpm exec supabase stop --no-backup 2>/dev/null || true
# Force remove all supabase containers by name pattern
docker rm -f supabase_vector_chess supabase_db_chess supabase_auth_chess supabase_api_chess supabase_studio_chess supabase_storage_chess supabase_realtime_chess supabase_analytics_chess supabase_edge_runtime_chess supabase_inbucket_chess supabase_imgproxy_chess supabase_pooler_chess supabase_gateway_chess 2>/dev/null || true
docker ps -a --filter "name=supabase" -q 2>/dev/null | xargs -r docker rm -f 2>/dev/null || true

echo -e "${YELLOW}Starting Supabase (this may take a while on first run)...${NC}"
pnpm exec supabase start
echo -e "${GREEN}✓ Supabase started${NC}"

# Step 2: Reset database with migrations and seed
echo -e "\n${YELLOW}[2/7] Resetting database...${NC}"
pnpm exec supabase db reset
echo -e "${GREEN}✓ Database reset complete${NC}"

# Step 3: Get Supabase credentials
echo -e "\n${YELLOW}[3/7] Getting Supabase credentials...${NC}"
# Note: API runs on port 55321 (changed from default 54321 to avoid Windows Hyper-V port conflicts)

# Get status using pnpm exec (ensures supabase is found)
SUPABASE_STATUS_TEXT=$(pnpm exec supabase status 2>&1)

# Parse Project URL (format: "Project URL │ http://...")
SUPABASE_URL=$(echo "$SUPABASE_STATUS_TEXT" | grep -i "Project URL" | grep -o 'http://[^ │]*' | tr -d '[:space:]')

# Parse Publishable key (= ANON_KEY, format: "Publishable │ sb_publishable_...")
SUPABASE_ANON_KEY=$(echo "$SUPABASE_STATUS_TEXT" | grep -i "Publishable" | grep -o 'sb_publishable_[A-Za-z0-9_-]*' | head -1)

# Parse Secret key (= SERVICE_ROLE_KEY, format: "Secret │ sb_secret_...")
SUPABASE_SERVICE_KEY=$(echo "$SUPABASE_STATUS_TEXT" | grep -i "Secret" | grep -o 'sb_secret_[A-Za-z0-9_-]*' | head -1)

# Fallback to hardcoded local URL if parsing fails
if [ -z "$SUPABASE_URL" ]; then
  echo -e "${YELLOW}Warning: Could not parse Project URL, using default${NC}"
  SUPABASE_URL="http://127.0.0.1:55321"
fi

# Debug output
echo "  URL: $SUPABASE_URL"
echo "  ANON_KEY: ${SUPABASE_ANON_KEY}"
echo "  SERVICE_KEY: ${SUPABASE_SERVICE_KEY:0:20}..."

# Final validation
if [ -z "$SUPABASE_ANON_KEY" ] || [ ${#SUPABASE_ANON_KEY} -lt 20 ]; then
  echo -e "${RED}ERROR: Failed to get valid ANON_KEY from Supabase${NC}"
  echo "Try running 'pnpm exec supabase status' manually"
  exit 1
fi

echo -e "${GREEN}✓ Credentials retrieved${NC}"
echo "  URL: $SUPABASE_URL"

# Step 4: Create test users
echo -e "\n${YELLOW}[4/7] Creating test users...${NC}"

# Create main test user
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123", "email_confirm": true}' > /dev/null 2>&1 || true

# Create player B
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email": "playerb@example.com", "password": "testpassword123", "email_confirm": true}' > /dev/null 2>&1 || true

# Create spectator
curl -s -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email": "spectator@example.com", "password": "testpassword123", "email_confirm": true}' > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Test users created${NC}"
echo "  - test@example.com"
echo "  - playerb@example.com"
echo "  - spectator@example.com"

# Export environment variables for tests
export CI=true  # Tell Playwright not to start its own server
export SUPABASE_URL
export SUPABASE_ANON_KEY
export SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY
export NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
export TEST_USER_EMAIL="test@example.com"
export TEST_USER_PASSWORD="testpassword123"
export TEST_PLAYER_B_EMAIL="playerb@example.com"
export TEST_PLAYER_B_PASSWORD="testpassword123"
export TEST_SPECTATOR_EMAIL="spectator@example.com"
export TEST_SPECTATOR_PASSWORD="testpassword123"
export PLAYWRIGHT_BASE_URL="http://localhost:3000"

# Step 5: Run security tests
if [ "$SKIP_SECURITY" = false ]; then
  echo -e "\n${YELLOW}[5/7] Running security/RLS tests...${NC}"
  pnpm test:security
  echo -e "${GREEN}✓ Security tests passed${NC}"
else
  echo -e "\n${YELLOW}[5/7] Skipping security tests${NC}"
fi

# Step 6: Build and run E2E tests
if [ "$SKIP_E2E" = false ]; then
  echo -e "\n${YELLOW}[6/7] Building application...${NC}"
  pnpm build
  echo -e "${GREEN}✓ Build complete${NC}"
  
  echo -e "\n${YELLOW}[7/7] Running E2E tests...${NC}"
  
  # Start server in background
  pnpm start &
  SERVER_PID=$!
  
  # Wait for server to be ready
  echo "Waiting for server to start..."
  timeout 60 bash -c 'until curl -s http://localhost:3000 > /dev/null; do sleep 2; done' || {
    echo -e "${RED}Server failed to start${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  }
  echo -e "${GREEN}✓ Server ready${NC}"
  
  # Run E2E tests
  if [ "$HEADED" = true ]; then
    pnpm test:e2e --headed
  else
    pnpm test:e2e
  fi
  
  # Stop the server
  kill $SERVER_PID 2>/dev/null || true
  
  echo -e "${GREEN}✓ E2E tests passed${NC}"
else
  echo -e "\n${YELLOW}[6/7] Skipping build${NC}"
  echo -e "${YELLOW}[7/7] Skipping E2E tests${NC}"
fi

echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     All CI tests passed!                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"

if [ "$KEEP_RUNNING" = true ]; then
  echo -e "\n${BLUE}Supabase is still running. Stop with: pnpm supabase:stop${NC}"
fi
