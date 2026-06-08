import { useEffect, useState } from 'react'

import DashboardLayout from '../../../../components/layout/DashboardLayout'
import PageTransition from '../../../../components/common/PageTransition'

import {
    ClipboardList,
    Plus
} from 'lucide-react'

import {
    getTeacherAssignments,
    createTeacherAssignment,
    updateTeacherAssignment
} from '../../../../api/teacherApi'

import AssignmentCard from '../../../../components/dashboard/teacher/assignment/AssignmentCard'
import AssignmentModal from '../../../../components/dashboard/teacher/assignment/AssignmentModal'

export type Assignment = {
    assignment_id?: string
    id?: string

    title: string
    description: string
    class_target: string

    show_score?: boolean

    rubric?: {
        grammar_weight: number
        mechanics_weight: number
        content_weight: number
        unity_weight: number
    }

    created_at?: string
}

function TeacherAssignment() {

    const [assignments, setAssignments] =
        useState<Assignment[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [openCreate, setOpenCreate] =
        useState(false)

    const [isEditMode, setIsEditMode] =
        useState(false)

    const [selectedAssignmentId, setSelectedAssignmentId] =
        useState('')

    const [submitting, setSubmitting] =
        useState(false)

    // FORM
    const [title, setTitle] =
        useState('')

    const [description, setDescription] =
        useState('')

    const [classTarget, setClassTarget] =
        useState('')

    const [showScore, setShowScore] =
        useState(false)

    const [grammarWeight, setGrammarWeight] =
        useState(0)

    const [mechanicsWeight, setMechanicsWeight] =
        useState(0)

    const [contentWeight, setContentWeight] =
        useState(0)

    const [unityWeight, setUnityWeight] =
        useState(0)

    // FETCH
    const fetchAssignments = async () => {

        try {

            setLoading(true)
            setError('')

            const response =
                await getTeacherAssignments()

            const data =
                Array.isArray(response?.data)
                    ? response.data
                    : []

            setAssignments(data)

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

    // RESET
    const resetForm = () => {

        setTitle('')
        setDescription('')
        setClassTarget('')

        setGrammarWeight(0)
        setMechanicsWeight(0)
        setContentWeight(0)
        setUnityWeight(0)

        setShowScore(false)

        setIsEditMode(false)
        setSelectedAssignmentId('')
    }

    // EDIT
    const handleEditAssignment = (
        assignment: Assignment
    ) => {

        const id =
            assignment.assignment_id ||
            assignment.id ||
            ''

        setSelectedAssignmentId(id)

        setIsEditMode(true)

        setTitle(assignment.title)
        setDescription(assignment.description)
        setClassTarget(assignment.class_target)

        setShowScore(
            assignment.show_score || false
        )

        setGrammarWeight(
            assignment.rubric?.grammar_weight || 0
        )

        setMechanicsWeight(
            assignment.rubric?.mechanics_weight || 0
        )

        setContentWeight(
            assignment.rubric?.content_weight || 0
        )

        setUnityWeight(
            assignment.rubric?.unity_weight || 0
        )

        setOpenCreate(true)
    }

    // SUBMIT
    const handleSubmit = async () => {

        try {

            setSubmitting(true)

            const payload = {
                title,
                description,
                class_target: classTarget,
                show_score: showScore,

                rubric: {
                    grammar_weight: grammarWeight,
                    mechanics_weight: mechanicsWeight,
                    content_weight: contentWeight,
                    unity_weight: unityWeight,

                    grading_scale: {
                        "0": "D",
                        "9": "C",
                        "13": "B",
                        "17": "A"
                    }
                }
            }

            if (isEditMode) {

                await updateTeacherAssignment(
                    selectedAssignmentId,
                    payload
                )

            } else {

                await createTeacherAssignment(
                    payload
                )
            }

            setOpenCreate(false)

            resetForm()

            fetchAssignments()

        } catch (error) {

            console.log(error)

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
                            rounded-3xl
                            bg-gradient-to-r
                            from-indigo-600
                            to-indigo-500
                            p-6
                            text-white
                            shadow-lg
                        "
                    >

                        <div
                            className="
                                flex flex-col gap-5
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >

                            <div>

                                <p className="text-sm text-indigo-100">
                                    Teacher Assignment
                                </p>

                                <h1 className="mt-2 text-3xl font-bold">
                                    Assignment Management
                                </h1>

                            </div>

                            <button
                                onClick={() => {

                                    resetForm()

                                    setOpenCreate(true)
                                }}
                                className="
                                    flex items-center gap-2
                                    rounded-2xl
                                    bg-white
                                    px-5 py-3
                                    text-sm font-semibold
                                    text-indigo-600
                                    transition-all
                                    hover:scale-[1.02]
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
                            p-6
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        <div
                            className="
                                flex items-center
                                justify-between
                                border-b
                                border-slate-200
                                pb-5
                                dark:border-slate-800
                            "
                        >

                            <div>

                                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Assignment List
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Published classroom assignments
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

                            <div className="py-20 text-center text-slate-600 dark:text-slate-300">

                                Loading assignments...

                            </div>
                        )}

                        {/* ERROR */}
                        {!loading && error && (

                            <div className="py-20 text-center text-red-500">

                                {error}

                            </div>
                        )}

                        {/* LIST */}
                        {!loading && !error && (
                            <>
                                {assignments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                                        
                                        <ClipboardList size={48} className="mb-3 text-slate-400" />

                                        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                                            No assignments yet
                                        </p>

                                        <p className="text-sm text-slate-400">
                                            Created assignments will appear here
                                        </p>

                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-5">
                                        {assignments.map((assignment) => (
                                            <AssignmentCard
                                                key={assignment.assignment_id || assignment.id}
                                                assignment={assignment}
                                                onEdit={handleEditAssignment}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                    {/* MODAL */}
                    <AssignmentModal
                        open={openCreate}

                        onClose={() => {

                            setOpenCreate(false)

                            resetForm()
                        }}

                        isEditMode={isEditMode}
                        submitting={submitting}

                        title={title}
                        setTitle={setTitle}

                        description={description}
                        setDescription={setDescription}

                        classTarget={classTarget}
                        setClassTarget={setClassTarget}

                        showScore={showScore}
                        setShowScore={setShowScore}

                        grammarWeight={grammarWeight}
                        setGrammarWeight={setGrammarWeight}

                        mechanicsWeight={mechanicsWeight}
                        setMechanicsWeight={setMechanicsWeight}

                        contentWeight={contentWeight}
                        setContentWeight={setContentWeight}

                        unityWeight={unityWeight}
                        setUnityWeight={setUnityWeight}

                        onSubmit={handleSubmit}
                    />

                </div>

            </PageTransition>

        </DashboardLayout>
    )
}

export default TeacherAssignment