import { useMemo, useState } from 'react'

import PageTransition from '../../../../components/common/PageTransition'
import DashboardLayout from '../../../../components/layout/DashboardLayout'

import { useTeacherDashboard } from '../../../../hooks/teacher/useTeacherDashboard'
import { useSubmissionDetail } from '../../../../hooks/teacher/useSubmissionDetail'

import {
    ArrowRight,
    Search,
    X
} from 'lucide-react'

function TeacherHistory() {

    const {
        data,
        loading
    } = useTeacherDashboard()

    const {
        data: detail,
        fetchDetail,
        loading: detailLoading
    } = useSubmissionDetail()

    const [open, setOpen] =
        useState(false)

    const [search, setSearch] =
        useState('')

    const filteredItems = useMemo(() => {

        if (!data?.items) return []

        return data.items
            .filter((item) =>
                item.student_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase())
            )
            .sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )

    }, [data, search])

    return (
        <DashboardLayout>
            <PageTransition>

                <div className="space-y-6">

                    {/* HEADER */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-sm
                            dark:bg-slate-900
                            sm:p-6
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >

                            <div>

                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                                    Submission History
                                </h1>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    View all student grammar submission history.
                                </p>

                            </div>

                            {/* SEARCH */}
                            <div className="relative w-full lg:max-w-sm">

                                <Search
                                    size={18}
                                    className="
                                        absolute
                                        left-4
                                        top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    className="
                                        w-full
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        py-3
                                        pl-11
                                        pr-4
                                        text-sm
                                        outline-none
                                        transition-all
                                        focus:border-indigo-500
                                        dark:border-slate-700
                                        dark:bg-slate-900
                                        dark:text-white
                                    "
                                />

                            </div>

                        </div>

                    </div>

                    {/* LIST */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-4
                            shadow-sm
                            dark:bg-slate-900
                            sm:p-6
                        "
                    >

                        <div className="space-y-4">

                            {loading && (

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-slate-300
                                        py-16
                                    "
                                >

                                    <p className="animate-pulse text-sm text-slate-500">
                                        Loading submission history...
                                    </p>

                                </div>

                            )}

                            {!loading && filteredItems.length === 0 && (

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-slate-300
                                        py-16
                                    "
                                >

                                    <p className="text-sm text-slate-500">
                                        No submission history found.
                                    </p>

                                </div>

                            )}

                            {!loading && filteredItems.map((item) => (

                                <div
                                    key={item.submission_id}
                                    onClick={() => {

                                        setOpen(true)

                                        fetchDetail(
                                            item.submission_id
                                        )
                                    }}
                                    className="
                                        cursor-pointer
                                        flex
                                        flex-col
                                        gap-4
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        p-4
                                        transition-all
                                        duration-300
                                        hover:-translate-y-1
                                        hover:border-indigo-200
                                        hover:bg-slate-50
                                        hover:shadow-md
                                        dark:border-slate-800
                                        dark:hover:bg-slate-800/40
                                        md:flex-row
                                        md:items-center
                                        md:justify-between
                                    "
                                >

                                    {/* LEFT */}
                                    <div className="flex min-w-0 items-center gap-4">

                                        {/* AVATAR */}
                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-indigo-100
                                                font-semibold
                                                text-indigo-600
                                            "
                                        >
                                            {item.student_name
                                                ?.charAt(0)
                                                .toUpperCase()}
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
                                                {item.student_name}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(
                                                    item.created_at
                                                ).toLocaleString()}
                                            </p>

                                        </div>

                                    </div>

                                    {/* RIGHT */}
                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            md:justify-end
                                        "
                                    >

                                        <div>

                                            <p className="text-xs text-slate-400">
                                                Grammar Score
                                            </p>

                                            <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                {item.score}
                                            </p>

                                        </div>

                                        <button
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                whitespace-nowrap
                                                rounded-xl
                                                bg-indigo-600
                                                px-4
                                                py-2
                                                text-sm
                                                font-medium
                                                text-white
                                                transition-all
                                                duration-300
                                                hover:bg-indigo-700
                                                hover:scale-105
                                                active:scale-95
                                            "
                                        >

                                            Review

                                            <ArrowRight size={16} />

                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

                {/* MODAL */}
                <div
                    className={`
                        fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4
                        transition-all duration-300
                        ${open
                            ? 'pointer-events-auto bg-black/50 opacity-100'
                            : 'pointer-events-none bg-black/0 opacity-0'}
                    `}
                >

                    <div
                        className={`
                            max-h-[90vh]
                            w-full
                            max-w-3xl
                            overflow-y-auto
                            rounded-2xl
                            bg-white
                            p-4
                            shadow-2xl
                            transition-all
                            duration-300
                            scroll-smooth
                            scrollbar-thin
                            scrollbar-thumb-slate-300
                            dark:scrollbar-thumb-slate-700
                            scrollbar-track-transparent
                            dark:bg-slate-900
                            sm:p-6

                            ${open
                                ? 'translate-y-0 scale-100 opacity-100'
                                : 'translate-y-10 scale-95 opacity-0'}
                        `}
                    >

                        {/* HEADER */}
                        <div className="flex items-center justify-between gap-4">

                            <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                                Submission Detail
                            </h2>

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
                                    bg-red-500
                                    text-white
                                    shadow-lg
                                    shadow-red-500/30
                                    transition-all
                                    duration-200
                                    hover:scale-110
                                    hover:bg-red-600
                                    active:scale-95
                                "
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {detailLoading ? (

                            <div className="space-y-5 py-4 animate-pulse">

                                <div className="h-7 w-52 rounded-xl bg-slate-200 dark:bg-slate-700"></div>

                                <div className="space-y-3">

                                    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-700"></div>

                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>

                                </div>

                            </div>

                        ) : detail && (

                            <div className="mt-6 space-y-6">

                                <div>

                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                        Original Text
                                    </h3>

                                    <p className="mt-2 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        {detail.original_text}
                                    </p>

                                </div>

                                <div>

                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                        Corrected Text
                                    </h3>

                                    <p className="mt-2 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                        {detail.corrected_text}
                                    </p>

                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Score
                                        </p>

                                        <p className="font-bold break-words text-slate-800 dark:text-white">
                                            {detail.score}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Grade
                                        </p>

                                        <p className="font-bold break-words text-slate-800 dark:text-white">
                                            {detail.grade}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Word Count
                                        </p>

                                        <p className="font-bold break-words text-slate-800 dark:text-white">
                                            {detail.word_count}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Error Count
                                        </p>

                                        <p className="font-bold break-words text-slate-800 dark:text-white">
                                            {detail.error_count}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Created At
                                        </p>

                                        <p className="font-bold break-words text-sm text-slate-800 dark:text-white">
                                            {new Date(
                                                detail.created_at
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Score Total
                                        </p>

                                        <p className="font-bold break-words text-slate-800 dark:text-white">
                                            {detail.score_total}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Reviewed At
                                        </p>

                                        <p className="font-bold break-words text-sm text-slate-800 dark:text-white">
                                            {detail.reviewed_at
                                                ? new Date(
                                                    detail.reviewed_at
                                                ).toLocaleString()
                                                : '-'}
                                        </p>
                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </PageTransition>
        </DashboardLayout>
    )
}

export default TeacherHistory