import { useEffect, useState } from 'react'
import PageTransition from '../../../../components/common/PageTransition'
import {
    Clock3,
    ChevronRight,
    FileText,
    Sparkles
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import {
    getSubmissionHistory
} from '../../../../api/studentApi'

function History() {

    const navigate = useNavigate()

    const [loading, setLoading] =
        useState(true)

    const [histories, setHistories] =
        useState<any[]>([])

    /* FETCH HISTORY */
    useEffect(() => {

        const fetchHistory = async () => {

            try {

                setLoading(true)

                const data =
                    await getSubmissionHistory()

                setHistories(data.items || [])

            } catch (error) {

                console.log(error)

            } finally {

                setLoading(false)
            }
        }

        fetchHistory()

    }, [])

    /* GRADE COLOR */
    const getGradeStyle = (
        grade: string
    ) => {

        switch (grade) {

            case 'A':
                return `
                    bg-green-100
                    text-green-700
                    dark:bg-green-950/30
                    dark:text-green-300
                `

            case 'B':
                return `
                    bg-blue-100
                    text-blue-700
                    dark:bg-blue-950/30
                    dark:text-blue-300
                `

            case 'C':
                return `
                    bg-yellow-100
                    text-yellow-700
                    dark:bg-yellow-950/30
                    dark:text-yellow-300
                `

            default:
                return `
                    bg-red-100
                    text-red-700
                    dark:bg-red-950/30
                    dark:text-red-300
                `
        }
    }

    /* AVG SCORE */
    const averageScore =
        histories.length > 0
            ? Math.round(
                histories.reduce(
                    (acc, item) =>
                        acc + item.score,
                    0
                ) / histories.length
            )
            : 0

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
                                        {averageScore}
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
                        {!loading && histories.map((item, index) => (

                            <button
                                key={item.id}
                                onClick={() =>
                                    navigate(
                                        `/dashboard/student/submission/${item.id}`
                                    )
                                }
                                className="
                                    group
                                    w-full
                                    rounded-2xl
                                    bg-white
                                    p-5
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
                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-center gap-3">

                                            <div
                                                className="
                                                    flex
                                                    h-11
                                                    w-11
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

                                            <div>

                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    Submission #{index + 1}
                                                </h3>

                                                <div
                                                    className="
                                                        mt-1
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-3
                                                        text-sm
                                                        text-slate-500
                                                        dark:text-slate-400
                                                    "
                                                >

                                                    <span>
                                                        {item.word_count} words
                                                    </span>

                                                    <span>
                                                        {item.error_count} errors
                                                    </span>

                                                    <span className="flex items-center gap-1">
                                                        <Clock3 size={14} />
                                                        {new Date(
                                                            item.created_at
                                                        ).toLocaleDateString()}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex items-center gap-3">

                                        <div className="text-right">

                                            <p className="text-sm text-slate-400">
                                                Score
                                            </p>

                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                                {item.score}
                                            </h3>

                                        </div>

                                        <div
                                            className={`
                                                rounded-xl
                                                px-3
                                                py-2
                                                text-sm
                                                font-bold
                                                ${getGradeStyle(item.grade)}
                                            `}
                                        >
                                            {item.grade}
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

            </PageTransition>

        </DashboardLayout>
    )
}

export default History