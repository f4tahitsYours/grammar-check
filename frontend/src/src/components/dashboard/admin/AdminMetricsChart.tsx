import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
    Legend
} from "recharts"

import type { DailyMetric } from "../../../api/interface/Metrics"

interface Props {
    data: DailyMetric[]
}

export default function AdminMetricsChart({ data }: Props) {
    return (
        <div className="grid gap-6 xl:grid-cols-2">

            {/* SUBMISSIONS */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-semibold">
                    Submissions Trend
                </h2>

                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="submissions"
                            stroke="#4f46e5"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* CACHE VS LLM */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                <h2 className="mb-4 text-lg font-semibold">
                    Cache vs LLM Calls
                </h2>

                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cache_hits" fill="#22c55e" />
                        <Bar dataKey="llm_calls" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* AVG SCORE */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900 xl:col-span-2">
                <h2 className="mb-4 text-lg font-semibold">
                    Average Score Trend
                </h2>

                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="avg_score"
                            stroke="#f59e0b"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}