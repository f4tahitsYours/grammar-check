import { useRef, useState } from 'react'

export function useAudioPlayer() {

    const [audioUrl, setAudioUrl] = useState('')

    const [showAudioControl, setShowAudioControl] =
        useState(false)

    const audioRef =
        useRef<HTMLAudioElement | null>(null)

    const playAudio = () => {

        if (audioRef.current) {

            audioRef.current.play()
        }
    }

    const pauseAudio = () => {

        if (audioRef.current) {

            audioRef.current.pause()
        }
    }

    const rewindAudio = () => {

        if (audioRef.current) {

            audioRef.current.currentTime -= 5
        }
    }

    const forwardAudio = () => {

        if (audioRef.current) {

            audioRef.current.currentTime += 5
        }
    }

    const resetAudio = () => {

        if (audioRef.current) {

            audioRef.current.pause()

            audioRef.current.currentTime = 0
        }

        setAudioUrl('')

        setShowAudioControl(false)
    }

    return {

        audioUrl,
        setAudioUrl,

        showAudioControl,
        setShowAudioControl,

        audioRef,

        playAudio,
        pauseAudio,
        rewindAudio,
        forwardAudio,
        resetAudio
    }
}