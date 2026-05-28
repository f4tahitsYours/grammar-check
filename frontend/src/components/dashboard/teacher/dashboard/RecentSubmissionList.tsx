import { ArrowRight } from 'lucide-react'

interface Item {
    submission_id: string
    student_name: string
    created_at: string
    score: number
}

interface Props {
    loading: boolean
    items: Item[]
    onReview: (id: string) => void
    onViewAll: () => void
}

function RecentSubmissionList({
    loading,
    items,
    onReview,
    onViewAll
}: Props) {

    return (
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
                    onClick={onViewAll}
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

                {!loading &&
                    items
                        ?.sort(
                            (a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                        )
                        ?.slice(0, 3)
                        .map((item) => (

                            <div
                                key={item.submission_id}
                                onClick={() =>
                                    onReview(item.submission_id)
                                }
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
                                        "
                                    >
                                        Review
                                    </button>

                                </div>

                            </div>
                        )
                    )
                }

            </div>

        </div>
    )
}

export default RecentSubmissionList