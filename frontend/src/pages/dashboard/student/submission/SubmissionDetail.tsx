import { useEffect, useState } from 'react'

import {
    useParams,
    useNavigate
} from 'react-router-dom'

import {
    EyeOff,
    Clock,
    Image as ImageIcon,
    Volume2,
    Loader2,
    ArrowLeft
} from 'lucide-react'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import {
    getSubmissionDetail
} from '../../../../api/studentApi'

import {
    generatePoster,
    generateTTS
} from '../../../../api/service/student/studentApi'

import type {
    SubmissionDetailResponse
} from '../../../../types/teacher'

function SubmissionDetail() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] =
        useState(true)

    const [data, setData] =
        useState<SubmissionDetailResponse | null>(null)
    
    const [posterUrl, setPosterUrl] = useState<string | null>(null)
    const [posterLoading, setPosterLoading] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [audioLoading, setAudioLoading] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
        
    const showScoreSection =
    data?.score !== undefined &&
    data?.score !== null

    useEffect(() => {

        const fetchDetail = async () => {

            try {

                setLoading(true)

                const response =
                    await getSubmissionDetail(id!)

                setData(response)
                
                // Initialize multimedia URLs from API response
                if (response.poster_url) {
                    setPosterUrl(response.poster_url)
                }
                if (response.audio_url) {
                    setAudioUrl(response.audio_url)
                }

            } catch (error) {

                console.log(error)

            } finally {

                setLoading(false)
            }
        }

        fetchDetail()

    }, [id])
    
    const handleGeneratePoster = async () => {
        if (!id) return
        
        setPosterLoading(true)
        try {
            const response = await generatePoster(id)
            setPosterUrl(response.poster_url)
        } catch (error) {
            console.error('Failed to generate poster:', error)
            alert('Gagal generate poster. Silakan coba lagi.')
        } finally {
            setPosterLoading(false)
        }
    }
    
    const handleGenerateTTS = async () => {
        if (!id) return
        
        setAudioLoading(true)
        try {
            const response = await generateTTS(id)
            if (response.audio_url) {
                setAudioUrl(response.audio_url)
            } else {
                // Fallback to Web Speech API
                handleWebSpeechFallback()
            }
        } catch (error) {
            console.error('Failed to generate TTS:', error)
            // Fallback to Web Speech API
            handleWebSpeechFallback()
        } finally {
            setAudioLoading(false)
        }
    }
    
    const handleWebSpeechFallback = () => {
        if (!data?.corrected_text) return
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data.corrected_text)
            utterance.lang = 'en-US'
            utterance.rate = 0.9
            utterance.onstart = () => setIsPlaying(true)
            utterance.onend = () => setIsPlaying(false)
            window.speechSynthesis.speak(utterance)
        } else {
            alert('Browser Anda tidak mendukung text-to-speech')
        }
    }
    
    const handlePlayAudio = () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl)
            audio.play()
            setIsPlaying(true)
            audio.onended = () => setIsPlaying(false)
        } else {
            handleWebSpeechFallback()
        }
    }

    return (
        <DashboardLayout>

            <div className="space-y-6">

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate('/dashboard/student/history')}
                    className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-slate-600
                        hover:text-slate-900
                        dark:text-slate-300
                        dark:hover:text-slate-100
                        transition-colors
                    "
                >
                    <ArrowLeft size={18} />
                    Back to History
                </button>

                {/* HEADER */}
                <div>

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Submission Detail
                    </h1>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Full grammar correction result
                    </p>

                </div>

                {loading && (
                    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Loading detail...
                        </p>

                    </div>
                )}

                {!loading && data && (

                    <div className="space-y-6">

                        {/* SCORE HIDDEN BANNER */}
                        {data.score_hidden === true &&  (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    p-5
                                    dark:border-amber-900/40
                                    dark:bg-amber-950/20
                                "
                            >

                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-amber-100
                                            text-amber-600
                                            dark:bg-amber-900/40
                                            dark:text-amber-400
                                        "
                                    >
                                        <EyeOff size={20} />
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                                            Nilai Belum Ditampilkan
                                        </h3>

                                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                            Guru belum mengaktifkan tampilan nilai untuk tugas ini.
                                            Anda masih dapat melihat koreksi grammar dan feedback.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* AWAITING REVIEW BANNER */}
                        {!showScoreSection && data.rubric_status === 'awaiting_review' && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-blue-200
                                    bg-blue-50
                                    p-5
                                    dark:border-blue-900/40
                                    dark:bg-blue-950/20
                                "
                            >

                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-blue-100
                                            text-blue-600
                                            dark:bg-blue-900/40
                                            dark:text-blue-400
                                        "
                                    >
                                        <Clock size={20} />
                                    </div>

                                    <div>

                                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                                            Menunggu Penilaian Guru
                                        </h3>

                                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                            Submission Anda sedang menunggu penilaian dari guru.
                                            Nilai final akan muncul setelah guru menyelesaikan review.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* SCORE */}
                        {showScoreSection && (

                            <div className="grid gap-4 md:grid-cols-3">

                                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                                    <p className="text-sm text-slate-500">
                                        Score
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {data.score}
                                    </h3>
                                </div>

                                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                                    <p className="text-sm text-slate-500">
                                        Grade
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {data.grade}
                                    </h3>
                                </div>

                                <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                                    <p className="text-sm text-slate-500">
                                        Errors
                                    </p>

                                    <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                        {data.error_count}
                                    </h3>
                                </div>

                            </div>

                        )}

                        {/* RUBRIC SCORES (if complete and not hidden) */}
                        {! showScoreSection && data.rubric_status === 'complete' && data.score_total !== undefined && data.score_total !== null &&  (

                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                    Rubric Scores
                                </h3>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Grammar
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_grammar ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Mechanics
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_mechanics ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Content
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_content ?? '-'}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Unity
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                                            {data.score_unity ?? '-'}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-4 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/20">
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                        Total Score
                                    </p>
                                    <p className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                                        {data.score_total} / 20
                                    </p>
                                </div>

                            </div>

                        )}

                        {/* ORIGINAL */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Original Text
                            </h3>

                            <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">

                                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                                    {data.original_text}
                                </p>

                            </div>

                        </div>

                        {/* CORRECTED */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Corrected Text
                            </h3>

                            <div className="mt-4 rounded-2xl bg-green-50 p-5 dark:bg-green-950/20">

                                <p className="leading-relaxed text-green-700 dark:text-green-200">
                                    {data.corrected_text}
                                </p>

                            </div>

                        </div>

                        {/* DIFF */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Grammar Changes
                            </h3>

                            <div
                                className="
                                    mt-4
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-slate-300
                                    bg-slate-50
                                    p-5
                                    leading-8
                                    dark:border-slate-700
                                    dark:bg-slate-950
                                "
                                dangerouslySetInnerHTML={{
                                    __html: data.diff_html
                                }}
                            />

                        </div>

                        {/* FEEDBACK */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">

                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                                AI Feedback
                            </h3>

                            <div className="mt-4 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/20">

                                <p className="leading-relaxed text-indigo-700 dark:text-indigo-200">
                                    {data.feedback}
                                </p>

                            </div>

                        </div>

                        {/* MULTIMEDIA FEATURES */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            
                            {/* POSTER GENERATION */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                    Motivational Poster
                                </h3>
                                
                                {!posterUrl && (
                                    <button
                                        onClick={handleGeneratePoster}
                                        disabled={posterLoading}
                                        className="
                                            w-full
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            bg-gradient-to-r
                                            from-purple-500
                                            to-pink-500
                                            px-6
                                            py-3
                                            text-white
                                            font-semibold
                                            hover:from-purple-600
                                            hover:to-pink-600
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                            transition-all
                                        "
                                    >
                                        {posterLoading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon size={20} />
                                                Generate Poster
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {posterUrl && (
                                    <div className="space-y-3">
                                        <div className="aspect-square w-full">
                                            <img
                                                src={posterUrl}
                                                alt="Motivational Poster"
                                                className="h-full w-full rounded-xl shadow-lg object-contain"
                                            />
                                        </div>
                                        <button
                                            onClick={() => window.open(posterUrl, '_blank')}
                                            className="
                                                w-full
                                                text-sm
                                                text-purple-600
                                                hover:text-purple-700
                                                dark:text-purple-400
                                                dark:hover:text-purple-300
                                                transition-colors
                                            "
                                        >
                                            Open in new tab
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* TTS AUDIO */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                                    Text-to-Speech
                                </h3>
                                
                                <div className="space-y-3">
                                    {!audioUrl && (
                                        <button
                                            onClick={handleGenerateTTS}
                                            disabled={audioLoading}
                                            className="
                                                w-full
                                                flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                bg-gradient-to-r
                                                from-blue-500
                                                to-cyan-500
                                                px-6
                                                py-3
                                                text-white
                                                font-semibold
                                                hover:from-blue-600
                                                hover:to-cyan-600
                                                disabled:opacity-50
                                                disabled:cursor-not-allowed
                                                transition-all
                                            "
                                        >
                                            {audioLoading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Volume2 size={20} />
                                                    Generate Audio
                                                </>
                                            )}
                                        </button>
                                    )}
                                    
                                    {audioUrl && (
                                        <audio
                                            src={audioUrl}
                                            controls
                                            className="w-full"
                                        />
                                    )}
                                    
                                    {!audioUrl && !audioLoading && (
                                        <button
                                            onClick={handleWebSpeechFallback}
                                            disabled={isPlaying}
                                            className="
                                                w-full
                                                flex
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                border-2
                                                border-blue-200
                                                px-6
                                                py-2
                                                text-blue-600
                                                font-medium
                                                hover:bg-blue-50
                                                disabled:opacity-50
                                                disabled:cursor-not-allowed
                                                dark:border-blue-800
                                                dark:text-blue-400
                                                dark:hover:bg-blue-950/20
                                                transition-all
                                            "
                                        >
                                            <Volume2 size={18} />
                                            {isPlaying ? 'Playing...' : 'Play with Browser Speech'}
                                        </button>
                                    )}
                                    
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        {audioUrl ? 'High-quality AI voice' : 'Uses browser voice synthesis'}
                                    </p>
                                </div>
                            </div>
                            
                        </div>

                    </div>
                )}

            </div>

        </DashboardLayout>
    )
}

export default SubmissionDetail