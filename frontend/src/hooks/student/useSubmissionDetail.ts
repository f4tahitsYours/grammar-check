import { useEffect, useState }
from 'react'

import {
    getSubmissionDetail
} from '../../api/service/student/studentApi'

export function useSubmissionDetail(
    id: string
) {

    const [loading, setLoading] =
        useState(true)

    const [data, setData] =
        useState<any>(null)

    useEffect(() => {

        const fetchDetail = async () => {

            try {

                setLoading(true)

                const response =
                    await getSubmissionDetail(id)

                setData(response)

            } catch (error) {

                console.log(error)

            } finally {

                setLoading(false)
            }
        }

        fetchDetail()

    }, [id])

    return {
        loading,
        data
    }
}