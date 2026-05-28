import { useEffect, useRef, useState } from 'react'
import {
    submitGrammar,
    generatePoster,
    generateTTS
} from '../../api/service/student/studentApi'

import api from '../../api/axios'
import { useAudioPlayer } from './useAudioPlayer'

type AssignmentNote = {
    title: string
    description: string
    created_at: string
}

export function useStudentDashboard() {

    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [hasResult, setHasResult] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    // RESULT
    const [submissionId, setSubmissionId] = useState('')
    const [correctedText, setCorrectedText] = useState('')
    const [feedback, setFeedback] = useState('')
    const [score, setScore] = useState<number | null>(null)
    const [grade, setGrade] = useState<string | null>(null)
    const [diffHtml, setDiffHtml] = useState('')

    const [showScore, setShowScore] = useState(false)

    // ✅ FIX: assignment note (AUTO FETCH)
    const [assignmentNote, setAssignmentNote] = useState<AssignmentNote | null>(null)

    const audio = useAudioPlayer()

    // AUTO FETCH LATEST ASSIGNMENT
    useEffect(() => {
        const fetchLatestAssignment = async () => {
            try {
                const res = await api.get('/student/assignments')

                const data = res.data?.data

                if (Array.isArray(data) && data.length > 0) {
                    const latest = data[0]

                    setAssignmentNote({
                        title: latest.title,
                        description: latest.description,
                        created_at: latest.created_at
                    })
                }

            } catch (err) {
                console.log('failed fetch assignment', err)
            }
        }

        fetchLatestAssignment()
    }, [])

    // AUTO RESIZE
    const resizeTextarea = () => {
        if (!textareaRef.current) return
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }

    const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
    }

    useEffect(() => {
        resizeTextarea()
    }, [text])

    useEffect(() => {
        window.addEventListener('resize', resizeTextarea)
        return () => window.removeEventListener('resize', resizeTextarea)
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
        setDiffHtml('')

        audio.resetAudio()

        if (textareaRef.current) {
            textareaRef.current.style.height = '160px'
        }
    }

    // CHECK GRAMMAR
    const handleCheckGrammar = async () => {
        try {
            setLoading(true)

            const data = await submitGrammar(
                text,
                '3fa85f64-5717-4562-b3fc-2c963f66afa6'
            )

            setSubmissionId(data.submission_id)
            setCorrectedText(data.corrected_text)
            setFeedback(data.feedback)
            setDiffHtml(data.diff_html)

            const hasScore =
                data.score !== undefined &&
                data.grade !== undefined

            setShowScore(hasScore)

            setScore(hasScore ? data.score : 0)
            setGrade(hasScore ? data.grade : '-')

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

        const url = await generateTTS(submissionId)

        audio.setAudioUrl(url)
        audio.setShowAudioControl(true)

        requestAnimationFrame(() => {
            audio.playAudio()
        })
    }

    // POSTER
    const handleGeneratePoster = async () => {
        if (!submissionId) return

        const imageUrl = await generatePoster(submissionId)
        window.open(imageUrl, '_blank')
    }

    return {
        text,
        setText,
        loading,
        hasResult,
        textareaRef,

        correctedText,
        feedback,
        score,
        grade,
        diffHtml,

        showScore,
        assignmentNote,

        handleTextarea,
        handleClear,
        handleCheckGrammar,
        handleToggleAudio,
        handleGeneratePoster,

        ...audio
    }
}