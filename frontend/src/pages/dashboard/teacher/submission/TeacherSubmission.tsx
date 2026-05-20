import { useMemo, useState } from 'react'

import PageTransition from '../../../../components/common/PageTransition'
import DashboardLayout from '../../../../components/layout/DashboardLayout'

import { usePendingReviews } from '../../../../hooks/teacher/usePendingReviews'
import { useSubmissionDetail } from '../../../../hooks/teacher/useSubmissionDetail'

import {
    reviewSubmission
} from '../../../../api/teacherApi'

import {
    Clock3,
    Search,
    ArrowRight,
    X
} from 'lucide-react'

function TeacherSubmission() {

    const {
        data,
        loading,
        refetch
    } = usePendingReviews()

    const {
        data: detail,
        fetchDetail,
        loading: detailLoading
    } = useSubmissionDetail()

    const [open, setOpen] =
        useState(false)

    const [search, setSearch] =
        useState('')

    const [scoreContent, setScoreContent] =
        useState<number>(0)

    const [scoreUnity, setScoreUnity] =
        useState<number>(0)

    const [submitLoading, setSubmitLoading] =
        useState(false)

    const filteredItems = useMemo(() => {

        if (!data?.length) return []

        return data.filter((item: any) =>
            item.student_name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        )

    }, [data, search])

    const handleReviewSubmit = async () => {

        if (!detail?.id) return

        try {

            setSubmitLoading(true)

            await reviewSubmission(
                detail.id,
                {
                    score_content: scoreContent,
                    score_unity: scoreUnity
                }
            )

            setOpen(false)

            setScoreContent(0)
            setScoreUnity(0)

            refetch()

        } catch (error) {

            console.log(error)

            alert('Failed review submission')

        } finally {

            setSubmitLoading(false)
        }
    }

    return (
        <DashboardLayout>
            <PageTransition>

                <div className="space-y-6">

                    {/* HEADER */}
                    <div
                        className="
                            overflow-hidden
                            rounded-2xl
                            bg-gradient-to-r
                            from-amber-500
                            to-orange-500
                            p-5
                            text-white
                            shadow-lg
                            sm:p-6
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-5
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >

                            {/* LEFT */}
                            <div className="max-w-2xl">

                                <p className="text-sm font-medium text-orange-100">
                                    Teacher Submission
                                </p>

                                <h1
                                    className="
                                        mt-2
                                        text-2xl
                                        font-bold
                                        leading-tight
                                        sm:text-3xl
                                    "
                                >
                                    Pending Student Reviews
                                </h1>

                                <p className="mt-3 text-sm leading-relaxed text-orange-100 sm:text-base">
                                    Review student writing submissions awaiting
                                    teacher assessment.
                                </p>

                            </div>

                            {/* RIGHT */}
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    bg-white/10
                                    px-4
                                    py-3
                                    backdrop-blur-sm
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-white/20
                                    "
                                >
                                    <Clock3 size={22} />
                                </div>

                                <div>

                                    <p className="text-xs text-orange-100">
                                        Pending Reviews
                                    </p>

                                    <h3 className="text-xl font-bold">
                                        {data?.length || 0}
                                    </h3>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* SEARCH */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-4
                            shadow-sm
                            dark:bg-slate-900
                            sm:p-5
                        "
                    >

                        <div className="relative">

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
                                    focus:border-amber-500
                                    dark:border-slate-700
                                    dark:bg-slate-900
                                    dark:text-white
                                "
                            />

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
                                        Loading pending submissions...
                                    </p>

                                </div>

                            )}

                            {!loading && filteredItems.length === 0 && (

                                <div
                                    className="
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-slate-300
                                        py-16
                                        text-center
                                    "
                                >

                                    <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
                                        No Pending Reviews
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        All student submissions have been reviewed.
                                    </p>

                                </div>

                            )}

                            {!loading && filteredItems.map((item: any) => (

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
                                        hover:border-amber-200
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

                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-amber-100
                                                font-semibold
                                                text-amber-600
                                            "
                                        >
                                            {item.student_name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-2">

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

                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-amber-100
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-medium
                                                        text-amber-700
                                                    "
                                                >
                                                    Pending
                                                </span>

                                            </div>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(
                                                    item.created_at
                                                ).toLocaleString()}
                                            </p>

                                        </div>

                                    </div>

                                    {/* RIGHT */}
                                    <button
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            bg-amber-500
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            text-white
                                        "
                                    >

                                        Review

                                        <ArrowRight size={16} />

                                    </button>

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
                            max-w-4xl
                            overflow-y-auto
                            rounded-2xl
                            bg-white
                            p-4
                            shadow-2xl
                            transition-all
                            duration-300
                            dark:bg-slate-900
                            sm:p-6

                            ${open
                                ? 'translate-y-0 scale-100 opacity-100'
                                : 'translate-y-10 scale-95 opacity-0'}
                        `}
                    >

                        {/* HEADER */}
                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    Review Submission
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Review student writing and provide assessment.
                                </p>

                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-500
                                    text-white
                                "
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* LOADING */}
                        {detailLoading && (

                            <div className="py-10 text-center">

                                <p className="animate-pulse text-slate-500">
                                    Loading submission detail...
                                </p>

                            </div>

                        )}

                        {/* DETAIL */}
                        {!detailLoading && detail && (

                            <div className="mt-6 space-y-6">

                                {/* ORIGINAL */}
                                <div>

                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                        Original Text
                                    </h3>

                                    <div
                                        className="
                                            mt-3
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            p-4
                                            dark:border-slate-800
                                            dark:bg-slate-800/40
                                        "
                                    >

                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                            {detail.original_text}
                                        </p>

                                    </div>

                                </div>

                                {/* CORRECTED */}
                                <div>

                                    <h3 className="font-semibold text-slate-800 dark:text-white">
                                        Corrected Text
                                    </h3>

                                    <div
                                        className="
                                            mt-3
                                            rounded-2xl
                                            border
                                            border-emerald-200
                                            bg-emerald-50
                                            p-4
                                            dark:border-emerald-900
                                            dark:bg-emerald-950/20
                                        "
                                    >

                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                            {detail.corrected_text}
                                        </p>

                                    </div>

                                </div>

                                {/* SCORE */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">

                                        <p className="text-sm text-slate-500">
                                            Grammar Score
                                        </p>

                                        <p className="mt-2 text-2xl font-bold dark:text-white">
                                            {detail.score_grammar ?? '-'}
                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">

                                        <p className="text-sm text-slate-500">
                                            Mechanics Score
                                        </p>

                                        <p className="mt-2 text-2xl font-bold dark:text-white">
                                            {detail.score_mechanics ?? '-'}
                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">

                                        <p className="text-sm text-slate-500">
                                            Content Score
                                        </p>

                                        <p className="mt-2 text-2xl font-bold dark:text-white">
                                            {detail.score_content ?? '-'}
                                        </p>

                                    </div>

                                    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">

                                        <p className="text-sm text-slate-500">
                                            Unity Score
                                        </p>

                                        <p className="mt-2 text-2xl font-bold dark:text-white">
                                            {detail.score_unity ?? '-'}
                                        </p>

                                    </div>

                                </div>

                                {/* REVIEW FORM */}
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        p-5
                                        dark:border-slate-800
                                    "
                                >

                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        Teacher Review
                                    </h3>

                                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className="mb-2 block text-sm font-medium dark:text-slate-300">
                                                Content Score
                                            </label>

                                            <input
                                                type="number"
                                                value={scoreContent}
                                                onChange={(e) =>
                                                    setScoreContent(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    px-4
                                                    py-3
                                                    outline-none
                                                    focus:border-amber-500
                                                    dark:border-slate-700
                                                    dark:bg-slate-900
                                                    dark:text-white
                                                "
                                            />

                                        </div>

                                        <div>

                                            <label className="mb-2 block text-sm font-medium dark:text-slate-300">
                                                Unity Score
                                            </label>

                                            <input
                                                type="number"
                                                value={scoreUnity}
                                                onChange={(e) =>
                                                    setScoreUnity(
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    px-4
                                                    py-3
                                                    outline-none
                                                    focus:border-amber-500
                                                    dark:border-slate-700
                                                    dark:bg-slate-900
                                                    dark:text-white
                                                "
                                            />

                                        </div>

                                    </div>

                                    <div className="mt-6 flex justify-end">

                                        <button
                                            onClick={handleReviewSubmit}
                                            disabled={submitLoading}
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                bg-amber-500
                                                px-5
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-white
                                                transition-all
                                                hover:bg-amber-600
                                                disabled:opacity-60
                                            "
                                        >

                                            {submitLoading
                                                ? 'Submitting...'
                                                : 'Submit Review'}

                                            <ArrowRight size={16} />

                                        </button>

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

export default TeacherSubmission