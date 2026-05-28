import { useState } from 'react'

import {
    getSubmissionDetail
} from '../../api/service/teacher/submissionService'

import type {
    SubmissionDetailResponse
} from '../../types/teacher'

export function useSubmissionDetail() {

    const [data, setData] =
        useState<SubmissionDetailResponse | null>(null)

    const [loading, setLoading] =
        useState(false)

    const fetchDetail = async (
        submissionId: string
    ) => {

        try {

            setLoading(true)

            const response =
                await getSubmissionDetail(
                    submissionId
                )

            setData(response)

        } catch (error) {

            console.log(
                'FAILED FETCH DETAIL:',
                error
            )

        } finally {

            setLoading(false)
        }
    }

    return {
        data,
        loading,
        fetchDetail
    }
}