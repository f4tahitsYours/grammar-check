-- ==========================================
-- English Grammar Checker & Assignment System
-- Database Schema v1.1 — Ready for Supabase
-- ==========================================

-- Enable pg_crypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. SCHOOLS
-- ==========================================
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. USERS
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    class_name TEXT NULL,
    school_id UUID NULL REFERENCES schools(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. ASSIGNMENTS
-- ==========================================
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_target TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. ASSIGNMENT RUBRICS
-- ==========================================
CREATE TABLE assignment_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL UNIQUE REFERENCES assignments(id) ON DELETE CASCADE,
    grammar_weight INTEGER NOT NULL DEFAULT 5,
    mechanics_weight INTEGER NOT NULL DEFAULT 5,
    content_weight INTEGER NOT NULL DEFAULT 5,
    unity_weight INTEGER NOT NULL DEFAULT 5,
    grading_scale JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. SUBMISSIONS
-- ==========================================
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID NULL REFERENCES assignments(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    errors_json JSONB NOT NULL,
    error_breakdown JSONB NOT NULL,
    score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    error_count INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    diff_html TEXT NOT NULL,
    input_hash TEXT NOT NULL,
    fallback_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Rubric Scoring Columns (Mode B: assignment submissions)
    score_grammar INTEGER NULL,
    score_mechanics INTEGER NULL,
    score_content INTEGER NULL,
    score_unity INTEGER NULL,
    score_total INTEGER NULL,

    rubric_status TEXT NOT NULL DEFAULT 'auto_only'
        CHECK (rubric_status IN ('auto_only', 'awaiting_review', 'complete')),

    reviewed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ NULL
);

-- ==========================================
-- 6. GRAMMAR CACHE
-- ==========================================
-- Internal table — accessed via service_role_key only, no RLS needed
CREATE TABLE grammar_cache (
    input_hash TEXT PRIMARY KEY,
    corrected_text TEXT NOT NULL,
    errors_json JSONB NOT NULL,
    error_breakdown JSONB NOT NULL,
    score INTEGER NOT NULL,
    grade TEXT NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 7. SYSTEM METRICS
-- ==========================================
-- Internal table — accessed via service_role_key only, no RLS needed
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    total_submissions INTEGER NOT NULL DEFAULT 0,
    cache_hits INTEGER NOT NULL DEFAULT 0,
    cache_misses INTEGER NOT NULL DEFAULT 0,
    lt_calls INTEGER NOT NULL DEFAULT 0,
    llm_calls INTEGER NOT NULL DEFAULT 0,
    fallback_count INTEGER NOT NULL DEFAULT 0,
    poster_calls INTEGER NOT NULL DEFAULT 0,
    tts_calls INTEGER NOT NULL DEFAULT 0,
    avg_score NUMERIC(5,2),
    avg_latency_ms INTEGER,
    estimated_cost_usd NUMERIC(10,6),
    active_students INTEGER NOT NULL DEFAULT 0,
    active_teachers INTEGER NOT NULL DEFAULT 0
);

-- ==========================================
-- 8. AUDIT LOG
-- ==========================================
-- Internal table — accessed via service_role_key only, no RLS needed
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id UUID,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_submissions_student_id    ON submissions(student_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_input_hash    ON submissions(input_hash);
CREATE INDEX idx_submissions_rubric_status ON submissions(rubric_status);
CREATE INDEX idx_submissions_reviewed_by   ON submissions(reviewed_by);

CREATE INDEX idx_grammar_cache_input_hash  ON grammar_cache(input_hash);
CREATE INDEX idx_system_metrics_recorded   ON system_metrics(recorded_at DESC);
CREATE INDEX idx_audit_log_user            ON audit_log(user_id);
CREATE INDEX idx_audit_log_action          ON audit_log(action);
CREATE INDEX idx_audit_log_created         ON audit_log(created_at DESC);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS hanya pada tabel yang diakses langsung oleh client (browser)
-- grammar_cache, system_metrics, audit_log: tidak perlu RLS
-- karena hanya diakses backend via service_role_key

ALTER TABLE schools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions       ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
-- SCHOOLS policies
-- ──────────────────────────────────────────
-- Semua authenticated user bisa baca schools
CREATE POLICY authenticated_select_schools ON schools
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- ──────────────────────────────────────────
-- USERS policies
-- ──────────────────────────────────────────
-- Setiap user bisa baca data dirinya sendiri
CREATE POLICY user_select_own_profile ON users
    FOR SELECT USING (id = auth.uid());

-- Teacher bisa baca users dalam school yang sama (untuk dashboard)
CREATE POLICY teacher_select_school_users ON users
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
        AND school_id = (SELECT school_id FROM users WHERE id = auth.uid())
    );

-- Admin bisa baca semua users
CREATE POLICY admin_select_all_users ON users
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ──────────────────────────────────────────
-- ASSIGNMENTS policies
-- ──────────────────────────────────────────
-- Semua authenticated user bisa baca assignments
CREATE POLICY authenticated_select_assignments ON assignments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Hanya teacher yang bisa INSERT assignment
CREATE POLICY teacher_insert_assignments ON assignments
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
    );

-- Teacher hanya bisa UPDATE assignment miliknya sendiri
CREATE POLICY teacher_update_own_assignments ON assignments
    FOR UPDATE USING (
        teacher_id = auth.uid()
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
    );

-- ──────────────────────────────────────────
-- ASSIGNMENT RUBRICS policies
-- ──────────────────────────────────────────
-- Semua authenticated user bisa baca rubrik
CREATE POLICY authenticated_select_rubrics ON assignment_rubrics
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Hanya teacher yang bisa INSERT rubrik
CREATE POLICY teacher_insert_rubrics ON assignment_rubrics
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
    );

-- ──────────────────────────────────────────
-- SUBMISSIONS policies
-- ──────────────────────────────────────────
-- Student hanya bisa baca submission miliknya sendiri
CREATE POLICY student_select_own_submissions ON submissions
    FOR SELECT USING (
        student_id = auth.uid()
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'student'
    );

-- Teacher bisa baca semua submissions dalam school yang sama
CREATE POLICY teacher_select_school_submissions ON submissions
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
        AND (
            SELECT school_id FROM users WHERE id = submissions.student_id
        ) = (
            SELECT school_id FROM users WHERE id = auth.uid()
        )
    );

-- Admin bisa baca semua submissions
CREATE POLICY admin_select_all_submissions ON submissions
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- Student dan teacher bisa INSERT submissions
CREATE POLICY user_insert_submissions ON submissions
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('student', 'teacher')
    );

-- Teacher bisa UPDATE submissions (untuk mengisi score rubrik)
CREATE POLICY teacher_update_submissions ON submissions
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
    );