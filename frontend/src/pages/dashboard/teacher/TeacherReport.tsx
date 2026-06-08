import { useEffect, useMemo, useState } from 'react'

import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageTransition from '../../../components/common/PageTransition'

import { useNavigate } from 'react-router-dom'

import {
    ArrowLeft,
    Download,
    FileText,
    Sparkles,
    Search,
    Eye,
    Loader2,
    Filter,
    RefreshCcw,
    X,
    CalendarDays,
    User2,
    ClipboardCheck
} from 'lucide-react'

import {
    exportTeacherReport,
    getTeacherDashboard,
    getSubmissionDetail
} from '../../../api/teacherApi'

type ReportItem = {
    submission_id: string
    student_name: string
    score: number
    created_at: string
    rubric_status?: string
    assignment_title?: string
}

function TeacherReports() {

    const navigate = useNavigate()

    const [reports, setReports] =
        useState<ReportItem[]>([])

    const [loading, setLoading] =
        useState(true)

    const [search, setSearch] =
        useState('')

    const [status, setStatus] =
        useState('')

    /* =========================
       DETAIL MODAL
    ========================= */
    const [openDetail, setOpenDetail] =
        useState(false)

    const [detailLoading, setDetailLoading] =
        useState(false)

    const [detail, setDetail] =
        useState<any>(null)

    /* =========================
       FETCH REPORTS
    ========================= */
    const fetchReports = async () => {

        try {

            setLoading(true)

            const response =
                await getTeacherDashboard()

            setReports(
                response?.items || []
            )

        } catch (error) {

            console.log(error)

            setReports([])

        } finally {

            setLoading(false)

        }

    }

    useEffect(() => {

        fetchReports()

    }, [])

    /* =========================
       NORMALIZE STATUS
       COMPLETE = reviewed
       AWAITING REVIEW = not reviewed
    ========================= */
    const normalizeStatus = (
        item: ReportItem
    ) => {

        if (
            item.rubric_status === 'reviewed' ||
            item.rubric_status === 'graded' ||
            item.rubric_status === 'complete'
        ) {

            return 'complete'
        }

        return 'awaiting_review'
    }

    /* =========================
       FILTER DATA
    ========================= */
    const filteredData = useMemo(() => {

        return reports.filter((item) => {

            const normalizedStatus =
                normalizeStatus(item)

            const keyword =
                search.toLowerCase()

            /* SEARCH:
               - student name
               - assignment
            */
            const matchSearch =

                item.student_name
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.assignment_title
                    ?.toLowerCase()
                    .includes(keyword)

            const matchStatus =
                status
                    ? normalizedStatus === status
                    : true

            return (
                matchSearch &&
                matchStatus
            )

        })

    }, [reports, search, status])

    /* =========================
       AVG SCORE
    ========================= */
    const averageScore = useMemo(() => {

        if (!filteredData.length)
            return 0

        return Math.round(

            filteredData.reduce(
                (acc, item) =>
                    acc + item.score,
                0
            ) / filteredData.length

        )

    }, [filteredData])

    /* =========================
       TOTAL COMPLETE
    ========================= */
    const totalComplete =
        filteredData.filter(
            (item) =>
                normalizeStatus(item)
                === 'complete'
        ).length

    /* =========================
       TOTAL REVIEW
    ========================= */
    const totalAwaiting =
        filteredData.filter(
            (item) =>
                normalizeStatus(item)
                === 'awaiting_review'
        ).length

    /* =========================
       EXPORT CSV
    ========================= */
    const handleExport = async () => {

        try {

            await exportTeacherReport({

                rubric_status:
                    status || undefined

            })

        } catch (error) {

            console.log(error)

            alert(
                'Failed to export CSV report'
            )

        }

    }
    /* =========================
       VIEW DETAIL
    ========================= */
    const handleViewDetail = async (
        submissionId: string
    ) => {

        try {

            setOpenDetail(true)

            setDetailLoading(true)

            const response =
                await getSubmissionDetail(
                    submissionId
                )

            setDetail(response)

        } catch (error) {

            console.log(error)

            setDetail(null)

        } finally {

            setDetailLoading(false)

        }

    }

    return (

        <DashboardLayout>

            <PageTransition>

                <div className="space-y-6">

                    {/* HERO */}
                    <div
                        className="
                            overflow-hidden
                            rounded-3xl
                            bg-gradient-to-r
                            from-indigo-600
                            via-indigo-500
                            to-purple-500
                            p-6
                            text-white
                            shadow-xl
                            sm:p-8
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
                                    Teacher Analytics
                                </p>

                                <h1
                                    className="
                                        mt-2
                                        text-3xl
                                        font-bold
                                        leading-tight
                                        sm:text-4xl
                                    "
                                >
                                    Submission Reports
                                </h1>

                                <p
                                    className="
                                        mt-3
                                        max-w-2xl
                                        text-sm
                                        leading-relaxed
                                        text-indigo-100
                                        sm:text-base
                                    "
                                >
                                    Analyze student grammar
                                    submissions, review
                                    progress, average score,
                                    and export report data.
                                </p>

                            </div>

                            {/* ACTION */}
                            <div
                                className="
                                    flex
                                    w-full
                                    flex-col
                                    gap-3
                                    sm:w-auto
                                    sm:flex-row
                                "
                            >

                                <button
                                    onClick={() =>
                                        navigate(-1)
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
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
                                        transition-all
                                        duration-300
                                        hover:bg-white/20
                                    "
                                >

                                    <ArrowLeft size={18} />

                                    Back

                                </button>

                                <button
                                    onClick={handleExport}
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
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
                                    "
                                >

                                    <Download size={18} />

                                    Export CSV

                                </button>

                            </div>

                        </div>

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

                        {/* TOTAL */}
                        <div
                            className="
                                rounded-3xl
                                bg-white
                                p-5
                                shadow-sm
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Total Reports
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {filteredData.length}
                                    </h2>

                                </div>

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
                                    "
                                >
                                    <FileText size={22} />
                                </div>

                            </div>

                        </div>

                        {/* AVG */}
                        <div
                            className="
                                rounded-3xl
                                bg-white
                                p-5
                                shadow-sm
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Average Score
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {averageScore}%
                                    </h2>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
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

                        {/* COMPLETE */}
                        <div
                            className="
                                rounded-3xl
                                bg-white
                                p-5
                                shadow-sm
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Complete
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {totalComplete}
                                    </h2>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-emerald-100
                                        text-emerald-600
                                    "
                                >
                                    <ClipboardCheck size={22} />
                                </div>

                            </div>

                        </div>

                        {/* REVIEW */}
                        <div
                            className="
                                rounded-3xl
                                bg-white
                                p-5
                                shadow-sm
                                dark:bg-slate-900
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-sm text-slate-500">
                                        Awaiting Review
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {totalAwaiting}
                                    </h2>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-amber-100
                                        text-amber-600
                                    "
                                >
                                    <Loader2 size={22} />
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* FILTER */}
                    <div
                        className="
                            rounded-3xl
                            bg-white
                            p-5
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        <div className="flex items-center gap-2">

                            <Filter
                                size={18}
                                className="text-indigo-600"
                            />

                            <h2 className="font-semibold text-slate-800 dark:text-white">
                                Filter Reports
                            </h2>

                        </div>

                        <div
                            className="
                                mt-5
                                grid
                                gap-4
                                lg:grid-cols-3
                            "
                        >

                            {/* SEARCH */}
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
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search student or assignment..."
                                    className="
                                        w-full
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        py-3
                                        pl-11
                                        pr-4
                                        text-left
                                        text-sm
                                        outline-none
                                        transition-all
                                        focus:border-indigo-500
                                        focus:ring-4
                                        focus:ring-indigo-100
                                        dark:border-slate-700
                                        dark:bg-slate-800
                                        dark:text-white
                                    "
                                />

                            </div>

                            {/* STATUS */}
                            <div className="relative">

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
                                    }
                                    className="
                                        w-full
                                        appearance-none
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-4
                                        py-3
                                        pr-10
                                        text-sm
                                        outline-none
                                        transition-all
                                        focus:border-indigo-500
                                        focus:ring-4
                                        focus:ring-indigo-100

                                        dark:border-slate-700
                                        dark:bg-slate-800
                                        dark:text-white
                                    "
                                >
                                    <option value="">
                                        All Submission Status
                                    </option>

                                    <option value="complete">
                                        Complete
                                    </option>

                                    <option value="awaiting_review">
                                        Awaiting Review
                                    </option>

                                </select>

                                {/* CUSTOM DROPDOWN ICON */}
                                <div className="
                                    pointer-events-none
                                    absolute
                                    right-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                ">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M6 9l6 6 6-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                            </div>

                            {/* BUTTON */}
                            <button
                                onClick={fetchReports}
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-indigo-600
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition-all
                                    duration-300
                                    hover:bg-indigo-700
                                "
                            >

                                <RefreshCcw size={18} />

                                Refresh Report

                            </button>

                        </div>

                    </div>

                    {/* TABLE */}
                    <div
                        className="
                            overflow-hidden
                            rounded-3xl
                            bg-white
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        {/* HEADER */}
                        <div
                            className="
                                border-b
                                border-slate-200
                                px-6
                                py-5
                                dark:border-slate-800
                            "
                        >

                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Submission Report List
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                All grammar submission activity
                            </p>

                        </div>

                        {/* BODY */}
                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[900px]">

                                <thead
                                    className="
                                        bg-slate-50
                                        dark:bg-slate-800/50
                                    "
                                >

                                    <tr>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            Student
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            Assignment
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            Score
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="px-6 py-20"
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-3
                                                        text-slate-500
                                                    "
                                                >

                                                    <Loader2
                                                        size={20}
                                                        className="animate-spin"
                                                    />

                                                    Loading report data...

                                                </div>

                                            </td>

                                        </tr>

                                    ) : filteredData.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="px-6 py-20 text-center text-slate-500"
                                            >
                                                No report data found
                                            </td>

                                        </tr>

                                    ) : (

                                        filteredData.map((item) => {

                                            const currentStatus =
                                                normalizeStatus(item)

                                            return (

                                                <tr
                                                    key={item.submission_id}
                                                    className="
                                                        border-t
                                                        border-slate-100
                                                        transition-all
                                                        hover:bg-slate-50
                                                        dark:border-slate-800
                                                        dark:hover:bg-slate-800/40
                                                    "
                                                >

                                                    {/* STUDENT */}
                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className="
                                                                    flex
                                                                    h-11
                                                                    w-11
                                                                    items-center
                                                                    justify-center
                                                                    rounded-full
                                                                    bg-indigo-100
                                                                    font-semibold
                                                                    text-indigo-600
                                                                "
                                                            >
                                                                {
                                                                    item.student_name
                                                                        ?.charAt(0)
                                                                        .toUpperCase()
                                                                }
                                                            </div>

                                                            <div>

                                                                <p className="font-semibold text-slate-800 dark:text-white">
                                                                    {
                                                                        item.student_name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-slate-400">
                                                                    Student Submission
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* ASSIGNMENT */}
                                                    <td className="px-6 py-4">

                                                        <p className="font-medium text-slate-700 dark:text-slate-300">
                                                            {
                                                                item.assignment_title ||
                                                                'Grammar Assignment'
                                                            }
                                                        </p>

                                                    </td>

                                                    {/* SCORE */}
                                                    <td className="px-6 py-4">

                                                        <span
                                                            className="
                                                                rounded-xl
                                                                bg-indigo-100
                                                                px-3
                                                                py-1.5
                                                                text-xs
                                                                font-semibold
                                                                text-indigo-700
                                                            "
                                                        >
                                                            {item.score}
                                                        </span>

                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`
                                                                rounded-full
                                                                px-3
                                                                py-1.5
                                                                text-xs
                                                                font-semibold

                                                                ${
                                                                    currentStatus === 'complete'
                                                                        ? `
                                                                            bg-emerald-100
                                                                            text-emerald-700
                                                                        `
                                                                        : `
                                                                            bg-amber-100
                                                                            text-amber-700
                                                                        `
                                                                }
                                                            `}
                                                        >

                                                            {
                                                                currentStatus === 'complete'
                                                                    ? 'Complete'
                                                                    : 'Awaiting Review'
                                                            }

                                                        </span>

                                                    </td>

                                                    {/* DATE */}
                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-slate-500">

                                                            <CalendarDays size={15} />

                                                            {
                                                                new Date(
                                                                    item.created_at
                                                                ).toLocaleDateString()
                                                            }

                                                        </div>

                                                    </td>

                                                    {/* ACTION */}
                                                    <td className="px-6 py-4">

                                                        <button
                                                            onClick={() =>
                                                                handleViewDetail(
                                                                    item.submission_id
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                                rounded-xl
                                                                bg-slate-100
                                                                px-4
                                                                py-2.5
                                                                text-sm
                                                                font-medium
                                                                text-slate-700
                                                                transition-all
                                                                hover:bg-indigo-100
                                                                hover:text-indigo-700
                                                                dark:bg-slate-800
                                                                dark:text-slate-300
                                                            "
                                                        >

                                                            <Eye size={16} />

                                                            View Detail

                                                        </button>

                                                    </td>

                                                </tr>

                                            )

                                        })

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

                {/* DETAIL MODAL */}
                {openDetail && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-black/50
                            p-4
                            backdrop-blur-sm
                        "
                    >

                        <div
                            className="
                                relative
                                max-h-[90vh]
                                w-full
                                max-w-4xl
                                overflow-y-auto
                                rounded-3xl
                                bg-white
                                p-6
                                shadow-2xl
                                dark:bg-slate-900
                            "
                        >

                            {/* CLOSE */}
                            <button
                                onClick={() =>
                                    setOpenDetail(false)
                                }
                                className="
                                    absolute
                                    right-5
                                    top-5
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-500
                                    text-white
                                    transition-all
                                    hover:scale-105
                                "
                            >

                                <X size={18} />

                            </button>

                            {/* LOADING */}
                            {detailLoading ? (

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-3
                                        py-24
                                        text-slate-500
                                    "
                                >

                                    <Loader2
                                        size={22}
                                        className="animate-spin"
                                    />

                                    Loading submission detail...

                                </div>

                            ) : detail ? (

                                <div className="space-y-6">

                                    <div>

                                        <p className="text-sm font-medium text-indigo-600">
                                            Submission Detail
                                        </p>

                                        <h2 className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                                            {
                                                detail.student_name ||
                                                'Student Submission'
                                            }
                                        </h2>

                                    </div>

                                    {/* GRID */}
                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            md:grid-cols-2
                                        "
                                    >

                                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">

                                            <div className="flex items-center gap-2">

                                                <User2
                                                    size={18}
                                                    className="text-indigo-600"
                                                />

                                                <p className="font-semibold text-slate-700 dark:text-white">
                                                    Score
                                                </p>

                                            </div>

                                            <h3 className="mt-3 text-3xl font-bold text-slate-800 dark:text-white">
                                                {
                                                    detail.score
                                                }
                                            </h3>

                                        </div>

                                        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">

                                            <div className="flex items-center gap-2">

                                                <ClipboardCheck
                                                    size={18}
                                                    className="text-emerald-600"
                                                />

                                                <p className="font-semibold text-slate-700 dark:text-white">
                                                    Grade
                                                </p>

                                            </div>

                                            <h3 className="mt-3 text-3xl font-bold text-slate-800 dark:text-white">
                                                {
                                                    detail.grade ||
                                                    '-'
                                                }
                                            </h3>

                                        </div>

                                    </div>

                                    {/* ORIGINAL */}
                                    <div>

                                        <h3 className="font-semibold text-slate-800 dark:text-white">
                                            Original Text
                                        </h3>

                                        <div
                                            className="
                                                mt-3
                                                rounded-2xl
                                                bg-slate-50
                                                p-5
                                                text-sm
                                                leading-relaxed
                                                text-slate-700
                                                dark:bg-slate-800
                                                dark:text-slate-300
                                            "
                                        >
                                            {
                                                detail.original_text
                                            }
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
                                                bg-slate-50
                                                p-5
                                                text-sm
                                                leading-relaxed
                                                text-slate-700
                                                dark:bg-slate-800
                                                dark:text-slate-300
                                            "
                                        >
                                            {
                                                detail.corrected_text
                                            }
                                        </div>

                                    </div>

                                </div>

                            ) : (

                                <div className="py-20 text-center text-slate-500">
                                    Failed load detail
                                </div>

                            )}

                        </div>

                    </div>

                )}

            </PageTransition>

        </DashboardLayout>

    )
}

export default TeacherReports