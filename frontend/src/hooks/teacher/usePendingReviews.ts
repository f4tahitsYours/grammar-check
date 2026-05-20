import { useEffect, useState } from 'react'

import {
    getPendingReviews
} from '../../api/teacherApi'

interface PendingReview {
    submission_id: string
    student_name: string
    assignment_title?: string
    created_at: string
    score: number
    rubric_status?: string
}

export function usePendingReviews() {

    const [data, setData] =
        useState<PendingReview[]>([])

    const [loading, setLoading] =
        useState(true)

    const fetchPendingReviews = async () => {

        try {

            setLoading(true)

            const result =
                await getPendingReviews()

            setData(
                result?.items || result || []
            )

        } catch (error) {

            console.error(
                'FAILED FETCH PENDING REVIEWS:',
                error
            )

            setData([])

        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {

        fetchPendingReviews()

    }, [])

    return {
        data,
        loading,
        refetch: fetchPendingReviews
    }
}