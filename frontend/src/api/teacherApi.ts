import api from './axios'

/* =========================
   DASHBOARD
========================= */
export const getTeacherDashboard = async () => {

    const response = await api.get(
        '/teacher/dashboard?page=1&limit=20'
    )

    return response.data
}

/* =========================
   SUBMISSION DETAIL
========================= */
export const getSubmissionDetail = async (
    submissionId: string
) => {

    const response = await api.get(
        `/teacher/submission/${submissionId}`
    )

    return response.data
}

/* =========================
   GET ASSIGNMENTS
========================= */
export const getTeacherAssignments = async () => {

    const response = await api.get(
        '/teacher/assignment'
    )

    return response.data
}

/* =========================
   CREATE ASSIGNMENT
========================= */
export const createTeacherAssignment = async (
    payload: {
        title: string
        description: string
        class_target: string
        rubric: {
            grammar_weight: number
            mechanics_weight: number
            content_weight: number
            unity_weight: number
            grading_scale: {
                [key: string]: string
            }
        }
    }
) => {

    console.log(
        'SEND CREATE ASSIGNMENT:',
        payload
    )

    const response = await api.post(
        '/teacher/assignment',
        payload
    )

    return response.data
}

/* =========================
   UPDATE ASSIGNMENT
========================= */
export const updateTeacherAssignment = async (
    assignmentId: string,
    payload: {
        title: string
        description: string
        class_target: string
        rubric: {
            grammar_weight: number
            mechanics_weight: number
            content_weight: number
            unity_weight: number
            grading_scale: {
                [key: string]: string
            }
        }
    }
) => {

    const response = await api.patch(
        `/teacher/assignment/${assignmentId}`,
        payload
    )

    return response.data
}

/* =========================
   PENDING REVIEWS
========================= */
export const getPendingReviews = async () => {

    const response = await api.get(
        '/teacher/pending-reviews'
    )

    return response.data
}

/* =========================
   REVIEW SUBMISSION
========================= */
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

/* =========================
   EXPORT REPORT CSV
========================= */
export const exportTeacherReport = async (
    params?: {
        student_id?: string
        assignment_id?: string
        rubric_status?: string
    }
) => {

    const query =
        new URLSearchParams()

    if (params?.student_id) {

        query.append(
            'student_id',
            params.student_id
        )

    }

    if (params?.assignment_id) {

        query.append(
            'assignment_id',
            params.assignment_id
        )

    }

    if (params?.rubric_status) {

        query.append(
            'rubric_status',
            params.rubric_status
        )

    }

    const response = await api.get(

        `/teacher/export?${query.toString()}`,

        {
            responseType: 'blob'
        }

    )

    /* CREATE FILE */
    const blob =
        new Blob(
            [response.data],
            {
                type: 'text/csv'
            }
        )

    /* CREATE URL */
    const url =
        window.URL.createObjectURL(blob)

    /* CREATE LINK */
    const link =
        document.createElement('a')

    link.href = url

    link.download =
        `teacher-report-${Date.now()}.csv`

    document.body.appendChild(link)

    link.click()

    /* CLEANUP */
    link.remove()

    window.URL.revokeObjectURL(url)

    return true
}