import { useEffect, useState } from "react"
import { AdminService } from "../../api/service/admin/adminService"
import type { DailyMetric } from "../../api/interface/Metrics"

export function useAdminDailyMetrics() {

    const [data, setData] = useState<DailyMetric[]>([])
    const [loading, setLoading] = useState(false)

    const fetch = async () => {
        setLoading(true)
        try {
            const res = await AdminService.dailyMetrics()
            setData(res)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch()
    }, [])

    return { data, loading, refresh: fetch }
}