# Supabase Setup Guide: English Grammar Checker

## Prerequisites
1. An active project in [Supabase](https://supabase.com).
2. Access to the **SQL Editor** within your Supabase project dashboard.

## Step-by-Step Instructions

### Step 1: Run the Schema Initialization Script
1. Navigate to the **SQL Editor** in your Supabase dashboard (left sidebar).
2. Click on **New Query**.
3. Open `supabase_schema.sql` from your project and copy all of its contents.
4. Paste the SQL code into the Supabase SQL Editor.
5. Click **Run** (or press `Cmd/Ctrl + Enter`).
6. After it succeeds, navigate to the **Table Editor** to verify that all 8 tables were created successfully:
   - `schools`
   - `users`
   - `assignments`
   - `assignment_rubrics`
   - `submissions`
   - `grammar_cache`
   - `system_metrics`
   - `audit_log`

### Step 2: Configure Authentication & Users
This schema uses Role-Based Access Control (RBAC) and relies on the `users` table for metadata (like `role`, `school_id`, etc.). The `id` in the `users` table maps directly to Supabase's built-in `auth.uid()`.

1. Go to **Authentication > Providers** to ensure Email/Password signup is enabled.
2. In the future, you will need to implement an Auth Hook or a Backend Endpoint to automatically create a row in the `users` table when a user registers, setting their `role` to `'student'`, `'teacher'`, or `'admin'`.
3. To test the app immediately, you can create users in Supabase Auth, and manually insert their resulting UUIDs into the `users` table via the Table Editor.

### Step 3: Verify Row Level Security (RLS)
The SQL script automatically turns on RLS for all tables and applies your requested security rules.

To review these policies:
1. Navigate to **Authentication > Policies** in Supabase.
2. Check the active policies on the `submissions` and `users` tables. You will see:
   - **Admins** have `admin_select_all` and `admin_select_users` policies.
   - **Teachers** have `teacher_select_school_submissions`.
   - **Students** have `student_select_own_submissions`.
   - **Insert Policy** allows both students and teachers to create new rows in `submissions` (`user_insert_submissions`).
   
*Note: Any backend scripts executing background processes or cache updates can bypass these policies safely by using the **Supabase Service Role Key** (which inherently bypasses RLS).*

### Step 4: Validate JSONB Configurations
1. Go to the **Table Editor**.
2. Click on the `submissions` table and verify that `errors_json` and `error_breakdown` are correctly set as `jsonb` types.
3. Click on the `assignment_rubrics` table and verify that `grading_scale` is set to `jsonb`.

You are now ready to connect the FastAPI backend to Supabase in Phase 2!
