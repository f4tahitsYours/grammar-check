import { useEffect, useRef, useState } from 'react'
import {
    submitGrammar,
    generatePoster,
    generateTTS
} from '../../api/service/student/studentApi'

import { useSearchParams } from 'react-router-dom'

import api from '../../api/axios'
import { useAudioPlayer } from './useAudioPlayer'

type AssignmentNote = {
    assignment_id?: string
    title: string
    description: string
    created_at: string
}

export function useStudentDashboard() {

    const [searchParams] = useSearchParams()

    const assignmentId =
        searchParams.get('assignment_id') || null
        

    const [text, setText] = useState('')
    // WORD COUNT
    const wordCount =
        text.trim() === ''
            ? 0
            : text.trim().split(/\s+/).length
            
    const [loading, setLoading] = useState(false)
    const [hasResult, setHasResult] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // RESULT
    const [submissionId, setSubmissionId] = useState('')
    const [correctedText, setCorrectedText] = useState('')
    const [feedback, setFeedback] = useState('')
    const [score, setScore] = useState<number | null>(null)
    const [grade, setGrade] = useState<string | null>(null)
    const [errors, setErrors] = useState<any[]>([])

    const [showScore, setShowScore] = useState(false)

    const [assignmentNote, setAssignmentNote] =
        useState<AssignmentNote | null>(null)

    const [latestAssignments, setLatestAssignments] =
        useState<AssignmentNote[]>([])

    const audio = useAudioPlayer()

    // POSTER STATE
    const [posterUrl, setPosterUrl] = useState<string | null>(null)
    const [posterLoading, setPosterLoading] = useState(false)

    // FETCH ASSIGNMENT
    useEffect(() => {

        const fetchAssignments = async () => {

            try {

                const res =
                    await api.get('/student/assignments')

                const data = res.data?.data

                if (!Array.isArray(data)) return

                // RECENT ASSIGNMENTS
                setLatestAssignments(
                    data
                        .slice(0, 5)
                        .map((item: any) => ({
                            assignment_id: item.assignment_id,
                            title: item.title,
                            description: item.description,
                            created_at: item.created_at
                        }))
                )

                // ASSIGNMENT NOTE BERDASARKAN ID URL
                if (assignmentId) {

                    const selected =
                        data.find(
                            (item: any) =>
                                item.assignment_id === assignmentId
                        )

                    if (selected) {

                        setAssignmentNote({
                            assignment_id: selected.assignment_id,
                            title: selected.title,
                            description: selected.description,
                            created_at: selected.created_at
                        })

                        return
                    }
                }

                // DEFAULT = ASSIGNMENT TERBARU
                if (data.length > 0) {

                    const latest = data[0]

                    setAssignmentNote({
                        assignment_id: latest.assignment_id,
                        title: latest.title,
                        description: latest.description,
                        created_at: latest.created_at
                    })
                }

            } catch (err) {

                console.log(
                    'failed fetch assignment',
                    err
                )
            }
        }

        fetchAssignments()

    }, [assignmentId])

    // AUTO RESIZE
    const resizeTextarea = () => {

        if (!textareaRef.current) return

        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height =
            `${textareaRef.current.scrollHeight}px`
    }

    const handleTextarea = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setText(e.target.value)
    }

    useEffect(() => {
        resizeTextarea()
    }, [text])

    useEffect(() => {

        window.addEventListener(
            'resize',
            resizeTextarea
        )

        return () =>
            window.removeEventListener(
                'resize',
                resizeTextarea
            )

    }, [])

    // CLEAR
    const handleClear = () => {

        setText('')
        setHasResult(false)

        setSubmissionId('')
        setCorrectedText('')
        setFeedback('')
        setScore(null)
        setGrade(null)
        setErrors([])

        audio.resetAudio()

        if (textareaRef.current) {
            textareaRef.current.style.height =
                '160px'
        }
    }

    // CHECK GRAMMAR
    const handleCheckGrammar = async () => {

        try {

            setLoading(true)

            console.log('assignmentId:', assignmentId)
            console.log('text:', text)

            const data =
                await submitGrammar(
                    text,
                    assignmentId
                )

            setSubmissionId(
                data.submission_id
            )

            setCorrectedText(
                data.corrected_text
            )

            setFeedback(
                data.feedback
            )

            setErrors(
                data.errors || []
            )

            const hasScore =
                data.score !== undefined &&
                data.grade !== undefined

            setShowScore(
                hasScore
            )

            setScore(
                hasScore
                    ? data.score
                    : 0
            )

            setGrade(
                hasScore
                    ? data.grade
                    : '-'
            )

            setHasResult(true)

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)
        }
    }

    // AUDIO
    const handleToggleAudio = async () => {

        if (!submissionId) return

        try {

            const response =
                await generateTTS(submissionId)

            const audioUrl = response.audio_url

            console.log("Audio URL:", audioUrl)

            if (!audioUrl) {

                console.error("Audio URL tidak ditemukan")
                return
            }

            audio.setAudioUrl(audioUrl)

            audio.setShowAudioControl(true)

        } catch (err) {

            console.error("Generate TTS gagal:", err)

        }
    }

    // POSTER
    const handleGeneratePoster = async () => {

        if (!submissionId) return

        setPosterLoading(true)

        try {

            const response =
                await generatePoster(submissionId)

            const url = response.poster_url

            if (!url) {

                console.error("Poster URL tidak ditemukan")
                return
            }

            setPosterUrl(url)

        } catch (err) {

            console.error("Generate poster gagal:", err)

        } finally {

            setPosterLoading(false)
        }
    }

    return {

        text,
        setText,

        wordCount,

        loading,
        hasResult,

        textareaRef,

        correctedText,
        feedback,
        score,
        grade,
        errors,

        showScore,

        assignmentNote,
        latestAssignments,

        posterUrl,
        posterLoading,

        handleTextarea,
        handleClear,
        handleCheckGrammar,
        handleToggleAudio,
        handleGeneratePoster,

        ...audio
    }
}