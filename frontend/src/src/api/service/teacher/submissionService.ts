import api from '../../axios'

export const getSubmissionDetail = async (
    submissionId: string
) => {

    const response = await api.get(
        `/teacher/submission/${submissionId}`
    )

    return response.data
}

export const reviewSubmission = async (
    submissionId: string,
    payload: {
        score_content: number
        score_unity: number
    }
) => {

    const response = await api.patch(
        `/teacher/submission/${submissionId}/review`,
        payload
    )

    return response.data
}