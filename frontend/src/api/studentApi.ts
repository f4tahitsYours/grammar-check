import api from "./axios"

/* SUBMIT GRAMMAR */
export const submitGrammar = async (
    text: string,
    assignmentId: string | null
) => {

    const response = await api.post(
        "/student/submit",
        {
            text,
            assignment_id: assignmentId
        }
    )

    return response.data
}

/* GENERATE TTS */
export const generateTTS = async (
    submissionId: string
) => {

    const response = await api.post(
        `/student/tts/generate?submission_id=${submissionId}`
    )

    return response.data.audio_url
}

/* GENERATE POSTER */
export const generatePoster = async (
    submissionId: string
) => {

    const response = await api.post(
        `/student/poster/generate?submission_id=${submissionId}`
    )

    return response.data.poster_url
}

/* GET HISTORY */
export const getSubmissionHistory = async (
    page = 1,
    limit = 20
) => {

    const response = await api.get(
        `/student/submissions?page=${page}&limit=${limit}`
    )

    return response.data
}

/* GET DETAIL */
export const getSubmissionDetail = async (
    submissionId: string
) => {

    const response = await api.get(
        `/student/submission/${submissionId}`
    )

    return response.data
}