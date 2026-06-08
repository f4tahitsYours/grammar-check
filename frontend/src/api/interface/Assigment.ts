export interface Assignment {
    assignment_id: string
    title: string
    description: string
    class_target: string
    is_active: boolean
    created_at: string
    teacher_name: string
    rubric: {
        grammar_weight: number
        mechanics_weight: number
        content_weight: number
        unity_weight: number
    }
}

export interface AssignmentsResponse {
    data: Assignment[]
    total: number
}