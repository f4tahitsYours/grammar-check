import { useState } from 'react'

import PageTransition
from '../../../../components/common/PageTransition'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import {
    Clock3,
    ChevronRight,
    FileText,
    Sparkles,
    X
} from 'lucide-react'

import {
    useSubmissionHistory
} from '../../../../hooks/student/useSubmissionHistory'

function History() {

    const {

        loading,
        histories,
        averageScore

    } = useSubmissionHistory()

    // MODAL STATE
    const [open, setOpen] = useState(false)

    const [detailLoading, setDetailLoading] =
        useState(false)

    const [detail, setDetail] = useState<any>(null)

    // OPEN DETAIL
    const handleOpenDetail = async (item: any) => {

        setOpen(true)

        setDetailLoading(true)

        // REAL DATA
        setTimeout(() => {

            setDetail(item)

            setDetailLoading(false)

        }, 300)
    }

    // SHORT TITLE
    const getShortTitle = (text: string) => {

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
                                                {getShortTitle(
                                                    item.original_text
                                                )}
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

                                        <div className="text-right">

                                            <p className="text-xs text-slate-400">
                                                Score
                                            </p>

                                            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                {item.score ?? 0}
                                            </h3>

                                        </div>

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

                {/* MODAL */}
                <div
                    className={`
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        p-4
                        backdrop-blur-sm
                        transition-all
                        duration-300

                        ${open
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'}
                    `}
                >

                    <div
                        className={`
                            w-full
                            max-w-5xl
                            overflow-hidden
                            rounded-2xl
                            bg-white
                            shadow-2xl
                            transition-all
                            duration-300
                            dark:bg-slate-900

                            ${open
                                ? 'translate-y-0 scale-100 opacity-100'
                                : 'translate-y-5 scale-95 opacity-0'}
                        `}
                    >

                        {/* SCROLL AREA */}
                        <div
                            className="
                                max-h-[88vh]
                                overflow-y-auto
                                scroll-smooth
                                overscroll-contain
                                scrollbar-thin
                                scrollbar-thumb-slate-300
                                scrollbar-track-transparent
                                dark:scrollbar-thumb-slate-700
                            "
                            style={{
                                scrollBehavior: 'smooth'
                            }}
                        >

                            {/* HEADER */}
                            <div
                                className="
                                    sticky
                                    top-0
                                    z-10
                                    flex
                                    items-start
                                    justify-between
                                    gap-4
                                    border-b
                                    border-slate-100
                                    bg-white/90
                                    px-5
                                    py-4
                                    backdrop-blur-xl
                                    dark:border-slate-800
                                    dark:bg-slate-900/90
                                "
                            >

                                <div>

                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        Submission Detail
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        See your grammar correction result
                                    </p>

                                </div>

                                <button
                                    onClick={() => setOpen(false)}
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-slate-100
                                        text-slate-600
                                        transition
                                        hover:bg-red-500
                                        hover:text-white
                                        dark:bg-slate-800
                                        dark:text-slate-300
                                    "
                                >
                                    <X size={18} />
                                </button>

                            </div>

                            {/* BODY */}
                            <div className="space-y-7 p-5 sm:p-7">

                                {detailLoading ? (

                                    <div className="space-y-4 animate-pulse">

                                        <div className="h-5 w-40 rounded-full bg-slate-200 dark:bg-slate-700"></div>

                                        <div className="space-y-2">

                                            <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                            <div className="h-4 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                            <div className="h-4 w-4/6 rounded-full bg-slate-200 dark:bg-slate-700"></div>

                                        </div>

                                    </div>

                                ) : detail && (

                                    <div className="space-y-8">

                                        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

                                            {/* LEFT */}
                                            <div className="space-y-7">

                                                <div>

                                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                                        Original Text
                                                    </h3>

                                                    <p
                                                        className="
                                                            mt-3
                                                            text-sm
                                                            leading-8
                                                            text-slate-600
                                                            dark:text-slate-300
                                                        "
                                                    >
                                                        {detail.original_text || '-'}
                                                    </p>

                                                </div>

                                                <div>

                                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                                        Corrected Text
                                                    </h3>

                                                    <div
                                                        className="
                                                            mt-3
                                                            rounded-3xl
                                                            bg-green-50
                                                            p-5
                                                            dark:bg-green-950/20
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                leading-8
                                                                text-green-700
                                                                dark:text-green-300
                                                            "
                                                        >
                                                            {detail.corrected_text || '-'}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* RIGHT */}
                                            <div>

                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    Submission Information
                                                </h3>

                                                <div className="mt-4 flex gap-3">

                                                    {/* WORD */}
                                                    <div
                                                        className="
                                                            flex
                                                            flex-1
                                                            items-center
                                                            gap-3
                                                            rounded-2xl
                                                            bg-slate-100
                                                            px-3
                                                            py-3
                                                            dark:bg-slate-800
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                h-11
                                                                w-11
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-indigo-500
                                                                text-base
                                                                font-bold
                                                                text-white
                                                            "
                                                        >
                                                            {detail.word_count ?? 0}
                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                                Word Count
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                Total words
                                                            </p>

                                                        </div>

                                                    </div>

                                                    {/* ERROR */}
                                                    <div
                                                        className="
                                                            flex
                                                            flex-1
                                                            items-center
                                                            gap-3
                                                            rounded-2xl
                                                            bg-slate-100
                                                            px-3
                                                            py-3
                                                            dark:bg-slate-800
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                h-11
                                                                w-11
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-rose-500
                                                                text-base
                                                                font-bold
                                                                text-white
                                                            "
                                                        >
                                                            {detail.error_count ?? 0}
                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                                Errors
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                Grammar mistakes
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* DATE */}
                                                <div className="mt-7 grid gap-5 sm:grid-cols-2">

                                                    <div>

                                                        <p className="text-sm text-slate-400">
                                                            Created At
                                                        </p>

                                                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                                                            {detail.created_at
                                                                ? new Date(
                                                                    detail.created_at
                                                                ).toLocaleString()
                                                                : '-'}
                                                        </p>

                                                    </div>

                                                    <div className="sm:pl-6">

                                                        <p className="text-sm text-slate-400">
                                                            Reviewed At
                                                        </p>

                                                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                                                            {detail.reviewed_at
                                                                ? new Date(
                                                                    detail.reviewed_at
                                                                ).toLocaleString()
                                                                : '-'}
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                        {/* FEEDBACK */}
                                        <div>

                                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                                Feedback
                                            </h3>

                                            <div
                                                className="
                                                    mt-3
                                                    rounded-3xl
                                                    bg-indigo-50
                                                    p-5
                                                    dark:bg-indigo-950/20
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-sm
                                                        leading-8
                                                        text-slate-700
                                                        dark:text-slate-300
                                                    "
                                                >
                                                    {detail.feedback || '-'}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default History