import {
    ArrowRight
} from 'lucide-react'

interface Props {

    loading: boolean

    items: any[]

    onOpen: (
        submissionId: string
    ) => void
}

function SubmissionList({
    loading,
    items,
    onOpen
}: Props) {

    if (loading) {

        return (

            <div
                className="
                    rounded-2xl
                    bg-white
                    p-6
                    shadow-sm
                    dark:bg-slate-900
                "
            >

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

            </div>
        )
    }

    if (!items.length) {

        return (

            <div
                className="
                    rounded-2xl
                    bg-white
                    p-6
                    shadow-sm
                    dark:bg-slate-900
                "
            >

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

                    <h3
                        className="
                            text-lg
                            font-semibold
                            text-slate-700
                            dark:text-white
                        "
                    >
                        No Pending Reviews
                    </h3>

                    <p
                        className="
                            mt-2
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        All student submissions have been reviewed.
                    </p>

                </div>

            </div>
        )
    }

    return (

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

                {items.map((item) => (

                    <div
                        key={item.submission_id}
                        onClick={() =>
                            onOpen(item.submission_id)
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
                        <div
                            className="
                                flex
                                min-w-0
                                items-center
                                gap-4
                            "
                        >

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

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                    "
                                >

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

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-slate-500
                                        dark:text-slate-400
                                    "
                                >
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
    )
}

export default SubmissionList