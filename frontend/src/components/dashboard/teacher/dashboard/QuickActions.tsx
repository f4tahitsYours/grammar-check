import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function QuickActions() {

    const navigate = useNavigate()

    return (

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

                {/* CREATE ASSIGNMENT */}
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

                {/* REVIEW SUBMISSION */}
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

    )
}

export default QuickActions