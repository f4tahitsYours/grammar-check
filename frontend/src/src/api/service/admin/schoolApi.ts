import api from '../../axios'

// GET ALL SCHOOLS
export const getSchools = async () => {

    const res = await api.get('/admin/schools')

    return res.data
}

// CREATE SCHOOL
export const createSchool = async (
    name: string
) => {

    const res = await api.post(
        '/admin/schools',
        { name }
    )

    return res.data
}

// UPDATE SCHOOL
export const updateSchool = async (
    schoolId: string,
    name: string
) => {

    const res = await api.patch(
        `/admin/schools/${schoolId}`,
        { name }
    )

    return res.data
}

// ASSIGN USER TO SCHOOL
export const assignUserSchool = async (
    userId: string,
    schoolId: string
) => {

    const res = await api.patch(
        `/admin/users/${userId}/school`,
        {
            school_id: schoolId
        }
    )

    return res.data
}