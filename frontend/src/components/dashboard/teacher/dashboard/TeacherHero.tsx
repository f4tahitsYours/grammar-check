import { useNavigate } from 'react-router-dom'

interface Props {
    teacherName: string
}

function TeacherHero({
    teacherName
}: Props) {

    const navigate = useNavigate()

    return (

        <div
            className="
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-indigo-500
                p-4
                text-white
                shadow-lg
                sm:rounded-3xl
                sm:p-6
                lg:p-8
            "
        >

            <div
                className="
                    flex
                    flex-col
                    gap-6
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >

                <div className="max-w-3xl">

                    <p className="text-sm font-medium text-indigo-100">
                        Teacher Dashboard
                    </p>

                    <h1
                        className="
                            mt-2
                            text-2xl
                            font-bold
                            leading-tight
                            sm:text-3xl
                            lg:text-4xl
                        "
                    >
                        Welcome Back, {teacherName} 👋
                    </h1>

                    <p
                        className="
                            mt-3
                            text-sm
                            leading-relaxed
                            text-indigo-100
                            sm:text-base
                        "
                    >
                        Manage assignments, review student submissions,
                        and monitor grammar performance from one dashboard.
                    </p>

                </div>

                <div
                    className="
                        flex
                        w-full
                        flex-col
                        gap-3
                        sm:w-auto
                        sm:flex-row
                        sm:flex-wrap
                        lg:justify-end
                    "
                >

                    <button
                        onClick={() =>
                            navigate('/dashboard/teacher/assignment/')
                        }
                        className="
                            w-full
                            rounded-2xl
                            bg-white
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-indigo-600
                            transition-all
                            duration-300
                            hover:scale-[1.02]
                            hover:bg-indigo-50
                            active:scale-95
                            sm:w-auto
                        "
                    >
                        View Assignment
                    </button>

                    <button
                        onClick={() =>
                            navigate('/dashboard/teacher/reports')
                        }
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-white/30
                            bg-white/10
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            backdrop-blur-sm
                            transition
                            hover:bg-white/20
                            sm:w-auto
                        "
                    >
                        View Reports
                    </button>

                </div>

            </div>

        </div>
    )
}

export default TeacherHero