import PageTransition from '../../../components/common/PageTransition'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { useUsers } from '../../../hooks/admin/useUsers'
import {
    Users,
    ClipboardList,
    Activity,
    ShieldCheck,
    Database,
    HeartPulse,
    ScrollText,
    Trash2
} from 'lucide-react'

import {
    deleteUser,
    updateUserRole,
    getCacheStats,
    getHealth,
    getAuditLog,
    clearCache
} from '../../../api/service/admin/adminApi'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts'

import AdminStatCard from '../../../components/ui/card/AdminStatCard'
import UsersTable from '../../../components/dashboard/admin/UsersTable'

import { useAdminDashboard } from '../../../hooks/admin/useAdminDashboard'
import { useDailyMetrics } from '../../../hooks/admin/useDailyMetrics'

import {
    useEffect,
    useState
} from 'react'

function AdminDashboard() {

    const { metrics, loading: loadingMetrics } = useAdminDashboard()

    const {
        data: dailyData,
        loading: loadingChart
    } = useDailyMetrics()

    const {
        users,
        loading: loadingUsers,
        search,
        setSearch,
        role,
        setRole,
        refreshUsers
    } = useUsers()

    const [cacheStats, setCacheStats] = useState<any>(null)
    const [health, setHealth] = useState<any>(null)
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [loadingSystem, setLoadingSystem] = useState(true)

    const isLoading =
        loadingMetrics ||
        loadingChart

    const fetchSystemData = async () => {

        try {

            setLoadingSystem(true)

            const [
                cacheRes,
                healthRes,
                auditRes
            ] = await Promise.all([
                getCacheStats(),
                getHealth(),
                getAuditLog({
                    limit: 2
                })
            ])

            setCacheStats(cacheRes)
            setHealth(healthRes)
            setAuditLogs(auditRes.logs || [])

        } catch (err) {

            console.error(err)

        } finally {

            setLoadingSystem(false)
        }
    }

    useEffect(() => {

        fetchSystemData()

    }, [])

    const handleDelete = async (
        userId: string
    ) => {

        setPopup({
            open: true,
            type: 'confirm',
            title: 'Delete User',
            message: 'Are you sure want to delete this user?',
            action: async () => {

                try {

                    await deleteUser(userId)

                    await refreshUsers()

                    setPopup({
                        open: true,
                        type: 'success',
                        title: 'Success',
                        message: 'User deleted successfully'
                    })

                } catch (err) {

                    console.error(err)

                    setPopup({
                        open: true,
                        type: 'error',
                        title: 'Failed',
                        message: 'Failed to delete user'
                    })
                }
            }
        })
    }

    const handleChangeRole = async (
        userId: string,
        role: string
    ) => {

        try {

            await updateUserRole(
                userId,
                role
            )

            await refreshUsers()

            setPopup({
                open: true,
                type: 'success',
                title: 'Success',
                message: 'Role updated successfully'
            })

        } catch (err) {

            console.error(err)

            setPopup({
                open: true,
                type: 'error',
                title: 'Failed',
                message: 'Failed to update role'
            })
        }
    }

    const handleClearCache = async () => {

        setPopup({
            open: true,
            type: 'confirm',
            title: 'Clear Cache',
            message: 'Are you sure want to clear all cache?',
            action: async () => {

                try {

                    await clearCache()

                    await fetchSystemData()

                    setPopup({
                        open: true,
                        type: 'success',
                        title: 'Success',
                        message: 'Cache cleared successfully'
                    })

                } catch (err) {

                    console.error(err)

                    setPopup({
                        open: true,
                        type: 'error',
                        title: 'Failed',
                        message: 'Failed to clear cache'
                    })
                }
            }
        })
    }

    const [popup, setPopup] = useState<{
        open: boolean
        type: 'success' | 'error' | 'confirm'
        title: string
        message: string
        action?: () => void
    }>({
        open: false,
        type: 'success',
        title: '',
        message: ''
    })

    return (
        <DashboardLayout>

            <PageTransition>

                <div className="space-y-6">

                    {/* HEADER */}
                    <div
                        className="
                            rounded-2xl
                            bg-gradient-to-r
                            from-slate-900
                            to-slate-800
                            dark:from-slate-950
                            dark:to-slate-900
                            p-6
                            text-white
                        "
                    >

                        <h1 className="text-2xl md:text-3xl font-bold">
                            Admin Dashboard
                        </h1>

                        <p className="mt-1 text-sm md:text-base text-slate-300">
                            Monitor system, users, and activity
                        </p>

                    </div>

                    {/* LOADING */}
                    {isLoading && (
                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                xl:grid-cols-4
                                gap-4
                            "
                        >

                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="
                                        h-28
                                        rounded-2xl
                                        bg-slate-200
                                        dark:bg-slate-800
                                        animate-pulse
                                    "
                                />
                            ))}

                        </div>
                    )}

                    {/* STATS */}
                    {!isLoading && (
                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                xl:grid-cols-4
                                gap-4
                            "
                        >

                            <AdminStatCard
                                title="Active Students"
                                value={metrics?.active_students ?? 0}
                                icon={<Users />}
                            />

                            <AdminStatCard
                                title="Active Teachers"
                                value={metrics?.active_teachers ?? 0}
                                icon={<ClipboardList />}
                            />

                            <AdminStatCard
                                title="Avg Score"
                                value={metrics?.avg_score_system ?? 0}
                                icon={<Activity />}
                            />

                            <AdminStatCard
                                title="Top Error"
                                value={metrics?.top_error_type ?? '-'}
                                icon={<ShieldCheck />}
                            />

                        </div>
                    )}

                    {/* SYSTEM OVERVIEW */}
                    {/* SYSTEM OVERVIEW */}
