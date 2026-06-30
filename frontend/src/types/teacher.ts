export interface TeacherDashboardItem {
    submission_id: string
    student_id: string
    student_name: string
    assignment_id: string
    assignment_title: string
    score: number
    grade: string
    word_count: number
    error_count: number
    rubric_status: string
    created_at: string
}

export interface TeacherDashboardResponse {
    items: TeacherDashboardItem[]
    total: number
    page: number
    limit: number
    // ADD THIS
    total_students: number
    active_assignments: number
}

export interface SubmissionDetailResponse {
    id: string

    original_text: string
    corrected_text: string

    errors: any[]

    score?: number | null
    grade?: string | null

    word_count: number
    error_count: number

    error_breakdown: Record<string, number>

    feedback: string

    fallback_used: boolean

    created_at: string
    assignment_id: string
    rubric_status: string

    score_grammar?: number | null
    score_mechanics?: number | null
    score_content?: number | null
    score_unity?: number | null
    score_total?: number | null

    reviewed_at?: string | null

    score_hidden?: boolean
    
    poster_url?: string | null
    audio_url?: string | null
}