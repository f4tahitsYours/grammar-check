import axios from '../../axios'

// METRICS SUMMARY
export const getMetricsSummary = async (
    days: number = 7
) => {

    const res = await axios.get(
        '/admin/metrics/summary',
        {
            params: { days }
        }
    )

    return res.data
}

// DAILY METRICS
export const getDailyMetrics = async (params?: {
    from_date?: string
    to_date?: string
}) => {

    const res = await axios.get(
        '/admin/metrics/daily',
        {
            params
        }
    )

    return res.data
}

// USERS
export const getUsers = async (params?: {
    page?: number
    limit?: number
    role?: string
    school_id?: string
    is_active?: boolean
}) => {

    const res = await axios.get(
        '/admin/users',
        {
            params
        }
    )

    return res.data
}

// UPDATE ROLE
export const updateUserRole = async (
    userId: string,
    role: string
) => {

    const res = await axios.patch(
        `/admin/users/${userId}/role`,
        { role }
    )

    return res.data
}
// DELETE USER
export const deleteUser = async (
    userId: string
) => {

    const res = await axios.delete(
        `/admin/users/${userId}`
    )

    return res.data
}

// AUDIT LOG
export const getAuditLog = async (params?: {
    page?: number
    limit?: number
    action?: string
    user_id?: string
    days?: number
}) => {

    const res = await axios.get(
        '/admin/audit-log',
        {
            params
        }
    )

    return res.data
}

// CACHE
export const clearCache = async () => {

    const res = await axios.delete(
        '/admin/cache'
    )

    return res.data
}

// CACHE STATS
export const getCacheStats = async () => {

    const res = await axios.get(
        '/admin/cache/stats'
    )

    return res.data
}

// HEALTH
export const getHealth = async () => {

    const res = await axios.get(
        '/admin/health'
    )

    return res.data
}

// ASSIGN USER SCHOOL
// export const assignUserSchool = async (
//     userId: string,
//     schoolId: string
// ) => {

//     const res = await axios.patch(
//         `/admin/users/${userId}/school`,
//         {
//             school_id: schoolId
//         }
//     )

//     return res.data
// }