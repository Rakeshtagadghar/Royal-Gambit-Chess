# Setting Up Test Users

This guide explains how to create the required test users for E2E testing.

## Required Test Users

You need to create **3 test user accounts** in Supabase:

### 1. Primary Test User
- **Email**: `test@example.com`
- **Password**: `testpassword123`
- **Purpose**: Main authenticated user for testing

### 2. Player B
- **Email**: `playerb@example.com`
- **Password**: `testpassword123`
- **Purpose**: Second player for multiplayer/game testing

### 3. Spectator
- **Email**: `spectator@example.com`
- **Password**: `testpassword123`
- **Purpose**: Spectator role for viewing games

## Method 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** (or **Invite User**)
4. For each test user:
   - Enter the email address
   - Enter the password
   - Check **Auto Confirm User** (to skip email verification)
   - Click **Create User**
5. Repeat for all 3 users

## Method 2: Using Your App's Registration

1. Start your development server: `pnpm dev`
2. Navigate to your app's registration page
3. For each test user:
   - Fill in the registration form with the credentials above
   - Complete the registration
   - If email verification is required, go to Supabase Dashboard and manually verify the email

## Method 3: Using Supabase SQL Editor

Run this SQL in your Supabase SQL Editor:

```sql
-- Note: Replace 'your-project-url' and generate proper encrypted passwords
-- This is a simplified version - actual implementation needs proper password hashing

-- Insert test users into auth.users
-- You'll need to use Supabase's auth.users() function or the dashboard
-- as direct SQL insertion into auth.users requires admin privileges

-- Instead, use the Supabase Auth Admin API or the dashboard method above
```

## Verifying Test Users

After creating the users, verify they exist:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see all 3 test users listed
3. Verify each user's email is confirmed (green checkmark)

## Setting Environment Variables

After creating the users, set up your environment variables:

### Option A: Create `.env.test` file

Create a file named `.env.test` in the project root:

```bash
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123

TEST_PLAYER_B_EMAIL=playerb@example.com
TEST_PLAYER_B_PASSWORD=testpassword123

TEST_SPECTATOR_EMAIL=spectator@example.com
TEST_SPECTATOR_PASSWORD=testpassword123

PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### Option B: Export in your shell

```bash
export TEST_USER_EMAIL=test@example.com
export TEST_USER_PASSWORD=testpassword123
export TEST_PLAYER_B_EMAIL=playerb@example.com
export TEST_PLAYER_B_PASSWORD=testpassword123
export TEST_SPECTATOR_EMAIL=spectator@example.com
export TEST_SPECTATOR_PASSWORD=testpassword123
```

### Option C: Use dotenv in package.json

Update your test script to load `.env.test`:

```json
"test:e2e": "dotenv -e .env.test -- playwright test"
```

Then install dotenv-cli: `pnpm add -D dotenv-cli`

## Testing the Setup

1. Start your dev server: `pnpm dev`
2. Try logging in manually with one of the test accounts to verify it works
3. Run the e2e tests: `pnpm test:e2e`

If authentication setup tests pass, your users are configured correctly!

## Troubleshooting

### Users can't log in
- Verify the users are confirmed/verified in Supabase
- Check that the passwords match exactly
- Try logging in manually through your app first

### Environment variables not loading
- Make sure you're running tests from the project root
- Try the shell export method to rule out file issues
- Check that `.env.test` is not in `.gitignore`

### Users don't exist
- Double-check the Supabase Dashboard Users list
- Try creating them manually through the dashboard
- Verify you're connected to the correct Supabase project
