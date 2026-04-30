# Supabase Setup for Vaultix

## 1. Create project
- Go to https://supabase.com and sign in
- Click "New project"
- Name: vaultix
- Database password: save this somewhere safe
- Region: pick closest to you
- Click "Create new project" and wait ~2 minutes

## 2. Get your keys
- Go to Settings → API
- Copy "Project URL" → paste as REACT_APP_SUPABASE_URL in .env.local
- Copy "anon public" key → paste as REACT_APP_SUPABASE_ANON_KEY in .env.local

## 3. Run the schema SQL
- Go to SQL Editor in your Supabase dashboard
- Click "New query"
- Paste the entire contents of supabase/schema.sql
- Click "Run"

## 4. Run the seed SQL
- In SQL Editor, create another new query
- Paste the entire contents of supabase/seed.sql
- Click "Run"

## 5. Enable email auth
- Go to Authentication → Providers
- Make sure "Email" is enabled
- Under Authentication → Settings, disable "Confirm email" for development
  (so seeded users can log in without email confirmation)
