import { useEffect, useState } from 'react'

import PageTransition from '../../../../components/common/PageTransition'

import {
    BookOpen,
    CalendarDays
} from 'lucide-react'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import api from '../../../../api/axios'

type Assignment = {
    assignment_id?: string
    id?: string
    title: string
    description: string
    class_target?: string
    created_at?: string
    updated_at?: string
}

function AssignmentsStudent() {

    const [loading, setLoading] =
        useState(true)

    const [assignments, setAssignments] =
        useState<Assignment[]>([])

    useEffect(() => {

        fetchAssignments()

    }, [])

    const fetchAssignments = async () => {
        try {

            setLoading(true)

            const response =
                await api.get('/student/assignments')

            setAssignments(
                Array.isArray(response.data.data)
                    ? response.data.data
                    : []
            )

        } catch (error) {

            console.log(error)

            setAssignments([])

        } finally {

            setLoading(false)
        }
    }
    
    // FORMAT DATE
    const formatDate = (date?: string) => {

        if (!date) return '-'

        return new Date(date).toLocaleDateString(
            'en-US',
            {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }
        )
    }

    return (

        <DashboardLayout>

            <PageTransition>

                {/* PAGE HEADER */}
                <div className="mb-6">

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Assignments
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        View assignments and writing tasks from your teacher
                    </p>

                </div>

                {/* LOADING */}
                {loading && (

                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading assignments...
                        </p>

                    </div>
                )}

                {/* EMPTY */}
                {!loading && assignments.length === 0 && (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-dashed
                            border-slate-300
                            bg-white
                            p-10
                            text-center
                            shadow-sm
                            dark:border-slate-700
                            dark:bg-slate-900
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-indigo-100
                                text-indigo-600
                                dark:bg-indigo-950/40
                            "
                        >
                            <BookOpen size={28} />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
                            No Assignment Yet
                        </h3>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Your teacher has not created any assignment.
                        </p>

                    </div>
                )}

                {/* ASSIGNMENT LIST */}
                <div className="space-y-5">

                    {!loading && assignments.map((item, index) => (

                        <div
                            key={
                                item.assignment_id ||
                                item.id ||
                                index
                            }
                            className="
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-indigo-200
                                bg-indigo-50
                                p-6
                                shadow-sm
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-md
                                dark:border-indigo-900/40
                                dark:bg-indigo-950/20
                            "
                        >

                            {/* DECORATION */}
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    h-28
                                    w-28
                                    rounded-full
                                    bg-indigo-200/40
                                    blur-3xl
                                    dark:bg-indigo-700/10
                                "
                            />

                            <div className="relative z-10">

                                {/* TOP */}
                                <div className="flex items-start gap-4">

                                    {/* ICON */}
                                    <div
                                        className="
                                            flex
                                            h-14
                                            w-14
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-indigo-600
                                            text-white
                                            shadow-md
                                        "
                                    >
                                        <BookOpen size={24} />
                                    </div>

                                    {/* CONTENT */}
                                    <div className="min-w-0 flex-1">

                                        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                                            {item.title}
                                        </h2>

                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                leading-7
                                                text-indigo-700
                                                dark:text-indigo-300
                                            "
                                        >
                                            {item.description}
                                        </p>

                                    </div>

                                </div>

                                {/* META */}
                                <div className="mt-5 flex flex-wrap items-center gap-3">

                                    {/* CLASS */}
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            bg-white/80
                                            px-3
                                            py-2
                                            text-sm
                                            text-indigo-800
                                            shadow-sm
                                            dark:bg-slate-900
                                            dark:text-indigo-200
                                        "
                                    >
                                        <BookOpen size={16} />

                                        {item.class_target || 'All Class'}
                                    </div>

                                    {/* CREATED */}
                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            bg-white/80
                                            px-3
                                            py-2
                                            text-sm
                                            text-indigo-800
                                            shadow-sm
                                            dark:bg-slate-900
                                            dark:text-indigo-200
                                        "
                                    >
                                        <CalendarDays size={16} />

                                        {formatDate(item.created_at)}
                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default AssignmentsStudent