import type { ReactNode } from "react"

interface Props {
    title: string
    value: string | number
    icon: ReactNode
    color?: string
}

export default function AdminStatCard({
    title,
    value,
    icon
}: Props) {

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                        {value}
                    </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                    {icon}
                </div>

            </div>

        </div>
    )
}