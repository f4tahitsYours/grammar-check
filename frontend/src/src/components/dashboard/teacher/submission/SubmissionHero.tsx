import {
    Clock3
} from 'lucide-react'

interface Props {
    total: number
}

function SubmissionHero({
    total
}: Props) {

    return (

        <div
            className="
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-amber-500
                to-orange-500
                p-5
                text-white
                shadow-lg
                sm:p-6
            "
        >

            <div
                className="
                    flex
                    flex-col
                    gap-5
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >

                <div className="max-w-2xl">

                    <p className="text-sm font-medium text-orange-100">
                        Teacher Submission
                    </p>

                    <h1
                        className="
                            mt-2
                            text-2xl
                            font-bold
                            leading-tight
                            sm:text-3xl
                        "
                    >
                        Pending Student Reviews
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-orange-100 sm:text-base">
                        Review student writing submissions awaiting
                        teacher assessment.
                    </p>

                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        bg-white/10
                        px-4
                        py-3
                        backdrop-blur-sm
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-2xl
                            bg-white/20
                        "
                    >
                        <Clock3 size={22} />
                    </div>

                    <div>

                        <p className="text-xs text-orange-100">
                            Pending Reviews
                        </p>

                        <h3 className="text-xl font-bold">
                            {total}
                        </h3>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default SubmissionHero