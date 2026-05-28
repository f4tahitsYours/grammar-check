import { useEffect, useState } from "react"

import {
    Search,
    ChevronDown,
    X
} from "lucide-react"

type School = {
    id: string
    name: string
}

type User = {
    id: string
    name: string
    email: string
    role: string
    is_active?: boolean
    school_name?: string | null
    school_id?: string | null
}

type Props = {

    users: User[]
    schools: School[]

    loading: boolean

    search: string
    setSearch: (value: string) => void

    role: string
    setRole: (value: string) => void

    onAssignSchool: (
        userId: string,
        schoolId: string
    ) => Promise<void>

    onChangeRole: (
        userId: string,
        role: string
    ) => Promise<void>

    onDelete: (
        userId: string
    ) => Promise<void>

    refreshUsers: () => Promise<void>
}

export default function UsersTableSchool({

    users,
    schools,

    loading,

    search,
    setSearch,

    role,
    setRole,

    onAssignSchool,
    onChangeRole,
    onDelete,

    refreshUsers

}: Props) {

    const [openModal, setOpenModal] = useState(false)

    const [selectedUser, setSelectedUser] =
        useState<User | null>(null)

    const [selectedRole, setSelectedRole] =
        useState('')

    const [selectedSchool, setSelectedSchool] =
        useState('')

    const [saving, setSaving] =
        useState(false)

    const [successPopup, setSuccessPopup] =
        useState(false)

    const [errorPopup, setErrorPopup] =
        useState(false)

    // AUTO CLOSE POPUP
    useEffect(() => {

        if (successPopup) {

            const timer = setTimeout(() => {
                setSuccessPopup(false)
            }, 2500)

            return () => clearTimeout(timer)
        }

    }, [successPopup])

    useEffect(() => {

        if (errorPopup) {

            const timer = setTimeout(() => {
                setErrorPopup(false)
            }, 2500)

            return () => clearTimeout(timer)
        }

    }, [errorPopup])

    // OPEN MODAL
    const openEditModal = (user: User) => {

        setSelectedUser(user)

        setSelectedRole(user.role)

        setSelectedSchool(user.school_id || '')

        setOpenModal(true)
    }

    // SAVE EDIT
    const handleSaveEdit = async () => {

        if (!selectedUser) return

        try {

            setSaving(true)

            // UPDATE ROLE
            if (selectedRole !== selectedUser.role) {

                await onChangeRole(
                    selectedUser.id,
                    selectedRole
                )
            }

            // UPDATE SCHOOL
            if (
                selectedSchool &&
                selectedSchool !== selectedUser.school_id
            ) {

                await onAssignSchool(
                    selectedUser.id,
                    selectedSchool
                )
            }

            await refreshUsers()

            setOpenModal(false)

            setSuccessPopup(true)

        } catch (err) {

            console.error(err)

            setErrorPopup(true)

        } finally {

            setSaving(false)
        }
    }

    return (

        <>
            <div
                className="
                    rounded-2xl
                    bg-white
                    dark:bg-slate-900
                    border
                    border-slate-200
                    dark:border-slate-800
                    shadow-sm
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
                            Users School Management
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                                dark:text-slate-400
                            "
                        >
                            Manage school users data
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
                        overscroll-x-contain
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
                                    Status
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
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan={6}
                                        className="
                                            py-10
                                            text-center
                                            text-slate-400
                                        "
                                    >
                                        Loading...
                                    </td>

                                </tr>

                            ) : users.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={6}
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

                                            <div className="flex gap-2">

                                                <button
                                                    onClick={() =>
                                                        openEditModal(u)
                                                    }
                                                    className="
                                                        px-3
                                                        py-1.5
                                                        rounded-lg
                                                        bg-indigo-600
                                                        hover:bg-indigo-700
                                                        text-white
                                                        text-xs
                                                        transition
                                                    "
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        onDelete(u.id)
                                                    }
                                                    className="
                                                        px-3
                                                        py-1.5
                                                        rounded-lg
                                                        bg-red-500
                                                        hover:bg-red-600
                                                        dark:hover:bg-red-700
                                                        text-white
                                                        text-xs
                                                        transition
                                                    "
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* MODAL */}
            {openModal && selectedUser && (

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setOpenModal(false)}
                    />

                    <div
                        className="
                            relative
                            w-full
                            max-w-md
                            rounded-2xl
                            bg-white
                            dark:bg-slate-900
                            border
                            border-slate-200
                            dark:border-slate-700
                            p-6
                            shadow-xl
                        "
                    >

                        {/* HEADER */}
                        <div className="flex items-center justify-between">

                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Edit User
                            </h2>

                            <button
                                onClick={() => setOpenModal(false)}
                                className="
                                    h-9
                                    w-9
                                    rounded-full
                                    bg-slate-100
                                    dark:bg-slate-800
                                    hover:bg-slate-200
                                    dark:hover:bg-slate-700
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                "
                            >
                                <X size={18} />
                            </button>

                        </div>

                        {/* ROLE */}
                        <div className="mt-5">

                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                Role
                            </label>

                            <div className="relative mt-2">

                                <select
                                    value={selectedRole}
                                    onChange={(e) =>
                                        setSelectedRole(e.target.value)
                                    }
                                    className="
                                        appearance-none
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        dark:border-slate-700
                                        px-4
                                        pr-12
                                        py-2.5
                                        bg-white
                                        dark:bg-slate-800
                                        text-slate-700
                                        dark:text-slate-200
                                    "
                                >

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
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        h-4
                                        w-4
                                        text-slate-400
                                    "
                                />

                            </div>

                        </div>

                        {/* SCHOOL */}
                        <div className="mt-5">

                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                School
                            </label>

                            <div className="relative mt-2">

                                <select
                                    value={selectedSchool}
                                    onChange={(e) =>
                                        setSelectedSchool(e.target.value)
                                    }
                                    className="
                                        appearance-none
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        dark:border-slate-700
                                        px-4
                                        pr-12
                                        py-2.5
                                        bg-white
                                        dark:bg-slate-800
                                        text-slate-700
                                        dark:text-slate-200
                                    "
                                >

                                    <option value="">
                                        Select School
                                    </option>

                                    {schools.map((s) => (

                                        <option
                                            key={s.id}
                                            value={s.id}
                                        >
                                            {s.name}
                                        </option>

                                    ))}

                                </select>

                                <ChevronDown
                                    className="
                                        pointer-events-none
                                        absolute
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        h-4
                                        w-4
                                        text-slate-400
                                    "
                                />

                            </div>

                        </div>

                        {/* ACTION */}
                        <div className="mt-6 flex justify-end">

                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="
                                    px-5
                                    py-2
                                    rounded-xl
                                    bg-indigo-600
                                    hover:bg-indigo-700
                                    disabled:opacity-50
                                    text-white
                                    transition
                                "
                            >

                                {saving
                                    ? 'Saving...'
                                    : 'Save Edit'}

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* SUCCESS */}
            {successPopup && (

                <div className="fixed top-5 right-5 z-[60]">

                    <div
                        className="
                            rounded-xl
                            bg-green-500
                            px-5
                            py-3
                            text-white
                            shadow-lg
                        "
                    >
                        User updated successfully
                    </div>

                </div>

            )}

            {/* ERROR */}
            {errorPopup && (

                <div className="fixed top-5 right-5 z-[60]">

                    <div
                        className="
                            rounded-xl
                            bg-red-500
                            px-5
                            py-3
                            text-white
                            shadow-lg
                        "
                    >
                        Failed update user
                    </div>

                </div>

            )}

        </>
    )
}