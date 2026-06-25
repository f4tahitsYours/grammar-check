import { useEffect, useState }
from 'react'

import { getSubmissionHistory } from '../../api/service/student/studentApi'

export function useSubmissionHistory() {

    const [loading, setLoading] =
        useState(true)

    const [histories, setHistories] =
        useState<any[]>([])

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                setLoading(true)

                const data =
                    await getSubmissionHistory()

                setHistories(data.items || [])

            } catch (error) {

                console.log(error)

            } finally {

                setLoading(false)
            }
        }

        fetchHistory()

    }, [])

    /* AVG SCORE */
    const averageScore =
        histories.length > 0
            ? Math.round(
                histories
                    .filter((item) => {
                        const scoreValue = item.score_total ?? item.score
                        return scoreValue !== null && scoreValue !== undefined && !item.score_hidden
                    })
                    .reduce(
                        (acc, item) => {
                            const scoreValue = item.score_total ?? item.score
                            return acc + scoreValue
                        },
                        0
                    ) / histories.filter((item) => {
                        const scoreValue = item.score_total ?? item.score
                        return scoreValue !== null && scoreValue !== undefined && !item.score_hidden
                    }).length
            ) || 0
            : 0

    /* GRADE STYLE */
    const getGradeStyle = (
        grade: string
    ) => {

        switch (grade) {

            case 'A':
                return `
                    bg-green-100
                    text-green-700
                    dark:bg-green-950/30
                    dark:text-green-300
                `

            case 'B':
                return `
                    bg-blue-100
                    text-blue-700
                    dark:bg-blue-950/30
                    dark:text-blue-300
                `

            case 'C':
                return `
                    bg-yellow-100
                    text-yellow-700
                    dark:bg-yellow-950/30
                    dark:text-yellow-300
                `

            default:
                return `
                    bg-red-100
                    text-red-700
                    dark:bg-red-950/30
                    dark:text-red-300
                `
        }
    }

    return {

        loading,
        histories,

        averageScore,

        getGradeStyle
    }
}