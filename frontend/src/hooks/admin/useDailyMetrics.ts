import { useEffect, useState } from "react"
import { AdminService } from "../../api/service/admin/adminService"
import type { DailyMetric } from "../../api/interface/Metrics"

export function useDailyMetrics() {

    const [data, setData] = useState<DailyMetric[]>([])
    const [loading, setLoading] = useState(false)

    const fetch = async () => {
        try {
            setLoading(true)
            const res = await AdminService.dailyMetrics()
            setData(res)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch()
    }, [])

    return { data, loading, refresh: fetch }
}