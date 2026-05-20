import { useMemo, useState } from 'react'
import PageTransition from '../../../components/common/PageTransition'
import { useNavigate } from 'react-router-dom'

import DashboardLayout from '../../../components/layout/DashboardLayout'

import { useTeacherDashboard } from '../../../hooks/teacher/useTeacherDashboard'
import { useSubmissionDetail } from '../../../hooks/teacher/useSubmissionDetail'

import {
    Users,
    ClipboardList,
    FileText,
    Sparkles,
    ArrowRight,
    Clock3,
    ChevronDown,
    X
} from 'lucide-react'

function TeacherDashboard() {

    const navigate = useNavigate()

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

    const teacherName =
        localStorage.getItem('user_name') || 'Teacher'

    const averageScore = useMemo(() => {

        if (!data?.items?.length) return 0

        const total =
            data.items.reduce(
                (acc, item) => acc + item.score,
                0
            )

        return Math.round(
            total / data.items.length
        )

    }, [data])

    return (
        <DashboardLayout>
            <PageTransition>
                <div className="space-y-5 sm:space-y-6">

                    {/* HERO */}
                    <div
                        className="
                            overflow-hidden
                            rounded-2xl
                            bg-gradient-to-r
                            from-indigo-600
                            to-indigo-500
                            p-4
                            text-white
                            shadow-lg
                            sm:rounded-3xl
                            sm:p-6
                            lg:p-8
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-6
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >

                            {/* LEFT */}
                            <div className="max-w-3xl">

                                <p className="text-sm font-medium text-indigo-100">
                                    Teacher Dashboard
                                </p>

                                <h1
                                    className="
                                        mt-2
                                        text-2xl
                                        font-bold
                                        leading-tight
                                        sm:text-3xl
                                        lg:text-4xl
                                    "
                                >
                                    Welcome Back, {teacherName} 👋
                                </h1>

                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        leading-relaxed
                                        text-indigo-100
                                        sm:text-base
                                    "
                                >
                                    Manage assignments, review student submissions,
                                    and monitor grammar performance from one dashboard.
                                </p>

                            </div>

                            {/* RIGHT */}
                            <div
                                className="
                                    flex
                                    w-full
                                    flex-col
                                    gap-3
                                    sm:w-auto
                                    sm:flex-row
                                    sm:flex-wrap
                                    lg:justify-end
                                "
                            >

                                <button
                                    onClick={() =>
                                        navigate('/dashboard/teacher/assignment/')
                                    }
                                    className="
                                        w-full
                                        rounded-2xl
                                        bg-white
                                        px-5
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-indigo-600
                                        transition-all
                                        duration-300
                                        hover:scale-[1.02]
                                        hover:bg-indigo-50
                                        active:scale-95
                                        sm:w-auto
                                    "
                                >
                                    View Assignment
                                </button>

                                <button
                                    onClick={ () => 
                                        navigate('/dashboard/teacher/reports')
                                    }
                                    className="
                                        w-full
                                        rounded-2xl
                                        border
                                        border-white/30
                                        bg-white/10
                                        px-5
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-white
                                        backdrop-blur-sm
                                        transition
                                        hover:bg-white/20
                                        sm:w-auto
                                    "
                                >
                                    View Reports
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* ACTIVE CLASS */}
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            rounded-2xl
                            bg-white
                            p-4
                            shadow-sm
                            dark:bg-slate-900
                            sm:p-5
                            md:flex-row
                            md:items-center
                            md:justify-between
                        "
                    >

                        {/* LEFT */}
                        <div className="min-w-0">

                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Active Class
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Dashboard data will follow the selected class
                            </p>

                        </div>

                        {/* DROPDOWN */}
                        <button
                            className="
                                flex
                                w-full
                                items-center
                                justify-between
                                gap-3
                                rounded-2xl
                                border
                                border-slate-300
                                bg-white
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                dark:border-slate-700
                                dark:bg-slate-900
                                dark:text-slate-200
                                dark:hover:bg-slate-800
                                sm:w-auto
                                sm:min-w-[220px]
                            "
                        >

                            <div className="text-left">

                                <p className="text-xs text-slate-400">
                                    Current Class
                                </p>

                                <p className="font-semibold">
                                    X IPA 1
                                </p>

                            </div>

                            <ChevronDown size={18} />

                        </button>

                    </div>

                    {/* STATS */}
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >

                        {/* TOTAL STUDENTS */}
                        <div
                            className="
                                rounded-2xl
                                bg-white
                                p-5
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-md
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Total Students
                                    </p>

                                    <h3
                                        className="
                                            mt-2
                                            truncate
                                            text-2xl
                                            font-bold
                                            text-slate-800
                                            dark:text-white
                                            sm:text-3xl
                                        "
                                    >
                                        {data?.total_students || 0}
                                    </h3>

                                </div>

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
                                    <Users size={22} />
                                </div>

                            </div>

                        </div>

                        {/* ACTIVE ASSIGNMENTS */}
                        <div
                            className="
                                rounded-2xl
                                bg-white
                                p-5
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-md
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Active Assignments
                                    </p>

                                    <h3
                                        className="
                                            mt-2
                                            truncate
                                            text-2xl
                                            font-bold
                                            text-slate-800
                                            dark:text-white
                                            sm:text-3xl
                                        "
                                    >
                                        {data?.active_assignments || 0}
                                    </h3>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-amber-100
                                        text-amber-600
                                    "
                                >
                                    <ClipboardList size={22} />
                                </div>

                            </div>

                        </div>

                        {/* SUBMISSIONS */}
                        <div
                            className="
                                rounded-2xl
                                bg-white
                                p-5
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-md
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        New Submissions
                                    </p>

                                    <h3
                                        className="
                                            mt-2
                                            truncate
                                            text-2xl
                                            font-bold
                                            text-slate-800
                                            dark:text-white
                                            sm:text-3xl
                                        "
                                    >
                                        {data?.items?.length || 0}
                                    </h3>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-emerald-100
                                        text-emerald-600
                                    "
                                >
                                    <FileText size={22} />
                                </div>

                            </div>

                        </div>

                        {/* AVERAGE SCORE */}
                        <div
                            className="
                                rounded-2xl
                                bg-white
                                p-5
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-md
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between gap-4">

                                <div className="min-w-0">

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Average Score
                                    </p>

                                    <h3
                                        className="
                                            mt-2
                                            truncate
                                            text-2xl
                                            font-bold
                                            text-slate-800
                                            dark:text-white
                                            sm:text-3xl
                                        "
                                    >
                                        {averageScore}%
                                    </h3>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-pink-100
                                        text-pink-600
                                    "
                                >
                                    <Sparkles size={22} />
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* MAIN GRID */}
                    {/* MAIN GRID */}
                    <div
                        className="
                            grid
                            gap-6
                            items-start
                            xl:grid-cols-[minmax(0,1fr)_320px]
                        "
                    >

                        {/* LEFT */}
                        <div
                            className="
                                min-w-0
                                rounded-2xl
                                bg-white
                                p-4
                                shadow-sm
                                dark:bg-slate-900
                                sm:p-6
                            "
                        >

                            {/* HEADER */}
                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <div className="min-w-0">

                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                        Recent Submissions
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Latest student grammar submissions
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        navigate('/dashboard/teacher/history/')
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        font-medium
                                        text-indigo-600
                                        transition-all
                                        duration-300
                                        hover:translate-x-1
                                        hover:text-indigo-700
                                    "
                                >
                                    View All
                                    <ArrowRight size={16} />
                                </button>

                            </div>

                            {/* LIST */}
                            <div className="mt-6 space-y-4">

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
                                            py-12
                                        "
                                    >

                                        <p className="animate-pulse text-center text-sm text-slate-500">
                                            Loading recent submission history...
                                        </p>

                                    </div>

                                )}

                                {!loading && data?.items
                                    ?.sort(
                                        (a, b) =>
                                            new Date(b.created_at).getTime() -
                                            new Date(a.created_at).getTime()
                                    )
                                    ?.slice(0, 3)
                                    .map((item) => (

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
                                                        ).toLocaleDateString()}
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
                                                </button>

                                            </div>

                                        </div>
                                    ))}

                            </div>

                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-col gap-4">

                            {/* QUICK ACTIONS */}
                            <div
                                className="
                                    rounded-2xl
                                    bg-white
                                    p-4
                                    shadow-sm
                                    dark:bg-slate-900
                                "
                            >

                                <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                                    Quick Actions
                                </h2>

                                <div className="mt-4 space-y-2.5">

                                    <button
                                        onClick={() =>
                                            navigate('/dashboard/teacher/assignment/')
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-3
                                            py-3
                                            text-left
                                            transition-all
                                            duration-300
                                            hover:border-indigo-200
                                            hover:bg-indigo-50
                                            dark:border-slate-800
                                            dark:hover:bg-slate-800
                                        "
                                    >

                                        <div>

                                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                Create Assignment
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                Publish task
                                            </p>

                                        </div>

                                        <ArrowRight
                                            size={16}
                                            className="text-slate-400"
                                        />

                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate('/dashboard/teacher/submission/')
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-3
                                            py-3
                                            text-left
                                            transition-all
                                            duration-300
                                            hover:border-indigo-200
                                            hover:bg-indigo-50
                                            dark:border-slate-800
                                            dark:hover:bg-slate-800
                                        "
                                    >

                                        <div>

                                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                Review Submission
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                Check pending
                                            </p>

                                        </div>

                                        <ArrowRight
                                            size={16}
                                            className="text-slate-400"
                                        />

                                    </button>

                                </div>

                            </div>

                            {/* DEADLINE */}
                            <div
                                className="
                                    rounded-2xl
                                    bg-white
                                    p-4
                                    shadow-sm
                                    dark:bg-slate-900
                                "
                            >

                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-red-100
                                            text-red-500
                                        "
                                    >
                                        <Clock3 size={18} />
                                    </div>

                                    <div>

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Upcoming Deadline
                                        </p>

                                        <h3 className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                                            Essay Assignment
                                        </h3>

                                    </div>

                                </div>

                                <div
                                    className="
                                        mt-4
                                        rounded-xl
                                        bg-slate-100
                                        p-3
                                        dark:bg-slate-800
                                    "
                                >

                                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                                        24 students have not submitted yet.
                                    </p>

                                    <button
                                        className="
                                            mt-3
                                            text-xs
                                            font-medium
                                            text-indigo-600
                                            hover:text-indigo-700
                                        "
                                    >
                                        View Details
                                    </button>

                                </div>

                            </div>

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
                            bg-black/40
                            backdrop-blur-sm
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

export default TeacherDashboard