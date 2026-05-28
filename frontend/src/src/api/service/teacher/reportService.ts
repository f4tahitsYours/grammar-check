import api from '../../axios'

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

    const blob =
        new Blob(
            [response.data],
            {
                type: 'text/csv'
            }
        )

    const url =
        window.URL.createObjectURL(blob)

    const link =
        document.createElement('a')

    link.href = url

    link.download =
        `teacher-report-${Date.now()}.csv`

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)

    return true
}