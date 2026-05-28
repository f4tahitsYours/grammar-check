import PageTransition from '../../../components/common/PageTransition'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { SendHorizonal, Volume2, Sparkles, Trophy, X, RotateCcw, RotateCw, Pause, ImagePlus, Play } from 'lucide-react'
import { useStudentDashboard } from '../../../hooks/student/useStudentDashboard'

function StudentDashboard() {

    const {
        text,
        loading,
        hasResult,
        textareaRef,
        correctedText,
        feedback,
        score,
        grade,
        diffHtml,
        audioUrl,
        showAudioControl,
        showScore,
        audioRef,
        isPlaying,
        toggleAudio,
        handleTextarea,
        handleClear,
        handleCheckGrammar,
        handleToggleAudio,
        handleGeneratePoster,
        pauseAudio,
        rewindAudio,
        forwardAudio,
        setShowAudioControl,
        assignmentNote,
    } = useStudentDashboard()

    const wordCount = text.trim()
        ? text.trim().split(/\s+/).length
        : 0

    const isTooShort = wordCount < 20

    const isTooLong = wordCount > 500

    return (

        <DashboardLayout>

            <PageTransition>

                {/* MAIN GRID */}
                <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">

                    {/* LEFT SIDE */}
                    <div className="space-y-6">

                        {/* INPUT PANEL */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            {/* HEADER */}
                            <div className="mb-4 flex items-center justify-between">

                                <div>

                                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        Your Text
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Write or paste your English paragraph
                                    </p>

                                </div>

                                <p className="text-sm text-slate-400">
                                    {wordCount} words
                                </p>

                            </div>

                            {/* TEXTAREA WRAPPER */}
                            <div className="relative">

                                {/* CLEAR BUTTON */}
                                {text.length > 0 && (
                                    <button
                                        onClick={handleClear}
                                        className="
                                            absolute
                                            right-4
                                            top-4
                                            z-10
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-slate-100
                                            text-slate-500
                                            transition
                                            hover:bg-red-100
                                            hover:text-red-500
                                            dark:bg-slate-800
                                            dark:text-slate-300
                                            dark:hover:bg-red-950/40
                                            dark:hover:text-red-400
                                        "
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                                {/* TEXTAREA */}
                                <textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={handleTextarea}
                                    disabled={loading}
                                    placeholder="Write your English text here..."
                                    className={`
                                    min-h-[160px]
                                    w-full
                                    max-w-full
                                    overflow-y-hidden
                                    break-words
                                    resize-none
                                    rounded-2xl
                                    border
                                    border-slate-300
                                    bg-white
                                    p-4
                                    sm:p-5
                                    pr-12
                                    text-sm
                                    sm:text-base
                                    text-slate-800
                                    outline-none
                                    transition
                                    focus:border-indigo-500
                                    focus:ring-4
                                    focus:ring-indigo-100
                                    dark:border-slate-700
                                    dark:bg-slate-950
                                    dark:text-white
                                    dark:focus:ring-indigo-900/40

                                    ${loading
                                        ? `
                                            opacity-60
                                            blur-[1px]
                                            cursor-not-allowed
                                            transition-all duration-300
                                        `
                                        : ''
                                    }
                                `}
                                />

                            </div>

                            {/* TEXT HINT */}
                            <div className="mt-2 flex items-center justify-between">

                                <p className="text-sm text-slate-400">
                                    Minimum 20 words • Maximum 500 words
                                </p>

                                <div className="flex items-center gap-3">

                                    {isTooShort && text.length > 0 && (
                                        <p className="text-sm text-red-500">
                                            Text is too short
                                        </p>
                                    )}

                                    {isTooLong && (
                                        <p className="text-sm text-amber-500">
                                            Maximum 500 words
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">

                                {/* SOUND */}
                                <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">

                                    {/* SOUND BUTTON */}
                                    <button
                                        disabled={!hasResult}
                                        onClick={handleToggleAudio}
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-slate-300
                                            px-4
                                            py-2.5
                                            text-sm
                                            font-medium
                                            text-slate-700
                                            transition
                                            hover:bg-slate-100
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                            dark:border-slate-700
                                            dark:text-slate-300
                                            dark:hover:bg-slate-800
                                        "
                                    >
                                        <Volume2 size={18} />
                                        Sound
                                    </button>

                                    {/* AUDIO CONTROLS */}
                                    {showAudioControl && (
                                        <div
                                            className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-1
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-slate-50
                                                p-1
                                                dark:border-slate-700
                                                dark:bg-slate-950
                                            "
                                        >

                                            {/* REWIND */}
                                            <button
                                                onClick={rewindAudio}
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    text-slate-600
                                                    transition
                                                    hover:bg-slate-200
                                                    dark:text-slate-300
                                                    dark:hover:bg-slate-800
                                                "
                                            >
                                                <RotateCcw size={18} />
                                            </button>

                                            {/* PLAY / PAUSE */}
                                            <button
                                                onClick={toggleAudio}
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-indigo-600
                                                    text-white
                                                    transition
                                                    hover:bg-indigo-700
                                                "
                                            >
                                                {isPlaying
                                                    ? <Pause size={18} />
                                                    : <Play size={18} />
                                                }
                                            </button>

                                            {/* FORWARD */}
                                            <button
                                                onClick={forwardAudio}
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    text-slate-600
                                                    transition
                                                    hover:bg-slate-200
                                                    dark:text-slate-300
                                                    dark:hover:bg-slate-800
                                                "
                                            >
                                                <RotateCw size={18} />
                                            </button>

                                            {/* CLOSE */}
                                            <button
                                                onClick={() => {

                                                    setShowAudioControl(false)

                                                    pauseAudio()
                                                }}
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    text-slate-500
                                                    transition
                                                    hover:bg-red-100
                                                    hover:text-red-500
                                                    dark:hover:bg-red-950/40
                                                "
                                            >
                                                <X size={18} />
                                            </button>

                                        </div>
                                    )}

                                </div>

                                {/* CHECK BUTTON */}
                                <button
                                    disabled={isTooShort || isTooLong || loading}
                                    onClick={handleCheckGrammar}
                                    className="
                                        ml-auto
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-indigo-600
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        w-full
                                        justify-center
                                        sm:ml-auto
                                        sm:w-[190px]
                                        hover:bg-indigo-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <SendHorizonal size={18} />

                                    {loading
                                        ? 'Checking...'
                                        : 'Check Grammar'
                                    }
                                </button>

                            </div>

                        </div>

                        {/* RESULT SECTION */}
                        {hasResult && (
                            <div className="space-y-6 animate-in fade-in duration-300">

                                {/* RESULT PANEL */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                                    {/* TITLE */}
                                    <div className="mb-4 flex items-start justify-between">

                                        <div>

                                            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                                Corrected Result
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                AI-generated grammar correction result
                                            </p>

                                        </div>

                                        {/* GENERATE POSTER */}
                                        <button
                                            onClick={handleGeneratePoster}
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-slate-300
                                                px-4
                                                py-2
                                                text-sm
                                                font-medium
                                                text-slate-700
                                                transition
                                                hover:bg-slate-100
                                                dark:border-slate-700
                                                dark:text-slate-300
                                                dark:hover:bg-slate-800
                                            "
                                        >
                                            <ImagePlus size={18} />
                                            Generate Poster
                                        </button>

                                    </div>

                                    {/* CORRECTION DETAIL */}
                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-dashed
                                            border-slate-300
                                            bg-slate-50
                                            p-5
                                            leading-relaxed
                                            dark:border-slate-700
                                            dark:bg-slate-950
                                        "
                                    >

                                        <div
                                            className="
                                                leading-8
                                                text-slate-700
                                                dark:text-slate-300
                                            "
                                            dangerouslySetInnerHTML={{
                                                __html: diffHtml
                                            }}
                                        />

                                    </div>

                                    {/* FINAL RESULT */}
                                    <div className="mt-5">

                                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            Final Corrected Text
                                        </h3>

                                        <div
                                            className="
                                                rounded-2xl
                                                bg-green-50
                                                p-5
                                                leading-relaxed
                                                text-green-800
                                                dark:bg-green-950/20
                                                dark:text-green-200
                                            "
                                        >
                                            {correctedText}
                                        </div>

                                    </div>

                                </div>

                                {/* FEEDBACK PANEL */}
                                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                                        AI Feedback
                                    </h3>

                                    <div className="mt-4 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/30">

                                        <p className="text-sm leading-relaxed text-indigo-700 dark:text-indigo-200">
                                            {feedback}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        )}

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">

                        {/* ASSIGNMENT NOTE */}
                        {assignmentNote && (
                            <div className="
                                rounded-2xl 
                                border 
                                border-indigo-100 
                                bg-white 
                                p-5 
                                shadow-sm 
                                transition 
                                dark:border-slate-700 
                                dark:bg-slate-900
                            ">

                                {/* HEADER */}
                                <div className="flex items-start gap-3">

                                    {/* ICON */}
                                    <div className="
                                        flex 
                                        h-12 
                                        w-12 
                                        items-center 
                                        justify-center 
                                        rounded-2xl 
                                        bg-indigo-100 
                                        text-indigo-600 
                                        dark:bg-indigo-950/40
                                    ">
                                        <Sparkles size={22} />
                                    </div>

                                    {/* TITLE */}
                                    <div className="flex-1">

                                        <h3 className="
                                            text-sm 
                                            font-bold 
                                            text-slate-800 
                                            dark:text-slate-100
                                        ">
                                            📌 Latest Assignment
                                        </h3>

                                        <p className="
                                            text-xs 
                                            text-slate-500 
                                            dark:text-slate-400
                                            px-6
                                        ">
                                            New task from your teacher
                                        </p>

                                    </div>

                                </div>

                                {/* CONTENT */}
                                <div className="
                                    mt-4 
                                    rounded-xl 
                                    bg-indigo-50 
                                    p-4 
                                    dark:bg-indigo-950/20
                                ">

                                    <p className="
                                        text-sm 
                                        leading-relaxed 
                                        text-slate-700 
                                        dark:text-slate-200
                                    ">
                                        {assignmentNote.description}
                                    </p>

                                </div>

                                {/* FOOTER */}
                                <div className="
                                    mt-3 
                                    flex 
                                    items-center 
                                    justify-between
                                ">

                                    <span className="
                                        text-xs 
                                        text-slate-400
                                    ">
                                        📅 Created at
                                    </span>

                                    <span className="
                                        text-xs 
                                        font-semibold 
                                        text-indigo-600 
                                        dark:text-indigo-300
                                    ">
                                        {new Date(assignmentNote.created_at).toLocaleDateString(
                                            'id-ID',
                                            {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }
                                        )}
                                    </span>

                                </div>

                            </div>
                        )}

                        {/* SCORE CARD */}
                        {showScore && (

                            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">

                                <div className="flex items-center gap-3">

                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-indigo-100
                                            text-indigo-600
                                            dark:bg-indigo-950/40
                                        "
                                    >
                                        <Sparkles size={22} />
                                    </div>

                                    <div>

                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Grammar Score
                                        </p>

                                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                            {score}/100
                                        </h3>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* GRADE CARD */}
                        {showScore && (

                            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">

                                <div className="flex items-center gap-3">

                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-indigo-100
                                            text-indigo-600
                                            dark:bg-indigo-950/40
                                        "
                                    >
                                        <Trophy size={22} />
                                    </div>

                                    <div>

                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Grade
                                        </p>

                                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                                            {grade}
                                        </h3>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

                {/* AUDIO */}
                <audio
                    ref={audioRef}
                    src={audioUrl || undefined}
                />

            </PageTransition>

        </DashboardLayout>
    )
}

export default StudentDashboard