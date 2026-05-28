import { useEffect, useRef, useState } from 'react'

export function useAudioPlayer() {

    const [audioUrl, setAudioUrl] = useState<string | null>(null)

    const [showAudioControl, setShowAudioControl] =
        useState(false)

    const [isPlaying, setIsPlaying] =
        useState(false)

    const audioRef =
        useRef<HTMLAudioElement | null>(null)

    // PLAY
    const playAudio = async () => {

        try {

            if (!audioRef.current) return

            await audioRef.current.play()

            setIsPlaying(true)

        } catch (error) {

            console.log(error)
        }
    }

    // PAUSE
    const pauseAudio = () => {

        if (!audioRef.current) return

        audioRef.current.pause()

        setIsPlaying(false)
    }

    // TOGGLE PLAY / PAUSE
    const toggleAudio = async () => {

        if (!audioRef.current) return

        if (isPlaying) {

            pauseAudio()

        } else {

            await playAudio()
        }
    }

    // REWIND 5 SEC
    const rewindAudio = () => {

        if (!audioRef.current) return

        audioRef.current.currentTime =
            Math.max(
                0,
                audioRef.current.currentTime - 5
            )
    }

    // FORWARD 5 SEC
    const forwardAudio = () => {

        if (!audioRef.current) return

        audioRef.current.currentTime =
            Math.min(
                audioRef.current.duration || 0,
                audioRef.current.currentTime + 5
            )
    }

    // RESET
    const resetAudio = () => {

        if (audioRef.current) {

            audioRef.current.pause()

            audioRef.current.currentTime = 0
        }

        setAudioUrl('')

        setShowAudioControl(false)

        setIsPlaying(false)
    }

    // HANDLE AUDIO END
    useEffect(() => {

        const audio = audioRef.current

        if (!audio) return

        const handleEnded = () => {

            setIsPlaying(false)
        }

        audio.addEventListener('ended', handleEnded)

        return () => {

            audio.removeEventListener(
                'ended',
                handleEnded
            )
        }

    }, [audioUrl])

    return {

        audioUrl,
        setAudioUrl,

        showAudioControl,
        setShowAudioControl,

        isPlaying,

        audioRef,

        playAudio,
        pauseAudio,
        toggleAudio,

        rewindAudio,
        forwardAudio,

        resetAudio
    }
}