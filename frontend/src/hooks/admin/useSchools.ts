import { useEffect, useState } from 'react'
import api from '../../api/axios'

type School = {
    id: string
    name: string
    total_users: number
    created_at?: string
}

export function useSchools() {

    const [schools, setSchools] = useState<School[]>([])
    const [loading, setLoading] = useState(false)

    // GET ALL SCHOOLS
    const fetchSchools = async () => {
        try {
            setLoading(true)

            const res = await api.get('/admin/schools')

            setSchools(Array.isArray(res.data) ? res.data : [])

        } catch (error) {
            console.log('GET SCHOOLS ERROR:', error)
            setSchools([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchools()
    }, [])

    // CREATE
    const handleCreateSchool = async (name: string) => {
        try {
            if (!name.trim()) return

            await api.post('/admin/schools', { name: name.trim() })

            await fetchSchools()

        } catch (error) {
            console.log('CREATE ERROR:', error)
        }
    }

    // UPDATE SCHOOL
    const handleUpdateSchool = async (id: string, name: string) => {
        try {
            await api.patch(`/admin/schools/${id}`, { name })

            await fetchSchools()

        } catch (error) {
            console.log('UPDATE ERROR:', error)
        }
    }

    // ✅ ASSIGN USER TO SCHOOL (NEW)
    const handleAssignUserSchool = async (
        userId: string,
        schoolId: string
    ) => {
        try {
            await api.patch(`/admin/users/${userId}/school`, {
                school_id: schoolId
            })

            await fetchSchools()

        } catch (error) {
            console.log('ASSIGN ERROR:', error)
        }
    }

    return {
        schools,
        loading,
        fetchSchools,
        handleCreateSchool,
        handleUpdateSchool,
        handleAssignUserSchool
    }
}