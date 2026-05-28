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
    show_score: boolean
    score: number
    grade: string

    word_count: number
    error_count: number

    error_breakdown: Record<string, number>

    feedback: string
    diff_html: string

    fallback_used: boolean

    created_at: string

    assignment_id: string

    rubric_status: string

    score_grammar: number
    score_mechanics: number
    score_content: number
    score_unity: number

    score_total: number

    reviewed_at: string | null
}
