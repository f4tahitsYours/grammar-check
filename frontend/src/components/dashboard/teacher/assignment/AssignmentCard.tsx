import {
    CalendarDays,
    Pencil,
    Eye,
    EyeOff
} from 'lucide-react'

type Props = {
    assignment: any
    onEdit: (assignment: any) => void
}

function AssignmentCard({
    assignment,
    onEdit
}: Props) {

    return (

        <div
            className="
                w-full
                rounded-3xl
                border
                border-indigo-100
                bg-gradient-to-br
                from-indigo-50
                via-blue-50
                to-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-indigo-200
                hover:shadow-xl

                dark:border-slate-700
                dark:from-slate-800
                dark:via-slate-800
                dark:to-slate-900
            "
        >

            {/* TOP */}
            <div
                className="
                    flex
                    flex-col
                    gap-4

                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                "
            >

                {/* LEFT */}
                <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                        <h3
                            className="
                                text-xl
                                font-bold
                                text-slate-800
                                dark:text-white
                            "
                        >
                            {assignment.title}
                        </h3>

                        {/* SCORE VISIBILITY */}
                        <div
                            className={`
                                flex
                                items-center
                                gap-1
                                rounded-full
                                px-3
                                py-1
                                text-[11px]
                                font-semibold

                                ${assignment.show_score
                                    ? `
                                        bg-emerald-100
                                        text-emerald-700

                                        dark:bg-emerald-500/20
                                        dark:text-emerald-300
                                    `
                                    : `
                                        bg-rose-100
                                        text-rose-700

                                        dark:bg-rose-500/20
                                        dark:text-rose-300
                                    `
                                }
                            `}
                        >

                            {assignment.show_score
                                ? <Eye size={13} />
                                : <EyeOff size={13} />
                            }

                            {assignment.show_score
                                ? 'Score Visible'
                                : 'Hidden Score'
                            }

                        </div>

                    </div>

                    <p
                        className="
                            mt-3
                            text-sm
                            leading-relaxed
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        {assignment.description}
                    </p>

                </div>

                {/* RIGHT */}
                <div className="flex shrink-0 items-center gap-2">

                    {/* CLASS */}
                    <span
                        className="
                            inline-flex
                            items-center
                            rounded-2xl
                            bg-indigo-100
                            px-4
                            py-2
                            text-xs
                            font-semibold
                            text-indigo-700

                            dark:bg-indigo-500/20
                            dark:text-indigo-300
                        "
                    >
                        {assignment.class_target}
                    </span>

                    {/* EDIT */}
                    <button
                        onClick={() =>
                            onEdit(assignment)
                        }
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-2xl
                            bg-white/80
                            text-indigo-600
                            transition-all
                            duration-200
                            hover:scale-105
                            hover:bg-indigo-100

                            dark:bg-slate-800
                            dark:text-indigo-300
                            dark:hover:bg-slate-700
                        "
                    >

                        <Pencil size={16} />

                    </button>

                </div>

            </div>

            {/* FOOTER */}
            <div
                className="
                    mt-6
                    grid
                    gap-4
                    border-t-2
                    border-slate-200
                    pt-4
                    text-xs

                    dark:border-slate-700

                    lg:grid-cols-[auto_1fr_auto]
                    lg:items-center
                "
            >

                {/* DATE */}
                <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-slate-400
                    "
                >

                    <CalendarDays size={14} />

                    {assignment.created_at
                        ? new Date(
                            assignment.created_at
                        ).toLocaleDateString()
                        : '-'
                    }

                </div>

                {/* RUBRIC */}
                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-center
                        gap-3
                    "
                >

                    {/* Grammar */}
                    <div
                        className="
                            rounded-2xl
                            bg-slate-100
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-slate-700

                            dark:bg-slate-800
                            dark:text-slate-300
                        "
                    >
                        Grammar:
                        {' '}
                        {assignment.rubric?.grammar_weight || 0}
                    </div>

                    {/* Mechanics */}
                    <div
                        className="
                            rounded-2xl
                            bg-slate-100
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-slate-700

                            dark:bg-slate-800
                            dark:text-slate-300
                        "
                    >
                        Mechanics:
                        {' '}
                        {assignment.rubric?.mechanics_weight || 0}
                    </div>

                    {/* Content */}
                    <div
                        className="
                            rounded-2xl
                            bg-slate-100
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-slate-700

                            dark:bg-slate-800
                            dark:text-slate-300
                        "
                    >
                        Content:
                        {' '}
                        {assignment.rubric?.content_weight || 0}
                    </div>

                    {/* Unity */}
                    <div
                        className="
                            rounded-2xl
                            bg-slate-100
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-slate-700

                            dark:bg-slate-800
                            dark:text-slate-300
                        "
                    >
                        Unity:
                        {' '}
                        {assignment.rubric?.unity_weight || 0}
                    </div>

                </div>

                {/* STATUS */}
                <div className="flex justify-start lg:justify-end">

                    <span
                        className="
                            w-fit
                            rounded-full
                            bg-emerald-100
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-emerald-600

                            dark:bg-emerald-500/20
                            dark:text-emerald-300
                        "
                    >
                        Published
                    </span>

                </div>

            </div>

        </div>
    )
}

export default AssignmentCard