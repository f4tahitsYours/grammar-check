import DashboardLayout from '../../../../components/layout/DashboardLayout'
import PageTransition from '../../../../components/common/PageTransition'

import {
    Plus,
    CalendarDays,
    ClipboardList,
    X,
    Pencil
} from 'lucide-react'

import { useEffect, useState } from 'react'

import {
    getTeacherAssignments,
    createTeacherAssignment,
    updateTeacherAssignment
} from '../../../../api/teacherApi'

type Assignment = {
    assignment_id?: string
    id?: string
    title: string
    description: string
    class_target: string

    rubric?: {
        grammar_weight: number
        mechanics_weight: number
        content_weight: number
        unity_weight: number
    }

    created_at?: string
    updated_at?: string
}

function TeacherAssignment() {

    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchAssignments = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await getTeacherAssignments()

            setAssignments(response?.data || [])
        } catch (error) {
            console.log(error)
            setAssignments([])
            setError('Failed to load assignments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [])

    const [openCreate, setOpenCreate] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('')

    const [submitting, setSubmitting] = useState(false)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [classTarget, setClassTarget] = useState('')

    const [grammarWeight, setGrammarWeight] = useState(0)
    const [mechanicsWeight, setMechanicsWeight] = useState(0)
    const [contentWeight, setContentWeight] = useState(0)
    const [unityWeight, setUnityWeight] = useState(0)

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setClassTarget('')

        setGrammarWeight(0)
        setMechanicsWeight(0)
        setContentWeight(0)
        setUnityWeight(0)

        setIsEditMode(false)
        setSelectedAssignmentId('')
    }

    const handleEditAssignment = (assignment: Assignment) => {

        const id =
            assignment.assignment_id ??
            assignment.id ??
            null

        if (!id) {
            console.error('Assignment ID not found in object:', assignment)
            return
        }

        setIsEditMode(true)
        setSelectedAssignmentId(id)

        setTitle(assignment.title)
        setDescription(assignment.description)
        setClassTarget(assignment.class_target)

        setGrammarWeight(assignment.rubric?.grammar_weight ?? 0)
        setMechanicsWeight(assignment.rubric?.mechanics_weight ?? 0)
        setContentWeight(assignment.rubric?.content_weight ?? 0)
        setUnityWeight(assignment.rubric?.unity_weight ?? 0)

        setOpenCreate(true)
    }

    const handleCreateAssignment = async () => {

        // ✅ FIX: wajib ada ID kalau edit mode
        if (isEditMode && !selectedAssignmentId) {
            console.error('BLOCKED: Missing assignment ID for update')
            alert('Assignment ID tidak ditemukan. Tidak bisa update.')
            return
        }

        try {
            setSubmitting(true)

            const payload = {
                title: title.trim(),
                description: description.trim(),
                class_target: classTarget.trim(),
                rubric: {
                    grammar_weight: Number(grammarWeight),
                    mechanics_weight: Number(mechanicsWeight),
                    content_weight: Number(contentWeight),
                    unity_weight: Number(unityWeight),
                    grading_scale: {
                        "0": "D",
                        "9": "C",
                        "13": "B",
                        "17": "A"
                    }
                }
            }

            console.log('PAYLOAD:', payload)

            if (isEditMode) {

                // ✅ FIX UTAMA: PATCH harus pakai ID di URL
                await updateTeacherAssignment(selectedAssignmentId, payload)

            } else {
                await createTeacherAssignment(payload)
            }

            setOpenCreate(false)
            resetForm()
            fetchAssignments()

        } catch (error: any) {
            console.log('ASSIGNMENT ERROR:', error?.response?.data || error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <DashboardLayout>

            <PageTransition>

                <div className="space-y-6">

                    {/* HERO */}
                    <div
                        className="
                            overflow-hidden
                            rounded-3xl
                            bg-gradient-to-r
                            from-indigo-600
                            to-indigo-500
                            p-5
                            text-white
                            shadow-lg
                            sm:p-7
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

                            {/* LEFT */}
                            <div className="max-w-2xl">

                                <p className="text-sm font-medium text-indigo-100">
                                    Teacher Assignment
                                </p>

                                <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                                    Assignment Management
                                </h1>

                                <p className="mt-3 text-sm leading-relaxed text-indigo-100 sm:text-base">
                                    Create writing tasks, manage student assignments,
                                    and organize classroom activities in one clean workspace.
                                </p>

                            </div>

                            {/* RIGHT */}
                            <button
                                onClick={() => {
                                    resetForm()
                                    setOpenCreate(true)
                                }}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
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

                                <Plus size={18} />

                                Create Assignment

                            </button>

                        </div>

                    </div>

                    {/* CONTENT */}
                    <div
                        className="
                            rounded-3xl
                            bg-white
                            p-4
                            shadow-sm
                            dark:bg-slate-900
                            sm:p-6
                        "
                    >

                        {/* HEADER */}
                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                border-b
                                border-slate-200
                                pb-5
                                dark:border-slate-800
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >

                            <div>

                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Assignment List
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    All published classroom assignments
                                </p>

                            </div>

                            <div
                                className="
                                    inline-flex
                                    w-fit
                                    items-center
                                    gap-2
                                    rounded-2xl
                                    bg-slate-100
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-slate-600
                                    dark:bg-slate-800
                                    dark:text-slate-300
                                "
                            >

                                <ClipboardList size={16} />

                                {assignments.length} Assignments

                            </div>

                        </div>

                        {/* LOADING */}
                        {loading && (

                            <div
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    py-20
                                "
                            >

                                <div
                                    className="
                                        h-12
                                        w-12
                                        animate-spin
                                        rounded-full
                                        border-4
                                        border-slate-200
                                        border-t-indigo-600
                                    "
                                />

                                <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
                                    Loading assignments...
                                </p>

                            </div>

                        )}

                        {/* ERROR */}
                        {!loading && error && (

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-10
                                    text-center
                                    dark:border-red-900/40
                                    dark:bg-red-950/20
                                "
                            >

                                <p className="text-sm font-medium text-red-500">
                                    {error}
                                </p>

                            </div>

                        )}

                        {/* EMPTY */}
                        {!loading &&
                            assignments.length === 0 && (

                                <div
                                    className="
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        py-20
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-20
                                            w-20
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-slate-100
                                            dark:bg-slate-800
                                        "
                                    >

                                        <ClipboardList
                                            size={36}
                                            className="text-slate-400"
                                        />

                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold text-slate-700 dark:text-white">
                                        No assignments yet
                                    </h3>

                                </div>

                            )}

                        {/* LIST */}
                        {!loading &&
                        assignments.length > 0 && (

                                <div className="mt-6 space-y-4">

                                    {assignments.map((assignment) => (

                                        <div
                                            key={assignment.assignment_id}
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
                                                hover:shadow-xl
                                                hover:border-indigo-200

                                                dark:border-slate-700
                                                dark:bg-gradient-to-br
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
                                                <div className="flex-1 min-w-0">

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
                                                <div className="flex items-center gap-2 shrink-0">

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

                                                    <button
                                                        onClick={() =>
                                                            handleEditAssignment(
                                                                assignment
                                                            )
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
                                                <div className="flex items-center gap-2 text-slate-400">

                                                    <CalendarDays size={14} />

                                                    {assignment.created_at
                                                        ? new Date(
                                                            assignment.created_at
                                                        ).toLocaleDateString()
                                                        : '-'}

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

                                    ))}

                                </div>

                        )}

                    </div>

                    {/* MODAL */}
                    {openCreate && (

                        <div
                            className="
                                fixed
                                inset-0
                                z-50
                                overflow-y-auto
                                bg-black/20
                                backdrop-blur-sm
                            "
                        >

                            <div
                                className="
                                    flex
                                    min-h-screen
                                    items-start
                                    justify-center
                                    p-3
                                    sm:items-center
                                    sm:p-4

                                    scroll-smooth
                                    scrollbar-thin
                                    scrollbar-thumb-slate-300
                                    scrollbar-track-transparent

                                    dark:scrollbar-thumb-slate-700
                                "
                            >

                                {/* MODAL BOX */}
                                <div
                                    className="
                                        relative
                                        w-full
                                        max-w-4xl
                                        rounded-2xl
                                        bg-white
                                        shadow-2xl
                                        dark:bg-slate-900

                                        max-h-[95vh]
                                        overflow-y-auto

                                        animate-in
                                        fade-in
                                        zoom-in-95
                                        duration-200
                                    "
                                >

                                    {/* HEADER */}
                                    <div
                                        className="
                                            sticky
                                            top-0
                                            z-10
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            border-b
                                            border-slate-200
                                            bg-white/90
                                            px-5
                                            py-5
                                            backdrop-blur
                                            dark:border-slate-800
                                            dark:bg-slate-900/90
                                            sm:px-6
                                        "
                                    >

                                        <div>

                                            <h2 className="text-xl font-bold text-slate-800 dark:text-white sm:text-2xl">

                                                {isEditMode
                                                    ? 'Update Assignment'
                                                    : 'Create Assignment'}

                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                Create a writing assignment for students.
                                            </p>

                                        </div>

                                        <button
                                            onClick={() => {

                                                setOpenCreate(false)

                                                resetForm()
                                            }}
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-red-500
                                                text-white
                                                shadow-lg
                                                shadow-red-500/30
                                                transition-all
                                                duration-200
                                                hover:scale-110
                                                hover:bg-red-600
                                                active:scale-95
                                            "
                                        >

                                            <X size={20} />

                                        </button>

                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-5 sm:p-6">

                                        {/* FORM */}
                                        <div className="grid gap-6 lg:grid-cols-2">

                                            {/* LEFT */}
                                            <div className="space-y-5">

                                                {/* TITLE */}
                                                <div>

                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Assignment Title
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={title}
                                                        onChange={(e) =>
                                                            setTitle(e.target.value)
                                                        }
                                                        placeholder="Type here.."
                                                        className="
                                                            mt-2
                                                            w-full
                                                            rounded-2xl
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            text-slate-700
                                                            outline-none
                                                            transition-all
                                                            focus:border-indigo-500
                                                            focus:ring-4
                                                            focus:ring-indigo-100
                                                            dark:border-slate-700
                                                            dark:bg-slate-800
                                                            dark:text-white
                                                            dark:placeholder:text-slate-500
                                                            dark:focus:ring-indigo-500/20
                                                        "
                                                    />

                                                </div>

                                                {/* CLASS TARGET */}
                                                <div>

                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Class Target
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={classTarget}
                                                        onChange={(e) =>
                                                            setClassTarget(e.target.value)
                                                        }
                                                        placeholder="Class A"
                                                        className="
                                                            mt-2
                                                            w-full
                                                            rounded-2xl
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            text-slate-700
                                                            outline-none
                                                            transition-all
                                                            focus:border-indigo-500
                                                            focus:ring-4
                                                            focus:ring-indigo-100
                                                            dark:border-slate-700
                                                            dark:bg-slate-800
                                                            dark:text-white
                                                            dark:placeholder:text-slate-500
                                                            dark:focus:ring-indigo-500/20
                                                        "
                                                    />

                                                </div>

                                                {/* DESCRIPTION */}
                                                <div>

                                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                        Description
                                                    </label>

                                                    <textarea
                                                        rows={6}
                                                        value={description}
                                                        onChange={(e) =>
                                                            setDescription(e.target.value)
                                                        }
                                                        placeholder="Explain the assignment instructions..."
                                                        className="
                                                            mt-2
                                                            w-full
                                                            rounded-2xl
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            px-4
                                                            py-3
                                                            text-sm
                                                            text-slate-700
                                                            outline-none
                                                            transition-all
                                                            focus:border-indigo-500
                                                            focus:ring-4
                                                            focus:ring-indigo-100
                                                            dark:border-slate-700
                                                            dark:bg-slate-800
                                                            dark:text-white
                                                            dark:placeholder:text-slate-500
                                                            dark:focus:ring-indigo-500/20
                                                        "
                                                    />

                                                </div>

                                            </div>

                                            {/* RIGHT */}
                                            <div>

                                                <div
                                                    className="
                                                        rounded-2xl
                                                        border
                                                        border-slate-200
                                                        bg-slate-50
                                                        p-5
                                                        dark:border-slate-800
                                                        dark:bg-slate-800/40
                                                    "
                                                >

                                                    <div>

                                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                                            Writing Rubric
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                            Set writing assessment weight values.
                                                        </p>

                                                    </div>

                                                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                                                        {/* Grammar */}
                                                        <div>

                                                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                                                Grammar
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                value={grammarWeight}
                                                                onChange={(e) =>
                                                                    setGrammarWeight(
                                                                        Math.min(
                                                                            5,
                                                                            Math.max(
                                                                                0,
                                                                                Number(e.target.value)
                                                                            )
                                                                        )
                                                                    )
                                                                }
                                                                className="
                                                                    mt-2
                                                                    w-full
                                                                    rounded-2xl
                                                                    border
                                                                    border-slate-200
                                                                    bg-white
                                                                    px-4
                                                                    py-3
                                                                    text-sm
                                                                    outline-none
                                                                    transition-all
                                                                    focus:border-indigo-500
                                                                    focus:ring-4
                                                                    focus:ring-indigo-100
                                                                    dark:border-slate-700
                                                                    dark:bg-slate-900
                                                                    dark:text-white
                                                                    dark:focus:ring-indigo-500/20
                                                                "
                                                            />

                                                        </div>

                                                        {/* Mechanics */}
                                                        <div>

                                                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                                                Mechanics
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                value={mechanicsWeight}
                                                                onChange={(e) =>
                                                                    setMechanicsWeight(
                                                                        Math.min(
                                                                            5,
                                                                            Math.max(
                                                                                0,
                                                                                Number(e.target.value)
                                                                            )
                                                                        )
                                                                    )
                                                                }
                                                                className="
                                                                    mt-2
                                                                    w-full
                                                                    rounded-2xl
                                                                    border
                                                                    border-slate-200
                                                                    bg-white
                                                                    px-4
                                                                    py-3
                                                                    text-sm
                                                                    outline-none
                                                                    transition-all
                                                                    focus:border-indigo-500
                                                                    focus:ring-4
                                                                    focus:ring-indigo-100
                                                                    dark:border-slate-700
                                                                    dark:bg-slate-900
                                                                    dark:text-white
                                                                    dark:focus:ring-indigo-500/20
                                                                "
                                                            />

                                                        </div>

                                                        {/* Content */}
                                                        <div>

                                                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                                                Content
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                value={contentWeight}
                                                                onChange={(e) =>
                                                                    setContentWeight(
                                                                        Math.min(
                                                                            5,
                                                                            Math.max(
                                                                                0,
                                                                                Number(e.target.value)
                                                                            )
                                                                        )
                                                                    )
                                                                }
                                                                className="
                                                                    mt-2
                                                                    w-full
                                                                    rounded-2xl
                                                                    border
                                                                    border-slate-200
                                                                    bg-white
                                                                    px-4
                                                                    py-3
                                                                    text-sm
                                                                    outline-none
                                                                    transition-all
                                                                    focus:border-indigo-500
                                                                    focus:ring-4
                                                                    focus:ring-indigo-100
                                                                    dark:border-slate-700
                                                                    dark:bg-slate-900
                                                                    dark:text-white
                                                                    dark:focus:ring-indigo-500/20
                                                                "
                                                            />

                                                        </div>

                                                        {/* Unity */}
                                                        <div>

                                                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                                                Unity
                                                            </label>

                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={5}
                                                                value={unityWeight}
                                                                onChange={(e) =>
                                                                    setUnityWeight(
                                                                        Math.min(
                                                                            5,
                                                                            Math.max(
                                                                                0,
                                                                                Number(e.target.value)
                                                                            )
                                                                        )
                                                                    )
                                                                }
                                                                className="
                                                                    mt-2
                                                                    w-full
                                                                    rounded-2xl
                                                                    border
                                                                    border-slate-200
                                                                    bg-white
                                                                    px-4
                                                                    py-3
                                                                    text-sm
                                                                    outline-none
                                                                    transition-all
                                                                    focus:border-indigo-500
                                                                    focus:ring-4
                                                                    focus:ring-indigo-100
                                                                    dark:border-slate-700
                                                                    dark:bg-slate-900
                                                                    dark:text-white
                                                                    dark:focus:ring-indigo-500/20
                                                                "
                                                            />

                                                        </div>

                                                    </div>

                                                    {/* INFO */}
                                                    <div
                                                        className="
                                                            mt-5
                                                            rounded-2xl
                                                            bg-indigo-50
                                                            p-4
                                                            dark:bg-indigo-500/10
                                                        "
                                                    >

                                                        <p className="text-sm leading-relaxed text-indigo-700 dark:text-indigo-300">
                                                            Rubric values are flexible and can start from 0
                                                            depending on your assessment preference.
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                        {/* FOOTER */}
                                        <div className="mt-6 flex justify-end">

                                            <button
                                                onClick={handleCreateAssignment}
                                                disabled={submitting}
                                                className="
                                                    rounded-2xl
                                                    bg-indigo-600
                                                    px-6
                                                    py-3
                                                    text-sm
                                                    font-semibold
                                                    text-white
                                                    transition-all
                                                    duration-300
                                                    hover:bg-indigo-700
                                                    hover:scale-[1.02]
                                                    active:scale-95
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-70
                                                "
                                            >

                                                {submitting
                                                    ? (
                                                        isEditMode
                                                            ? 'Updating...'
                                                            : 'Publishing...'
                                                    )
                                                    : (
                                                        isEditMode
                                                            ? 'Update Assignment'
                                                            : 'Publish Assignment'
                                                    )}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}
                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default TeacherAssignment