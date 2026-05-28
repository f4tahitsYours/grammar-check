import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageTransition from '../../../components/common/PageTransition'
import { useSchools } from '../../../hooks/admin/useSchools'
import { useState } from 'react'
import { Pencil } from 'lucide-react'

export default function SchoolsPage() {

    const {
        schools,
        loading,
        handleCreateSchool,
        handleUpdateSchool
    } = useSchools()

    const [newSchool, setNewSchool] = useState('')

    // MODAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const openModal = (id: string, name: string) => {
        setEditId(id)
        setEditName(name)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        if (!editId) return

        await handleUpdateSchool(editId, editName)

        setIsModalOpen(false)
        setEditId(null)
        setEditName('')
    }

    return (
        <DashboardLayout>
            <PageTransition>

                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Schools Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage all schools in system
                    </p>
                </div>

                {/* CREATE */}
                <div className="flex gap-2 mb-6">
                    <input
                        value={newSchool}
                        onChange={(e) => setNewSchool(e.target.value)}
                        placeholder="Add new school..."
                        className="
                            w-full rounded-xl border px-4 py-2
                            border-slate-300 dark:border-slate-700
                            bg-white dark:bg-slate-900
                            text-slate-900 dark:text-white
                            focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
                        "
                    />

                    <button
                        onClick={() => {
                            handleCreateSchool(newSchool)
                            setNewSchool('')
                        }}
                        className="bg-indigo-600 text-white px-5 rounded-xl hover:bg-indigo-700"
                    >
                        Add
                    </button>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

                    <table className="w-full text-sm">

                        <thead className="bg-slate-50 dark:bg-slate-800 text-left">
                            <tr>
                                <th className="p-4 text-slate-600 dark:text-slate-300">School</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300">Users</th>
                                <th className="p-4 text-slate-600 dark:text-slate-300">Status</th>
                                <th className="p-4 text-right text-slate-600 dark:text-slate-300">Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-500 dark:text-slate-400">
                                        Loading schools...
                                    </td>
                                </tr>
                            ) : schools.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-500 dark:text-slate-400">
                                        No schools found
                                    </td>
                                </tr>
                            ) : (
                                schools.map((school) => (
                                    <tr
                                        key={school.id}
                                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                                    >

                                        <td className="p-4 text-slate-900 dark:text-white font-medium">
                                            {school.name}
                                        </td>

                                        <td className="p-4 text-slate-500 dark:text-slate-400">
                                            {school.total_users}
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-4">
                                            <span className="
                                                px-3 py-1 rounded-full text-xs font-medium
                                                bg-green-100 text-green-700
                                                dark:bg-green-900/30 dark:text-green-300
                                            ">
                                                Updated
                                            </span>
                                        </td>

                                        {/* ACTION */}
                                        <td className="p-4 text-right">

                                            <button
                                                onClick={() => openModal(school.id, school.name)}
                                                className="
                                                    inline-flex items-center gap-2
                                                    text-indigo-600 dark:text-indigo-400
                                                    hover:text-indigo-800 dark:hover:text-indigo-300
                                                    transition
                                                "
                                            >
                                                <Pencil size={16} />
                                                <span className="text-sm font-medium">Edit</span>
                                            </button>

                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                {/* MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">

                        {/* overlay */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setIsModalOpen(false)}
                        />

                        {/* modal */}
                        <div className="
                            relative w-full max-w-md
                            rounded-2xl bg-white dark:bg-slate-900
                            p-6 border border-slate-200 dark:border-slate-700
                        ">

                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Edit School
                            </h2>

                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="
                                    mt-4 w-full px-4 py-2 rounded-xl border
                                    border-slate-300 dark:border-slate-700
                                    bg-white dark:bg-slate-800
                                    text-slate-900 dark:text-white
                                    focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40
                                "
                            />

                            {/* BUTTONS */}
                            <div className="mt-6 flex justify-end gap-4">

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="
                                        px-4 py-2 rounded-xl
                                        text-slate-600 dark:text-slate-400
                                        hover:bg-slate-100 dark:hover:bg-slate-800
                                        transition
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    className="
                                        px-5 py-2 rounded-xl
                                        bg-indigo-600 text-white
                                        hover:bg-indigo-700
                                        transition
                                    "
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </PageTransition>
        </DashboardLayout>
    )
}