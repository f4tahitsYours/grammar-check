import { useEffect, useState } from 'react'
import { AdminService } from '../../api/service/admin/adminService'
import type { MetricsSummary } from '../../api/interface/Metrics'

export function useAdminDashboard() {

    const [metrics, setMetrics] =
        useState<MetricsSummary | null>(null)

    const [loading, setLoading] =
        useState(false)

    const fetchSummary = async () => {

        try {

            setLoading(true)

            // ✅ FIX DI SINI
            const data =
                await AdminService.metricsSummary(7)

            setMetrics(data)

        } catch (err) {

            console.error(err)

        } finally {

            setLoading(false)

        }
    }

    useEffect(() => {
        fetchSummary()
    }, [])

    return {
        metrics,
        loading,
        refresh: fetchSummary
    }
}