import {
    Users,
    ClipboardList,
    FileText,
    Sparkles
} from 'lucide-react'

interface Props {
    totalStudents: number
    activeAssignments: number
    totalSubmissions: number
    averageScore: number
}

function TeacherStats({
    totalStudents,
    activeAssignments,
    totalSubmissions,
    averageScore
}: Props) {

    const stats = [
        {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            bg: 'bg-indigo-100',
            text: 'text-indigo-600'
        },
        {
            title: 'Active Assignments',
            value: activeAssignments,
            icon: ClipboardList,
            bg: 'bg-amber-100',
            text: 'text-amber-600'
        },
        {
            title: 'New Submissions',
            value: totalSubmissions,
            icon: FileText,
            bg: 'bg-emerald-100',
            text: 'text-emerald-600'
        },
        {
            title: 'Average Score',
            value: `${averageScore}%`,
            icon: Sparkles,
            bg: 'bg-pink-100',
            text: 'text-pink-600'
        }
    ]

    return (
        <div
            className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
            "
        >

            {stats.map((item, index) => {

                const Icon = item.icon

                return (
                    <div
                        key={index}
                        className="
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-sm
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-md
                            dark:bg-slate-900
                        "
                    >

                        <div className="flex items-center justify-between gap-4">

                            <div className="min-w-0">

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {item.title}
                                </p>

                                <h3
                                    className="
                                        mt-2
                                        truncate
                                        text-2xl
                                        font-bold
                                        text-slate-800
                                        dark:text-white
                                        sm:text-3xl
                                    "
                                >
                                    {item.value}
                                </h3>

                            </div>

                            <div
                                className={`
                                    flex
                                    h-12
                                    w-12
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    ${item.bg}
                                    ${item.text}
                                `}
                            >
                                <Icon size={22} />
                            </div>

                        </div>

                    </div>
                )
            })}

        </div>
    )
}

export default TeacherStats