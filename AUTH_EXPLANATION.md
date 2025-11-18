# Authentication Setup Explanation

## What We've Built

You're migrating from Auth0 to Supabase authentication. Here's what's been set up:

## File Structure

### 1. **`src/lib/UserContext.tsx`** - The Auth Provider
This file contains:
- **`AuthProvider`** - A React component that wraps your app and manages user state
- **`useUser()`** - A hook you can use in any component to get the current user

**What it does:**
- When your app loads, it checks if someone is logged in via Supabase
- Stores the user info in React state
- Makes the user available to all components via Context

### 2. **`src/components/AuthWrapper.tsx`** - Client Component Wrapper
This is needed because:
- Your `layout.tsx` is a server component (Next.js)
- `AuthProvider` uses React hooks (client-side only)
- This wrapper bridges server and client components

### 3. **`src/app/layout.tsx`** - Root Layout
Your main layout wraps everything with `AuthWrapper`, which provides auth to all pages.

### 4. **`src/components/NavBar.tsx`** - Navigation Bar
Now uses `useUser()` instead of Auth0's `useAuth0()`:
- Shows "Login" button if no user
- Shows user's name/email if logged in

## How It Works

```
App Starts
    ↓
AuthProvider checks Supabase for logged-in user
    ↓
User state is stored (null if not logged in, User object if logged in)
    ↓
Any component can call useUser() to access user info
```

## How to Use in Your Components

### Example 1: Check if user is logged in
```tsx
"use client";
import { useUser } from "@/lib/UserContext";

export default function MyComponent() {
  const { user } = useUser();
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.email}!</div>;
}
```

### Example 2: Access user data
```tsx
"use client";
import { useUser } from "@/lib/UserContext";

export default function Profile() {
  const { user } = useUser();
  
  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>User ID: {user?.id}</p>
      {/* Name might be in user_metadata */}
      <p>Name: {user?.user_metadata?.full_name}</p>
    </div>
  );
}
```

## Login/Signup Flow

1. User goes to `/login` or `/signup`
2. Fills out form
3. Form calls `login()` or `signup()` from `src/lib/auth-actions.ts`
4. These are server actions that talk to Supabase
5. After successful login, user is redirected
6. `AuthProvider` automatically detects the logged-in user
7. NavBar and other components update to show user info

## Important Notes

- **User object structure**: Supabase `User` has:
  - `email` - user's email
  - `id` - unique user ID
  - `user_metadata` - custom data (like name from signup)
  - No direct `name` property (use `user_metadata.full_name` or `user_metadata.name`)

- **Client vs Server**: 
  - Components using `useUser()` must be client components (`"use client"`)
  - Server components can't use hooks, but can use server-side Supabase client

- **Current Issue**: The NavBar tries to get name from `user_metadata.name`, but your signup stores it as `user_metadata.full_name`. The NavBar will fall back to email if name isn't found.

## Next Steps

1. ✅ Auth provider is set up
2. ✅ NavBar is using Supabase auth
3. ⚠️ You may want to update other components that use Auth0
4. ⚠️ Make sure your Supabase environment variables are set

## Files That Might Still Use Auth0

Check these files - they might still be using `useAuth0()`:
- `src/app/dashboard/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/game/deathmatch/page.tsx`
- `src/app/game/bossbattle/page.tsx`

You'll need to replace `useAuth0()` with `useUser()` in these files.
