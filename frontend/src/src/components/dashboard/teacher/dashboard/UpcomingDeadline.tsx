import { Clock3 } from 'lucide-react'

function UpcomingDeadline() {

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

            <div className="flex items-start gap-3">

                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-100
                        text-red-500
                    "
                >
                    <Clock3 size={18} />
                </div>

                <div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upcoming Deadline
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                        Essay Assignment
                    </h3>

                </div>

            </div>

        </div>
    )
}

export default UpcomingDeadline