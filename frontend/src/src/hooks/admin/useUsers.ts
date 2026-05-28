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

    // FETCH USERS
    const fetchUsers = async () => {

        try {

            setLoading(true)

            const data = await AdminService.users({
                role: role || undefined
            })

            const normalizedUsers = (data.users || []).map((u: User) => ({
                ...u,
                school_name: u.school_name ?? null,
                school_id: u.school_id ?? null
            }))

            setUsers(normalizedUsers)

        } catch (err) {

            console.error('GET USERS ERROR:', err)

        } finally {

            setLoading(false)
        }
    }

    // FETCH SCHOOLS
    const fetchSchools = async () => {

        try {

            const data = await AdminService.getSchools()

            setSchools(Array.isArray(data) ? data : [])

        } catch (err) {

            console.error('GET SCHOOLS ERROR:', err)
        }
    }

    // ASSIGN USER TO SCHOOL
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

            console.error('ASSIGN SCHOOL ERROR:', err)
        }
    }

    // INIT
    useEffect(() => {

        fetchUsers()
        fetchSchools()

    }, [role])

    // FRONTEND SEARCH
    const filteredUsers = users.filter((u) => {

        const keyword = search.toLowerCase()

        return (
            u.name.toLowerCase().includes(keyword) ||
            u.email.toLowerCase().includes(keyword)
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

        refreshUsers: fetchUsers,

        handleAssignSchool
    }
}