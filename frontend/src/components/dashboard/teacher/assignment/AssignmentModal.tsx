import { X } from 'lucide-react'

import RubricInput from './RubricInput'
import ScoreVisibilityToggle from './ScoreVisibilityToggle'

type Props = {
    open: boolean
    isEditMode: boolean
    submitting: boolean

    title: string
    description: string
    classTarget: string
    showScore: boolean

    grammarWeight: number
    mechanicsWeight: number
    contentWeight: number
    unityWeight: number

    setTitle: (value: string) => void
    setDescription: (value: string) => void
    setClassTarget: (value: string) => void
    setShowScore: (value: boolean) => void

    setGrammarWeight: (value: number) => void
    setMechanicsWeight: (value: number) => void
    setContentWeight: (value: number) => void
    setUnityWeight: (value: number) => void

    onClose: () => void
    onSubmit: () => void
}

function AssignmentModal({
    open,
    isEditMode,
    submitting,

    title,
    description,
    classTarget,
    showScore,

    grammarWeight,
    mechanicsWeight,
    contentWeight,
    unityWeight,

    setTitle,
    setDescription,
    setClassTarget,
    setShowScore,

    setGrammarWeight,
    setMechanicsWeight,
    setContentWeight,
    setUnityWeight,

    onClose,
    onSubmit
}: Props) {

    if (!open) return null

    return (

        <div
            className="
                fixed inset-0 z-50
                overflow-y-auto
                bg-black/20
                backdrop-blur-sm
            "
        >

            <div
                className="
                    flex min-h-screen
                    items-start justify-center
                    p-3 sm:items-center sm:p-4

                    scroll-smooth
                    scrollbar-thin
                    scrollbar-thumb-slate-300
                    scrollbar-track-transparent

                    dark:scrollbar-thumb-slate-700
                "
            >

                {/* MODAL */}
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
                            sticky top-0 z-10
                            flex items-center justify-between
                            gap-4
                            border-b border-slate-200
                            bg-white/90
                            px-5 py-5
                            backdrop-blur

                            dark:border-slate-800
                            dark:bg-slate-900/90

                            sm:px-6
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-xl
                                    font-bold
                                    text-slate-800
                                    dark:text-white
                                    sm:text-2xl
                                "
                            >

                                {isEditMode
                                    ? 'Update Assignment'
                                    : 'Create Assignment'}

                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                Create a writing assignment for students.
                            </p>

                        </div>

                        <button
                            onClick={onClose}
                            className="
                                flex h-10 w-10
                                shrink-0
                                items-center justify-center
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

                    {/* BODY */}
                    <div className="p-5 sm:p-6">

                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* LEFT */}
                            <div className="space-y-5">

                                {/* TITLE */}
                                <div>

                                    <label
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-700
                                            dark:text-slate-300
                                        "
                                    >
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

                                    <label
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-700
                                            dark:text-slate-300
                                        "
                                    >
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

                                    <label
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-700
                                            dark:text-slate-300
                                        "
                                    >
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

                                {/* SCORE VISIBILITY */}
                                <ScoreVisibilityToggle
                                    showScore={showScore}
                                    setShowScore={setShowScore}
                                />

                            </div>

                            {/* RIGHT */}
                            <RubricInput
                                grammarWeight={grammarWeight}
                                mechanicsWeight={mechanicsWeight}
                                contentWeight={contentWeight}
                                unityWeight={unityWeight}

                                setGrammarWeight={setGrammarWeight}
                                setMechanicsWeight={setMechanicsWeight}
                                setContentWeight={setContentWeight}
                                setUnityWeight={setUnityWeight}
                            />

                        </div>

                        {/* FOOTER */}
                        <div className="mt-6 flex justify-end">

                            <button
                                onClick={onSubmit}
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
    )
}

export default AssignmentModal