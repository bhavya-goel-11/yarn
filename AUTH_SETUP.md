# NEGORA - Authentication Setup Guide

## Supabase Authentication Configuration

### 1. Enable Email Authentication

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### 2. Configure Email Settings

For production:
1. Go to **Authentication** → **Email Templates**
2. Customize confirmation, password reset, and magic link emails
3. Set up SMTP (optional) in **Project Settings** → **Auth**

### 3. User Table Structure

The `auth.users` table is automatically managed by Supabase. Your application uses:
- `user.id` - UUID primary key
- `user.email` - User email
- `user.user_metadata.name` - User's display name
- `user.created_at` - Account creation timestamp

### 4. Search History Tracking

Searches are logged to the `searches` table with `user_id`:
```sql
CREATE TABLE IF NOT EXISTS searches (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  vertical VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Implemented

✅ **User Registration** - Sign up with email/password
✅ **User Login** - Secure authentication
✅ **Session Management** - Automatic token refresh
✅ **Protected Routes** - Auth context provider
✅ **User Profile** - View account details and search history
✅ **Sign Out** - Secure session termination
✅ **Search History** - Track user searches per account

## Pages

- `/` - Home page (public, shows auth status)
- `/login` - Sign in page
- `/signup` - Create account page
- `/profile` - User profile and search history (requires auth)

## Usage

### Sign Up
```typescript
const { signUp } = useAuth();
await signUp(email, password, name);
```

### Sign In
```typescript
const { signIn } = useAuth();
await signIn(email, password);
```

### Sign Out
```typescript
const { signOut } = useAuth();
await signOut();
```

### Get Current User
```typescript
const { user, session, loading } = useAuth();
```

## Security Notes

- Passwords are hashed by Supabase Auth
- Session tokens are stored in localStorage
- Email verification can be enabled in Supabase dashboard
- Row Level Security (RLS) should be configured for production:

```sql
-- Enable RLS on searches table
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;

-- Users can only see their own searches
CREATE POLICY "Users can view own searches"
  ON searches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own searches
CREATE POLICY "Users can insert own searches"
  ON searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Troubleshooting

### "Invalid login credentials"
- Verify email and password are correct
- Check if email verification is required
- Ensure user exists in Supabase Auth

### "No user found"
- User needs to sign up first
- Check Supabase dashboard → Authentication → Users

### Search history not loading
- Verify searches table exists
- Check user_id is being stored correctly
- Ensure RLS policies allow user access
