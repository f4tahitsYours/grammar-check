import api from '../../axios'

// Student Submit Submission
export const submitGrammar = async (
    text: string,
    assignmentId: string
) => {

    const response = await api.post(
        '/student/submit',
        {
            text,
            assignment_id: assignmentId
        }
    )

    return response.data
}

// Generate TTS
export const generateTTS = async (
    submissionId: string
) => {

    const response = await api.post(
        `/student/tts/generate?submission_id=${submissionId}`
    )

    return response.data
}

// Generate Poster
export const generatePoster = async (
    submissionId: string
) => {

    const response = await api.post(
        `/student/poster/generate?submission_id=${submissionId}`
    )

    return response.data
}

// Submission History Student
export const getSubmissionHistory = async (
    page = 1,
    limit = 20
) => {

    const response = await api.get(
        `/student/submissions?page=${page}&limit=${limit}`
    )

    return response.data
}

/* GET ASSIGNMENTS */
export const getAssignments = async () => {

    const response = await api.get(
        '/student/assignments'
    )

    return response.data
}

// Student Submissions Detail
export const getSubmissionDetail = async (
    submissionId: string
) => {

    const response = await api.get(
        `/student/submission/${submissionId}`
    )

    return response.data
}