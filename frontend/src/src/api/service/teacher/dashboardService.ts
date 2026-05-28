import api from '../../axios'

export const getTeacherDashboard = async () => {

    const response = await api.get(
        '/teacher/dashboard?page=1&limit=20'
    )

    return response.data
}