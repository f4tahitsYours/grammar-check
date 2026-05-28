import api from '../../axios'

export const getTeacherAssignments = async () => {

    const response = await api.get(
        '/teacher/assignment'
    )

    return response.data
}

export const createTeacherAssignment = async (
    payload: any
) => {

    const response = await api.post(
        '/teacher/assignment',
        payload
    )

    return response.data
}

export const updateTeacherAssignment = async (
    assignmentId: string,
    payload: any
) => {

    const response = await api.patch(
        `/teacher/assignment/${assignmentId}`,
        payload
    )

    return response.data
}