<div
    className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-4
        items-stretch
    "
>

    {/* HEALTH */}
    <div
        className="
            rounded-3xl
            border
            border-slate-200/70
            dark:border-slate-800
            bg-white
            dark:bg-slate-900/90
            shadow-sm
            hover:shadow-md
            transition-all
            p-5
            md:p-6
            flex
            flex-col
            min-h-[240px]
        "
    >

        <div className="flex items-start gap-4 mb-5">

            <div
                className="
                    flex-shrink-0
                    h-12
                    w-12
                    rounded-2xl
                    bg-green-100
                    dark:bg-green-500/10
                    text-green-600
                    dark:text-green-400
                    flex
                    items-center
                    justify-center
                "
            >
                <HeartPulse size={22} />
            </div>

            <div className="min-w-0">

                <h3
                    className="
                        text-lg
                        font-semibold
                        text-slate-800
                        dark:text-white
                    "
                >
                    System Health
                </h3>

                <p
                    className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                    "
                >
                    API & database monitoring
                </p>

            </div>

        </div>

        {loadingSystem ? (

            <div
                className="
                    flex-1
                    rounded-2xl
                    bg-slate-100
                    dark:bg-slate-800
                    animate-pulse
                "
            />

        ) : (

            <div className="space-y-4 flex-1">

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        bg-slate-50
                        dark:bg-slate-800/60
                        px-4
                        py-3
                    "
                >

                    <span
                        className="
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        Status
                    </span>

                    <span
                        className={`
                            inline-flex
                            items-center
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-semibold

                            ${
                                health?.status === 'healthy'
                                    ? `
                                        bg-green-100
                                        text-green-700
                                        dark:bg-green-500/15
                                        dark:text-green-400
                                      `
                                    : `
                                        bg-red-100
                                        text-red-700
                                        dark:bg-red-500/15
                                        dark:text-red-400
                                      `
                            }
                        `}
                    >
                        {health?.status || '-'}
                    </span>

                </div>

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        bg-slate-50
                        dark:bg-slate-800/60
                        px-4
                        py-3
                    "
                >

                    <span
                        className="
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        Database
                    </span>

                    <span
                        className="
                            text-sm
                            font-semibold
                            text-slate-700
                            dark:text-slate-200
                            text-right
                            break-all
                        "
                    >
                        {health?.database || '-'}
                    </span>

                </div>

            </div>

        )}

    </div>

    {/* CACHE */}
    <div
        className="
            rounded-3xl
            border
            border-slate-200/70
            dark:border-slate-800
            bg-white
            dark:bg-slate-900/90
            shadow-sm
            hover:shadow-md
            transition-all
            p-5
            md:p-6
            flex
            flex-col
            min-h-[240px]
        "
    >

        <div className="flex items-start gap-4 mb-5">

            <div
                className="
                    flex-shrink-0
                    h-12
                    w-12
                    rounded-2xl
                    bg-indigo-100
                    dark:bg-indigo-500/10
                    text-indigo-600
                    dark:text-indigo-400
                    flex
                    items-center
                    justify-center
                "
            >
                <Database size={22} />
            </div>

            <div className="min-w-0">

                <h3
                    className="
                        text-lg
                        font-semibold
                        text-slate-800
                        dark:text-white
                    "
                >
                    Cache Stats
                </h3>

                <p
                    className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                    "
                >
                    Grammar cache overview
                </p>

            </div>

        </div>

        {loadingSystem ? (

            <div
                className="
                    flex-1
                    rounded-2xl
                    bg-slate-100
                    dark:bg-slate-800
                    animate-pulse
                "
            />

        ) : (

            <div className="flex flex-col flex-1">

                <div className="space-y-4">

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            bg-slate-50
                            dark:bg-slate-800/60
                            px-4
                            py-3
                        "
                    >

                        <span
                            className="
                                text-sm
                                text-slate-500
                                dark:text-slate-400
                            "
                        >
                            Entries
                        </span>

                        <span
                            className="
                                text-base
                                font-bold
                                text-slate-800
                                dark:text-white
                            "
                        >
                            {cacheStats?.total_cache_entries ?? 0}
                        </span>

                    </div>

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            rounded-2xl
                            bg-slate-50
                            dark:bg-slate-800/60
                            px-4
                            py-3
                        "
                    >

                        <span
                            className="
                                text-sm
                                text-slate-500
                                dark:text-slate-400
                            "
                        >
                            Cache Hits
                        </span>

                        <span
                            className="
                                text-base
                                font-bold
                                text-slate-800
                                dark:text-white
                            "
                        >
                            {cacheStats?.cache_hit_count_all_time ?? 0}
                        </span>

                    </div>

                </div>

                <div className="mt-auto pt-5">

                    <button
                        onClick={handleClearCache}
                        className="
                            w-full
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            bg-red-500
                            hover:bg-red-600
                            active:scale-[0.99]
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            transition-all
                        "
                    >

                        <Trash2 size={16} />

                        Clear Cache

                    </button>

                </div>

            </div>

        )}

    </div>

    {/* RECENT AUDIT */}
    <div
        className="
            rounded-3xl
            border
            border-slate-200/70
            dark:border-slate-800
            bg-white
            dark:bg-slate-900/90
            shadow-sm
            hover:shadow-md
            transition-all
            p-5
            md:p-6
            flex
            flex-col
            min-h-[240px]
        "
    >

        <div className="flex items-start gap-4 mb-5">

            <div
                className="
                    flex-shrink-0
                    h-12
                    w-12
                    rounded-2xl
                    bg-yellow-100
                    dark:bg-yellow-500/10
                    text-yellow-600
                    dark:text-yellow-400
                    flex
                    items-center
                    justify-center
                "
            >
                <ScrollText size={22} />
            </div>

            <div className="min-w-0">

                <h3
                    className="
                        text-lg
                        font-semibold
                        text-slate-800
                        dark:text-white
                    "
                >
                    Recent Audit Logs
                </h3>

                <p
                    className="
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                    "
                >
                    Latest admin activity
                </p>

            </div>

        </div>

        {loadingSystem ? (

            <div
                className="
                    flex-1
                    rounded-2xl
                    bg-slate-100
                    dark:bg-slate-800
                    animate-pulse
                "
            />

        ) : (

            <div className="space-y-3 flex-1">

                {auditLogs.length === 0 && (

                    <div
                        className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-dashed
                            border-slate-200
                            dark:border-slate-700
                            py-10
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        No audit logs found
                    </div>

                )}

                {auditLogs.map((log) => (

                    <div
                        key={log.id}
                        className="
                            rounded-2xl
                            border
                            border-slate-200
                            dark:border-slate-700
                            bg-slate-50/80
                            dark:bg-slate-800/50
                            p-4
                            transition-all
                            hover:border-slate-300
                            dark:hover:border-slate-600
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >

                            <div className="min-w-0">

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                        dark:text-white
                                        break-words
                                    "
                                >
                                    {log.action}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                        dark:text-slate-400
                                        break-all
                                    "
                                >
                                    {log.resource}
                                </p>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        )}

    </div>

</div>

                    {/* CHART */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            dark:bg-slate-900
                            shadow-sm
                            p-4
                            md:p-6
                        "
                    >

                        <h2
                            className="
                                mb-4
                                text-base
                                md:text-lg
                                font-semibold
                                text-slate-800
                                dark:text-white
                            "
                        >
                            Daily Submissions
                        </h2>

                        {loadingChart ? (

                            <div
                                className="
                                    h-72
                                    rounded-xl
                                    bg-slate-200
                                    dark:bg-slate-800
                                    animate-pulse
                                "
                            />

                        ) : (

                            <div className="w-full h-[300px] min-w-0">

                                <ResponsiveContainer width="100%" height={300}>

                                    <LineChart data={dailyData || []}>

                                        <CartesianGrid strokeDasharray="3 3" />

                                        <XAxis dataKey="date" />

                                        <YAxis />

                                        <Tooltip />

                                        <Line
                                            type="monotone"
                                            dataKey="submissions"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={false}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>

                    {/* USERS TABLE */}
                    <UsersTable
                        users={users}
                        loading={loadingUsers}
                        search={search}
                        setSearch={setSearch}
                        role={role}
                        setRole={setRole}
                        onDelete={handleDelete}
                        onChangeRole={handleChangeRole}
                    />

                </div>

                {/* POPUP */}
                {popup.open && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-black/40
                            backdrop-blur-sm
                            px-4
                        "
                    >

                        <div
                            className="
                                w-full
                                max-w-md
                                rounded-3xl
                                bg-white
                                dark:bg-slate-900
                                p-6
                                shadow-2xl
                                animate-in
                                fade-in
                                zoom-in-95
                            "
                        >

                            <div className="text-center">

                                <div
                                    className={`
                                        mx-auto
                                        mb-4
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-full

                                        ${
                                            popup.type === 'success'
                                                ? 'bg-green-100 text-green-600'
                                                : popup.type === 'error'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                        }
                                    `}
                                >

                                    {popup.type === 'success' && '✓'}
                                    {popup.type === 'error' && '✕'}
                                    {popup.type === 'confirm' && '?'}

                                </div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                        text-slate-800
                                        dark:text-white
                                    "
                                >
                                    {popup.title}
                                </h2>

                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-slate-500
                                        dark:text-slate-400
                                    "
                                >
                                    {popup.message}
                                </p>

                                <div className="mt-6 flex gap-3">

                                    {popup.type === 'confirm' ? (

                                        <>
                                            <button
                                                onClick={() =>
                                                    setPopup({
                                                        ...popup,
                                                        open: false
                                                    })
                                                }
                                                className="
                                                    flex-1
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    py-3
                                                    font-medium
                                                    text-slate-600
                                                    hover:bg-slate-100
                                                    transition
                                                "
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                onClick={async () => {

                                                    setPopup({
                                                        ...popup,
                                                        open: false
                                                    })

                                                    if (popup.action) {
                                                        await popup.action()
                                                    }
                                                }}
                                                className="
                                                    flex-1
                                                    rounded-xl
                                                    bg-red-500
                                                    py-3
                                                    font-medium
                                                    text-white
                                                    hover:bg-red-600
                                                    transition
                                                "
                                            >
                                                Confirm
                                            </button>
                                        </>

                                    ) : (

                                        <button
                                            onClick={() =>
                                                setPopup({
                                                    ...popup,
                                                    open: false
                                                })
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                bg-indigo-600
                                                py-3
                                                font-medium
                                                text-white
                                                hover:bg-indigo-700
                                                transition
                                            "
                                        >
                                            OK
                                        </button>

                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </PageTransition>

        </DashboardLayout>
    )
}

export default AdminDashboard