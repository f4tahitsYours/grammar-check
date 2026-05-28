import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageTransition from '../../../components/common/PageTransition'
import { useAuditLog } from '../../../hooks/admin/useAuditLog'
import { ChevronDown } from 'lucide-react'

function AuditLogPage() {

    const {
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
        setDays
    } = useAuditLog()

    const totalPages = Math.ceil(total / limit)

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
                            Audit Logs
                        </h1>

                        <p className="mt-1 text-sm text-slate-300">
                            System activity tracking
                        </p>

                    </div>

                    {/* FILTER */}
                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-4
                            gap-3
                        "
                    >

                        <input
                            value={action}
                            onChange={(e) => {

                                setPage(1)
                                setAction(e.target.value)

                            }}
                            placeholder="Filter action (e.g user.role_change)"
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-900
                                px-4
                                py-2.5
                                text-sm
                                text-slate-700
                                dark:text-slate-200
                                placeholder:text-slate-400
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                            "
                        />

                        <input
                            value={userId}
                            onChange={(e) => {

                                setPage(1)
                                setUserId(e.target.value)

                            }}
                            placeholder="User ID"
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-900
                                px-4
                                py-2.5
                                text-sm
                                text-slate-700
                                dark:text-slate-200
                                placeholder:text-slate-400
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                            "
                        />

                        <div className="relative">
                            <select
                                value={days}
                                onChange={(e) => {

                                    setPage(1)
                                    setDays(Number(e.target.value))

                                }}
                                className="
                                    w-full
                                    appearance-none
                                    rounded-xl
                                    border
                                    border-slate-200
                                    dark:border-slate-700
                                    bg-white
                                    dark:bg-slate-900
                                    px-4
                                    py-2.5
                                    pr-10
                                    text-sm
                                    text-slate-700
                                    dark:text-slate-200
                                    outline-none
                                    transition
                                    focus:border-indigo-500
                                    focus:ring-2
                                    focus:ring-indigo-500/20
                                "
                            >

                                <option value={7}>
                                    Last 7 days
                                </option>

                                <option value={30}>
                                    Last 30 days
                                </option>

                                <option value={90}>
                                    Last 90 days
                                </option>

                            </select>

                            <ChevronDown
                                size={18}
                                className="
                                    pointer-events-none
                                    absolute
                                    right-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                        </div>
                    </div>

                    {/* TABLE */}
                    <div
                        className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            dark:border-slate-800
                            bg-white
                            dark:bg-slate-900
                            shadow-sm
                        "
                    >

                        {loading ? (

                            <div className="p-4">

                                <div
                                    className="
                                        h-40
                                        animate-pulse
                                        rounded-xl
                                        bg-slate-200
                                        dark:bg-slate-800
                                    "
                                />

                            </div>

                        ) : (

                            <div
                                className="
                                    overflow-x-auto
                                    scrollbar-thin
                                    scrollbar-thumb-slate-300
                                    dark:scrollbar-thumb-slate-700
                                    scrollbar-track-transparent
                                    scroll-smooth
                                ">

                                <table className="min-w-[1000px] w-full text-sm">

                                    <thead>

                                        <tr
                                            className="
                                                border-b
                                                border-slate-200
                                                dark:border-slate-800
                                                bg-slate-50
                                                dark:bg-slate-950
                                                text-left
                                            "
                                        >

                                            <th
                                                className="
                                                    px-4
                                                    py-3
                                                    font-semibold
                                                    text-slate-600
                                                    dark:text-slate-300
                                                "
                                            >
                                                User
                                            </th>

                                            <th
                                                className="
                                                    px-4
                                                    py-3
                                                    font-semibold
                                                    text-slate-600
                                                    dark:text-slate-300
                                                "
                                            >
                                                Action
                                            </th>

                                            <th
                                                className="
                                                    px-4
                                                    py-3
                                                    font-semibold
                                                    text-slate-600
                                                    dark:text-slate-300
                                                "
                                            >
                                                Resource
                                            </th>

                                            <th
                                                className="
                                                    px-4
                                                    py-3
                                                    font-semibold
                                                    text-slate-600
                                                    dark:text-slate-300
                                                "
                                            >
                                                Metadata
                                            </th>

                                            <th
                                                className="
                                                    px-4
                                                    py-3
                                                    font-semibold
                                                    text-slate-600
                                                    dark:text-slate-300
                                                "
                                            >
                                                Date
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {logs.map((log) => (

                                            <tr
                                                key={log.id}
                                                className="
                                                    border-b
                                                    border-slate-100
                                                    dark:border-slate-800
                                                    hover:bg-slate-50
                                                    dark:hover:bg-slate-800/50
                                                    transition
                                                "
                                            >

                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        text-slate-700
                                                        dark:text-slate-200
                                                    "
                                                >
                                                    {log.user_id}
                                                </td>

                                                <td className="px-4 py-3">

                                                    <span
                                                        className="
                                                            rounded-full
                                                            bg-blue-100
                                                            px-2.5
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            text-blue-700

                                                            dark:bg-blue-500/10
                                                            dark:text-blue-300
                                                        "
                                                    >
                                                        {log.action}
                                                    </span>

                                                </td>

                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        text-slate-700
                                                        dark:text-slate-200
                                                    "
                                                >
                                                    {log.resource}
                                                </td>

                                                <td className="px-4 py-3">

                                                    <pre
                                                        className="
                                                            max-w-[300px]
                                                            overflow-auto
                                                            rounded-lg
                                                            bg-slate-100
                                                            dark:bg-slate-800
                                                            p-2
                                                            text-xs
                                                            text-slate-700
                                                            dark:text-slate-300
                                                        "
                                                    >
                                                        {JSON.stringify(log.metadata, null, 2)}
                                                    </pre>

                                                </td>

                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        text-slate-600
                                                        dark:text-slate-300
                                                    "
                                                >
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                    {/* PAGINATION */}
                    <div className="flex items-center gap-3">

                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-900
                                px-4
                                py-2
                                text-sm
                                text-slate-700
                                dark:text-slate-200
                                hover:bg-slate-100
                                dark:hover:bg-slate-800
                                disabled:opacity-50
                                transition
                            "
                        >
                            Prev
                        </button>

                        <span
                            className="
                                text-sm
                                text-slate-600
                                dark:text-slate-300
                            "
                        >
                            Page {page} / {totalPages || 1}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-900
                                px-4
                                py-2
                                text-sm
                                text-slate-700
                                dark:text-slate-200
                                hover:bg-slate-100
                                dark:hover:bg-slate-800
                                disabled:opacity-50
                                transition
                            "
                        >
                            Next
                        </button>

                    </div>

                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default AuditLogPage