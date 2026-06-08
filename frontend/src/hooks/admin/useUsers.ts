import { useEffect, useState } from 'react'
import { AdminService } from '../../api/service/admin/adminService'
import type { User } from '../../api/interface/User'

type School = {
    id: string
    name: string
}

export function useUsers() {

    const [users, setUsers] = useState<User[]>([])
    const [schools, setSchools] = useState<School[]>([])

    const [loading, setLoading] = useState(false)

    const [search, setSearch] = useState('')
    const [role, setRole] = useState('')

    const [schoolStatus, setSchoolStatus] = useState<
        'all' | 'assigned' | 'unassigned'
    >('all')

    // =========================
    // FETCH SCHOOLS
    // =========================
    const fetchSchools = async () => {

        try {

            const data = await AdminService.getSchools()

            const schoolList = Array.isArray(data)
                ? data
                : data?.schools || []

            setSchools(schoolList)

            return schoolList

        } catch (err) {

            console.error('GET SCHOOLS ERROR:', err)

            return []
        }
    }

    // =========================
    // FETCH USERS
    // =========================
    const fetchUsers = async () => {

        try {

            setLoading(true)

            const schoolList =
                schools.length > 0
                    ? schools
                    : await fetchSchools()

            const data = await AdminService.users({
                role: role || undefined
            })

            const normalizedUsers = (data.users || []).map((u: User) => {

                const school = schoolList.find(
                    (s: School) => s.id === u.school_id
                )

                return {
                    ...u,

                    school_id: u.school_id ?? null,

                    school_name:
                        u.school_name ||
                        school?.name ||
                        null
                }
            })

            setUsers(normalizedUsers)

        } catch (err) {

            console.error('GET USERS ERROR:', err)

        } finally {

            setLoading(false)
        }
    }

    // =========================
    // ASSIGN USER TO SCHOOL
    // =========================
    const handleAssignSchool = async (
        userId: string,
        schoolId: string
    ) => {

        try {

            await AdminService.assignUserSchool(
                userId,
                schoolId
            )

            await fetchUsers()

        } catch (err) {

            console.error(
                'ASSIGN SCHOOL ERROR:',
                err
            )
        }
    }

    // =========================
    // INIT
    // =========================
    useEffect(() => {

        const init = async () => {

            await fetchSchools()

            await fetchUsers()
        }

        init()

    }, [role])

    // =========================
    // SEARCH + FILTER
    // =========================
    const filteredUsers = users.filter((u) => {

        const keyword = search.toLowerCase()

        const matchSearch =
            u.name.toLowerCase().includes(keyword) ||
            u.email.toLowerCase().includes(keyword)

        const matchSchoolStatus =
            schoolStatus === 'all'
                ? true
                : schoolStatus === 'assigned'
                    ? !!u.school_id
                    : !u.school_id

        return (
            matchSearch &&
            matchSchoolStatus
        )
    })

    return {

        users: filteredUsers,
        schools,

        loading,

        search,
        setSearch,

        role,
        setRole,

        schoolStatus,
        setSchoolStatus,

        refreshUsers: fetchUsers,

        handleAssignSchool
    }
}