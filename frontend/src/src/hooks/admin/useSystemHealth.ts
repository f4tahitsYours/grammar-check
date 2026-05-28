import { useEffect, useState } from 'react'
import { getHealth } from '../../api/service/admin/adminApi'

export function useSystemHealth() {

    const [health, setHealth] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchHealth = async () => {

            try {

                const res = await getHealth()
                setHealth(res)

            } catch (err) {

                console.error(err)

            } finally {

                setLoading(false)
            }
        }

        fetchHealth()

    }, [])

    return {
        health,
        loading
    }
}