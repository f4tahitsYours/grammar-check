import { useEffect, useState } from 'react'

import {
    useParams
} from 'react-router-dom'

import {
    EyeOff,
    Clock
} from 'lucide-react'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import {
    getSubmissionDetail
} from '../../../../api/studentApi'

import type {
    SubmissionDetailResponse
} from '../../../../types/teacher'

function SubmissionDetail() {

    const { id } = useParams()

    const [loading, setLoading] =
        useState(true)

    const [data, setData] =
        useState<SubmissionDetailResponse | null>(null)
        
    const showScoreSection =
    data?.score !== undefined &&
    data?.score !== null

    useEffect(() => {

        const fetchDetail = async () => {

            try {

                setLoading(true)

                const response =
                    await getSubmissionDetail(id!)

                setData(response)

            } catch (error) {

                console.log(error)

            } finally {

                setLoading(false)
            }
        }

        fetchDetail()

    }, [id])

    return (
        <DashboardLayout>

            <div className="space-y-6">

                {/* HEADER */}
                <div>

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Submission Detail
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Full grammar correction result
                    </p>

                </div>

                {loading && (
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading detail...
                        </p>

                    </div>
                )}

                {!loading && data && (

                    <div className="space-y-6">

                        {/* SCORE HIDDEN BANNER */}
                        {data.score_hidden === true &&  (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    p-5
                                    dark:border-amber-900/40
                                    dark:bg-amber-950/20
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
                                            rounded-full
                                            bg-amber-100
                                            text-amber-600
                                            dark:bg-amber-900/40
                                            dark:text-amber-400
                                        "
                                    >
                                        <EyeOff size={20} />
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                                            Nilai Belum Ditampilkan
                                        </h3>

                                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                            Guru belum mengaktifkan tampilan nilai untuk tugas ini.
                                            Anda masih dapat melihat koreksi grammar dan feedback.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* AWAITING REVIEW BANNER */}
                        {!showScoreSection && data.rubric_status === 'awaiting_review' && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    p-5
                                    dark:border-blue-900/40
                                    dark:bg-blue-950/20
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
                                            rounded-full
                                            bg-blue-100
                                            text-blue-600
                                            dark:bg-blue-900/40
                                            dark:text-blue-400
                                        "
                                    >
                                        <Clock size={20} />
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                                            Menunggu Penilaian Guru
                                        </h3>

                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                            Submission Anda sedang menunggu penilaian dari guru.
                                            Nilai final akan muncul setelah guru menyelesaikan review.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* SCORE */}
                        {showScoreSection && (

                            <div className="grid gap-4 md:grid-cols-3">

                                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                                    <p className="text-sm text-slate-500">
                                        Score
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {data.score}
                                    </h3>
                                </div>

                                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                                    <p className="text-sm text-slate-500">
                                        Grade
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {data.grade}
                                    </h3>
                                </div>

                                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                                    <p className="text-sm text-slate-500">
                                        Errors
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {data.error_count}
                                    </h3>
                                </div>

                            </div>

                        )}

                        {/* RUBRIC SCORES (if complete and not hidden) */}
                        {! showScoreSection && data.rubric_status === 'complete' && data.score_total !== undefined && data.score_total !== null &&  (

                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Rubric Scores
                                </h3>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Grammar
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_grammar ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Mechanics
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_mechanics ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Content
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_content ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Unity
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_unity ?? '-'}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-4 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/20">
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                        Total Score
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                        {data.score_total} / 20
                                    </p>
                                </div>

                            </div>

                        )}

                        {/* ORIGINAL */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Original Text
                            </h3>

                            <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">

                                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                                    {data.original_text}
                                </p>

                            </div>

                        </div>

                        {/* CORRECTED */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Corrected Text
                            </h3>

                            <div className="mt-4 rounded-2xl bg-green-50 p-5 dark:bg-green-950/20">

                                <p className="leading-relaxed text-green-700 dark:text-green-200">
                                    {data.corrected_text}
                                </p>

                            </div>

                        </div>

                        {/* DIFF */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Grammar Changes
                            </h3>

                            <div
                                className="
                                    mt-4
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-slate-300
                                    bg-slate-50
                                    p-5
                                    leading-8
                                    dark:border-slate-700
                                    dark:bg-slate-950
                                "
                                dangerouslySetInnerHTML={{
                                    __html: data.diff_html
                                }}
                            />

                        </div>

                        {/* FEEDBACK */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                AI Feedback
                            </h3>

                            <div className="mt-4 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/20">

                                <p className="leading-relaxed text-indigo-700 dark:text-indigo-200">
                                    {data.feedback}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

            </div>

        </DashboardLayout>
    )
}

export default SubmissionDetail