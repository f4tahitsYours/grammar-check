import { useEffect, useState } from 'react'
import { getAuditLog } from '../../api/service/admin/adminApi'

interface AuditLogItem {
    id: string
    user_id: string
    action: string
    resource: string
    resource_id: string
    metadata: any
    created_at: string
}

export function useAuditLog() {

    const [logs, setLogs] = useState<AuditLogItem[]>([])
    const [loading, setLoading] = useState(false)

    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [total, setTotal] = useState(0)

    const [action, setAction] = useState('')
    const [userId, setUserId] = useState('')
    const [days, setDays] = useState(30)

    const fetchLogs = async () => {

        try {

            setLoading(true)

            const res = await getAuditLog({
                page,
                limit,
                action: action || undefined,
                user_id: userId || undefined,
                days
            })

            setLogs(res.logs || [])
            setTotal(res.total || 0)

        } catch (err) {

            console.error(err)

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [page, action, userId, days])

    return {
        logs,
        loading,

        page,
        setPage,

        total,
        limit,

        action,
        setAction,

        userId,
        setUserId,

        days,
        setDays,

        refresh: fetchLogs
    }
}