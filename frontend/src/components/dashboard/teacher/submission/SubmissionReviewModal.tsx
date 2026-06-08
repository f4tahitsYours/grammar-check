import { useEffect } from 'react'
import { ArrowRight, X } from 'lucide-react'

interface Props {
    open: boolean
    onClose: () => void

    detail: SubmissionDetail | null

    detailLoading: boolean

    scoreContent: number
    scoreUnity: number

    setScoreContent: (value: number) => void
    setScoreUnity: (value: number) => void

    onSubmit: () => void
    submitLoading: boolean
}

interface SubmissionDetail {
    original_text: string
    corrected_text: string

    score_grammar?: number | null
    score_mechanics?: number | null

    word_count?: number | null
    error_count?: number | null

    score?: number | null
    grade?: string | null

    created_at?: string | null
    reviewed_at?: string | null

    score_total?: number | null
}

function SubmissionReviewModal({
    open,
    onClose,
    detail,
    detailLoading,
    scoreContent,
    scoreUnity,
    setScoreContent,
    setScoreUnity,
    onSubmit,
    submitLoading
}: Props) {

        useEffect(() => {

        if (!open) return

        const handleEscape = (
            e: KeyboardEvent
        ) => {

            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.body.style.overflow = 'hidden'

        window.addEventListener(
            'keydown',
            handleEscape
        )

        return () => {

            document.body.style.overflow = ''

            window.removeEventListener(
                'keydown',
                handleEscape
            )
        }

    }, [open, onClose])

    if (!open) return null

    return (

        <div
            onClick={onClose}
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                p-3
                sm:p-4
                bg-black/50
            "
        >

            <div
                onClick={(e) => e.stopPropagation()}
                className={`
                    max-h-[90vh]
                    w-full
                    max-w-3xl
                    overflow-y-auto
                    rounded-2xl
                    bg-white
                    p-4
                    shadow-2xl
                    transition-all
                    duration-300
                    scroll-smooth
                    scrollbar-thin
                    scrollbar-thumb-slate-300
                    dark:scrollbar-thumb-slate-700
                    scrollbar-track-transparent
                    dark:bg-slate-900
                    sm:p-6

                    ${open
                        ? 'translate-y-0 scale-100 opacity-100'
                        : 'translate-y-10 scale-95 opacity-0'}
                `}
            >

                {/* HEADER */}
                <div className="flex items-center justify-between gap-4">

                    <div>

                        <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                            Review Submission
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Review student writing and provide assessment.
                        </p>

                    </div>

                    <button
                        onClick={onClose}
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

                {/* LOADING */}
                {detailLoading ? (

                    <div className="space-y-5 py-4 animate-pulse">

                        <div className="h-7 w-52 rounded-xl bg-slate-200 dark:bg-slate-700"></div>

                        <div className="space-y-3">

                            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-4 w-4/6 rounded bg-slate-200 dark:bg-slate-700"></div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>
                            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700"></div>

                        </div>

                    </div>

                ) : detail && (

                    <div className="mt-6 space-y-6">

                        {/* ORIGINAL */}
                        <div>

                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                Original Text
                            </h3>

                            <div
                                className="
                                    mt-3
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                    dark:border-slate-800
                                    dark:bg-slate-800/40
                                "
                            >

                                <p className="break-words text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    {detail.original_text}
                                </p>

                            </div>

                        </div>

                        {/* CORRECTED */}
                        <div>

                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                Corrected Text
                            </h3>

                            <div
                                className="
                                    mt-3
                                    rounded-2xl
                                    border
                                    border-emerald-200
                                    bg-emerald-50
                                    p-4
                                    dark:border-emerald-900
                                    dark:bg-emerald-950/20
                                "
                            >

                                <p className="break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                    {detail.corrected_text}
                                </p>

                            </div>

                        </div>

                        {/* SCORE INFO */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-4
                                    dark:border-slate-800
                                "
                            >

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Grammar Score
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                                    {detail.score_grammar ?? '-'}
                                </p>

                            </div>

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-4
                                    dark:border-slate-800
                                "
                            >

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Mechanics Score
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                                    {detail.score_mechanics ?? '-'}
                                </p>

                            </div>

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-4
                                    dark:border-slate-800
                                "
                            >

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Word Count
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                                    {detail.word_count ?? '-'}
                                </p>

                            </div>

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-4
                                    dark:border-slate-800
                                "
                            >

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Error Count
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                                    {detail.error_count ?? '-'}
                                </p>

                            </div>

                        </div>

                        {/* REVIEW FORM */}
                        <div
                            className="
                                rounded-2xl
                                border
                                border-slate-200
                                p-5
                                dark:border-slate-800
                            "
                        >

                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Teacher Assessment
                            </h3>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-medium dark:text-slate-300">
                                        Content Score
                                    </label>

                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={scoreContent}
                                        onChange={(e) =>
                                            setScoreContent(
                                                Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        Number(e.target.value)
                                                    )
                                                )
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            py-3
                                            outline-none
                                            focus:border-amber-500
                                            dark:border-slate-700
                                            dark:bg-slate-900
                                            dark:text-white
                                        "
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-medium dark:text-slate-300">
                                        Unity Score
                                    </label>

                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={scoreUnity}
                                        onChange={(e) =>
                                            setScoreUnity(
                                                Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        Number(e.target.value)
                                                    )
                                                )
                                            )
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            py-3
                                            outline-none
                                            focus:border-amber-500
                                            dark:border-slate-700
                                            dark:bg-slate-900
                                            dark:text-white
                                        "
                                    />

                                </div>

                            </div>

                            <div className="mt-6 flex justify-end">

                                <button
                                    onClick={onSubmit}
                                    disabled={
                                        submitLoading ||
                                        scoreContent < 0 ||
                                        scoreContent > 100 ||
                                        scoreUnity < 0 ||
                                        scoreUnity > 100
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-amber-500
                                        px-5
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition-all
                                        duration-300
                                        hover:bg-amber-600
                                        hover:scale-105
                                        active:scale-95
                                        disabled:opacity-60
                                    "
                                >

                                    {submitLoading
                                        ? 'Submitting...'
                                        : 'Submit Review'}

                                    <ArrowRight size={16} />

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    )
}

export default SubmissionReviewModal