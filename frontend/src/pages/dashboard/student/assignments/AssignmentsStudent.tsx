import PageTransition from '../../../../components/common/PageTransition'
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock3
} from 'lucide-react'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

function AssignmentsStudent() {

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

                {/* ASSIGNMENT LIST */}
                <div className="space-y-5">

                    {/* ASSIGNMENT CARD */}
                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-amber-200
                            bg-amber-50
                            p-6
                            shadow-sm
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-md
                            dark:border-amber-900/40
                            dark:bg-amber-950/20
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
                                bg-amber-200/40
                                blur-3xl
                                dark:bg-amber-700/10
                            "
                        />

                        <div className="relative z-10">

                            {/* TOP */}
                            <div className="flex items-start justify-between gap-4">

                                {/* LEFT */}
                                <div className="flex items-start gap-4">

                                    {/* ICON */}
                                    <div
                                        className="
                                            flex
                                            h-14
                                            w-14
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-amber-500
                                            text-white
                                            shadow-md
                                        "
                                    >
                                        <BookOpen size={24} />
                                    </div>

                                    {/* CONTENT */}
                                    <div>

                                        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                                            Argumentative Essay
                                        </h2>

                                        <p className="mt-1 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
                                            Write an argumentative paragraph about
                                            technology in education and explain
                                            whether AI improves student learning.
                                        </p>

                                    </div>

                                </div>

                                {/* STATUS */}
                                <div
                                    className="
                                        rounded-xl
                                        bg-green-100
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        text-green-700
                                        dark:bg-green-900/30
                                        dark:text-green-300
                                    "
                                >
                                    Active
                                </div>

                            </div>

                            {/* META */}
                            <div className="mt-5 flex flex-wrap items-center gap-3">

                                {/* WORD */}
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
                                        text-amber-800
                                        shadow-sm
                                        dark:bg-slate-900
                                        dark:text-amber-200
                                    "
                                >
                                    <CheckCircle2 size={16} />
                                    Minimum 150 words
                                </div>

                                {/* DEADLINE */}
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
                                        text-amber-800
                                        shadow-sm
                                        dark:bg-slate-900
                                        dark:text-amber-200
                                    "
                                >
                                    <CalendarDays size={16} />
                                    Due: May 20, 2026
                                </div>

                                {/* TIME */}
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
                                        text-amber-800
                                        shadow-sm
                                        dark:bg-slate-900
                                        dark:text-amber-200
                                    "
                                >
                                    <Clock3 size={16} />
                                    Posted 2 days ago
                                </div>

                            </div>

                            {/* FOOTER */}
                            <div
                                className="
                                    mt-5
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-amber-300
                                    bg-white/60
                                    p-4
                                    dark:border-amber-800
                                    dark:bg-slate-900/40
                                "
                            >

                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    Please submit your best writing using the
                                    grammar checker on the Dashboard page.
                                    Focus on grammar, mechanics, content,
                                    and sentence unity.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* SECOND CARD */}
                    <div
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
                            <div className="flex items-start justify-between gap-4">

                                <div className="flex items-start gap-4">

                                    {/* ICON */}
                                    <div
                                        className="
                                            flex
                                            h-14
                                            w-14
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
                                    <div>

                                        <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                                            Descriptive Writing
                                        </h2>

                                        <p className="mt-1 text-sm leading-relaxed text-indigo-700 dark:text-indigo-300">
                                            Describe your favorite place in detail
                                            using descriptive adjectives and proper
                                            sentence structure.
                                        </p>

                                    </div>

                                </div>

                                {/* STATUS */}
                                <div
                                    className="
                                        rounded-xl
                                        bg-amber-100
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        text-amber-700
                                        dark:bg-amber-900/30
                                        dark:text-amber-300
                                    "
                                >
                                    Upcoming
                                </div>

                            </div>

                            {/* META */}
                            <div className="mt-5 flex flex-wrap items-center gap-3">

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
                                    <CheckCircle2 size={16} />
                                    Minimum 200 words
                                </div>

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
                                    Due: May 28, 2026
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default AssignmentsStudent