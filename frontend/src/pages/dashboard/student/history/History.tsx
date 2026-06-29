import { useNavigate } from 'react-router-dom'

import PageTransition
from '../../../../components/common/PageTransition'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import {
    Clock3,
    ChevronRight,
    FileText,
    Sparkles
} from 'lucide-react'

import {
    useSubmissionHistory
} from '../../../../hooks/student/useSubmissionHistory'

function History() {

    const navigate = useNavigate()

    const {

        loading,
        histories,
        averageScore

    } = useSubmissionHistory()

    // OPEN DETAIL - Navigate to full SubmissionDetail page
    const handleOpenDetail = (item: any) => {
        navigate(`/dashboard/student/submission/${item.id}`)
    }

    // SHORT TITLE
    const getShortTitle = (item: any) => {

        // Prioritize assignment title if available
        if (item.assignment_title) {
            return item.assignment_title
        }
        
        // Otherwise use original text preview
        const text = item.original_text_preview || item.original_text || ''
        
        if (!text) return 'Untitled Submission'

        const words = text.split(' ')

        return words.length > 4
            ? `${words.slice(0, 4).join(' ')}...`
            : text
    }

    return (

        <DashboardLayout>

            <PageTransition>

                <div className="space-y-6">

                    {/* HEADER */}
                    <div>

                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                            History
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Track all your grammar submissions
                        </p>

                    </div>

                    {/* STATS */}
                    <div className="grid gap-4 sm:grid-cols-2">

                        {/* TOTAL */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-indigo-100
                                        text-indigo-600
                                        dark:bg-indigo-950/40
                                    "
                                >
                                    <FileText size={22} />
                                </div>

                                <div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Total Submission
                                    </p>

                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {histories.length}
                                    </h3>

                                </div>

                            </div>

                        </div>

                        {/* AVG */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-indigo-100
                                        text-indigo-600
                                        dark:bg-indigo-950/40
                                    "
                                >
                                    <Sparkles size={22} />
                                </div>

                                <div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Average Score
                                    </p>

                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {averageScore || 0}
                                    </h3>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* LIST */}
                    <div className="space-y-4">

                        {/* LOADING */}
                        {loading && (

                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Loading history...
                                </p>

                            </div>
                        )}

                        {/* EMPTY */}
                        {!loading && histories.length === 0 && (

                            <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">

                                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                                    No submission yet
                                </h3>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    Your grammar history will appear here
                                </p>

                            </div>
                        )}

                        {/* HISTORY */}
                        {!loading && histories.map((item: any) => (

                            <button
                                key={item.id}
                                onClick={() =>
                                    handleOpenDetail(item)
                                }
                                className="
                                    group
                                    w-full
                                    rounded-2xl
                                    bg-white
                                    p-4
                                    text-left
                                    shadow-sm
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-lg
                                    dark:bg-slate-900
                                "
                            >

                                <div className="flex items-center justify-between gap-4">

                                    {/* LEFT */}
                                    <div className="flex min-w-0 items-center gap-3">

                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                bg-indigo-100
                                                text-indigo-600
                                                dark:bg-indigo-950/40
                                            "
                                        >
                                            <FileText size={20} />
                                        </div>

                                        <div className="min-w-0">

                                            <h3
                                                className="
                                                    truncate
                                                    font-semibold
                                                    text-slate-800
                                                    dark:text-white
                                                "
                                            >
                                                {getShortTitle(item)}
                                            </h3>

                                            <div
                                                className="
                                                    mt-1
                                                    flex
                                                    items-center
                                                    gap-1
                                                    text-sm
                                                    text-slate-500
                                                    dark:text-slate-400
                                                "
                                            >

                                                <Clock3 size={14} />

                                                {new Date(
                                                    item.created_at
                                                ).toLocaleDateString()}

                                            </div>

                                        </div>

                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex items-center gap-3">

                                        {!item.score_hidden && (
                                            <div className="text-right">

                                                <p className="text-xs text-slate-400">
                                                    Score
                                                </p>

                                                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                    {item.score_total ?? item.score ?? 0}
                                                </h3>

                                            </div>
                                        )}

                                        {item.score_hidden && (
                                            <div className="text-right">

                                                <p className="text-xs text-slate-400">
                                                    Status
                                                </p>

                                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                    Score Hidden
                                                </p>

                                            </div>
                                        )}

                                        <ChevronRight
                                            size={20}
                                            className="
                                                text-slate-400
                                                transition
                                                group-hover:translate-x-1
                                            "
                                        />

                                    </div>

                                </div>

                            </button>
                        ))}

                    </div>

                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default History