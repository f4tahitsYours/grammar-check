import { useEffect, useState } from 'react'

import {
    useParams
} from 'react-router-dom'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import {
    getSubmissionDetail
} from '../../../../api/studentApi'

function SubmissionDetail() {

    const { id } = useParams()

    const [loading, setLoading] =
        useState(true)

    const [data, setData] =
        useState<any>(null)

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

                        {/* SCORE */}
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