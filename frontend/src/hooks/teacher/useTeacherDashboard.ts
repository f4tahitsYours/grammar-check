import { useEffect, useState } from 'react'

import { getTeacherDashboard }
from '../../api/teacherApi'

import type {
    TeacherDashboardResponse
} from '../../types/teacher'

export function useTeacherDashboard() {

    const [data, setData] =
        useState<TeacherDashboardResponse | null>(null)

    const [loading, setLoading] =
        useState(false)

    const fetchDashboard = async () => {

        try {

            setLoading(true)

            const response =
                await getTeacherDashboard()

            setData(response)

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {

        fetchDashboard()

    }, [])

    return {
        data,
        loading
    }
}