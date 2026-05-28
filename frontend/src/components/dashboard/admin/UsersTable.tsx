import {
    Search,
    ChevronDown
} from "lucide-react"

import type { Props } from "../../../api/interface/Props"

export default function UsersTable({
    users,
    loading,

    search,
    setSearch,

    role,
    setRole

}: Props) {

    return (

        <div
            className="
                rounded-2xl
                bg-white
                dark:bg-slate-900
                shadow-sm
                border
                border-slate-200
                dark:border-slate-800
                p-4
                md:p-6
            "
        >

            {/* HEADER */}
            <div
                className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-4
                    mb-5
                "
            >

                <div>

                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-slate-800
                            dark:text-white
                        "
                    >
                        Users Monitoring
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        Monitor all registered users
                    </p>

                </div>

                {/* SEARCH + FILTER */}
                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-3
                        w-full
                        lg:w-auto
                    "
                >

                    {/* SEARCH */}
                    <div className="relative w-full sm:w-72">

                        <Search
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                h-4
                                w-4
                                text-slate-400
                            "
                        />

                        <input
                            type="text"
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="
                                w-full
                                pl-10
                                pr-4
                                py-2.5
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-800
                                text-slate-700
                                dark:text-slate-200
                                placeholder:text-slate-400
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                                transition
                            "
                        />

                    </div>

                    {/* FILTER */}
                    <div className="relative min-w-[170px]">

                        <select
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                            className="
                                appearance-none
                                w-full
                                px-4
                                pr-14
                                py-2.5
                                rounded-xl
                                border
                                border-slate-200
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-800
                                text-slate-700
                                dark:text-slate-200
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                                transition
                            "
                        >

                            <option value="">
                                All Role
                            </option>

                            <option value="student">
                                Student
                            </option>

                            <option value="teacher">
                                Teacher
                            </option>

                            <option value="admin">
                                Admin
                            </option>

                        </select>

                        <ChevronDown
                            className="
                                pointer-events-none
                                absolute
                                right-5
                                top-1/2
                                -translate-y-1/2
                                h-4
                                w-4
                                text-slate-400
                            "
                        />

                    </div>

                </div>

            </div>

            {/* TABLE */}
            <div
                className="
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-800
                    bg-white
                    dark:bg-slate-900

                    scrollbar-thin
                    scrollbar-thumb-slate-300
                    dark:scrollbar-thumb-slate-700
                    scrollbar-track-transparent

                    touch-pan-x
                    scroll-smooth
                    [-webkit-overflow-scrolling:touch]
                "
            >

                <table
                    className="
                        min-w-[1100px]
                        w-full
                        text-sm
                        text-slate-700
                        dark:text-slate-200
                    "
                >

                    <thead
                        className="
                            bg-slate-50
                            dark:bg-slate-800/60
                        "
                    >

                        <tr>

                            <th
                                className="
                                    px-4
                                    py-3
                                    text-left
                                    font-semibold
                                    text-slate-600
                                    dark:text-slate-300
                                "
                            >
                                Name
                            </th>

                            <th
                                className="
                                    px-4
                                    py-3
                                    text-left
                                    font-semibold
                                    text-slate-600
                                    dark:text-slate-300
                                "
                            >
                                Email
                            </th>

                            <th
                                className="
                                    px-4
                                    py-3
                                    text-left
                                    font-semibold
                                    text-slate-600
                                    dark:text-slate-300
                                "
                            >
                                Role
                            </th>

                            <th
                                className="
                                    px-4
                                    py-3
                                    text-left
                                    font-semibold
                                    text-slate-600
                                    dark:text-slate-300
                                "
                            >
                                School
                            </th>

                            <th
                                className="
                                    px-4
                                    py-3
                                    text-left
                                    font-semibold
                                    text-slate-600
                                    dark:text-slate-300
                                "
                            >
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="
                                        py-10
                                        text-center
                                        text-slate-400
                                    "
                                >
                                    Loading users...
                                </td>

                            </tr>

                        ) : users.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={5}
                                    className="
                                        py-10
                                        text-center
                                        text-slate-400
                                    "
                                >
                                    No users found
                                </td>

                            </tr>

                        ) : (

                            users.map((u) => (

                                <tr
                                    key={u.id}
                                    className="
                                        border-b
                                        border-slate-100
                                        dark:border-slate-800
                                        hover:bg-slate-50
                                        dark:hover:bg-slate-800/40
                                        transition-colors
                                    "
                                >

                                    <td
                                        className="
                                            px-4
                                            py-4
                                            font-medium
                                            text-slate-800
                                            dark:text-white
                                        "
                                    >
                                        {u.name}
                                    </td>

                                    <td
                                        className="
                                            px-4
                                            py-4
                                            text-slate-600
                                            dark:text-slate-300
                                        "
                                    >
                                        {u.email}
                                    </td>

                                    <td
                                        className="
                                            px-4
                                            py-4
                                            capitalize
                                        "
                                    >

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                rounded-full
                                                px-3
                                                py-1
                                                text-xs
                                                font-semibold

                                                ${u.role === 'admin'
                                                    ? `
                                                        bg-amber-100
                                                        text-amber-700
                                                        dark:bg-amber-500/15
                                                        dark:text-amber-300
                                                    `
                                                    : u.role === 'student'
                                                        ? `
                                                            bg-sky-100
                                                            text-sky-700
                                                            dark:bg-sky-500/15
                                                            dark:text-sky-300
                                                        `
                                                        : `
                                                            bg-slate-200
                                                            text-slate-700
                                                            dark:bg-slate-500/15
                                                            dark:text-slate-300
                                                        `
                                                }
                                            `}
                                        >
                                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                        </span>

                                    </td>

                                    <td
                                        className="
                                            px-4
                                            py-4
                                            text-slate-600
                                            dark:text-slate-300
                                        "
                                    >
                                        {u.school_name || '-'}
                                    </td>

                                    <td className="px-4 py-4">

                                        {u.is_active ? (

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-green-100
                                                    dark:bg-green-500/10
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    text-green-600
                                                    dark:text-green-400
                                                "
                                            >
                                                Active
                                            </span>

                                        ) : (

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-red-100
                                                    dark:bg-red-500/10
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    text-red-600
                                                    dark:text-red-400
                                                "
                                            >
                                                Inactive
                                            </span>

                                        )}

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    )
}