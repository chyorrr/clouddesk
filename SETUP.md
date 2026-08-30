# CloudDesk — Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization, name the project **clouddesk**, set a strong DB password
4. Wait for the project to initialize (~1-2 min)

## Step 2: Get Your API Keys

From your Supabase dashboard → **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

Copy these into `d:\interestingig\clouddesk\.env.local`

## Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the contents of `supabase-schema.sql`
4. Click **Run**

## Step 4: Create the Storage Bucket

1. Go to **Storage** in the Supabase dashboard
2. Click **Create a new bucket**
3. Name: `user-files`
4. **Public bucket**: OFF (private)
5. File size limit: `104857600` (100 MB)
6. Click **Save**

## Step 5: Set Storage RLS Policy

In **Storage → user-files → Policies**, add a policy:

- Policy name: `Users can manage their own files`
- Allowed operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- Policy definition:
```sql
(storage.foldername(name))[1] = auth.uid()::text
```

## Step 6: Configure Email Auth

In **Authentication → Providers → Email**:
- Enable email provider: ✓
- Confirm email: you can disable this for local testing

## Step 7: Start the Dev Server

```powershell
cd d:\interestingig\clouddesk
npm run dev
```

Open http://localhost:3000

## Step 8: Verify

1. Open http://localhost:3000 — you should see the boot screen → login
2. Click "Create account" and sign up
3. Check your email for confirmation (or disable confirmation in Supabase)
4. Log in — your CloudDesk desktop should appear with default folders

---

## Troubleshooting

**"relation filesystem does not exist"** → Run `supabase-schema.sql` in SQL Editor

**"storage bucket not found"** → Create `user-files` bucket in Storage

**Files not uploading** → Check Storage RLS policy matches `auth.uid()::text`

**Can't log in** → Check `.env.local` has correct Supabase URL and anon key
