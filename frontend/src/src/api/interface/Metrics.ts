export type MetricsSummary = {
    period: {
        from: string
        to: string
    }

    total_submissions: number
    cache_hit_rate: number
    avg_pipeline_latency_ms: number
    fallback_rate: number
    estimated_cost_usd: number
    active_students: number
    active_teachers: number
    avg_score_system: number
    top_error_type: string | null
    note?: string
}

export interface DailyMetric {
    date: string
    submissions: number
    cache_hits: number
    llm_calls: number
    estimated_cost_usd: number
    avg_score: number
}

export interface AuditLog {
    id: string
    user_id: string
    action: string
    created_at: string
}