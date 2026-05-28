import { useEffect, useState } from 'react'
import { getCacheStats } from '../../api/service/admin/adminApi'

export function useCacheStats() {

    const [cacheStats, setCacheStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchStats = async () => {

            try {

                const res = await getCacheStats()
                setCacheStats(res)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchStats()

    }, [])

    return {
        cacheStats,
        loading
    }
}