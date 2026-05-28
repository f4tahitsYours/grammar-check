import { useMemo, useState } from 'react'

import DashboardLayout
from '../../../../components/layout/DashboardLayout'

import PageTransition
from '../../../../components/common/PageTransition'

import {
    usePendingReviews
} from '../../../../hooks/teacher/usePendingReviews'

import {
    useSubmissionDetail
} from '../../../../hooks/teacher/useSubmissionDetail'

import {
    reviewSubmission
} from '../../../../api/service/teacher/submissionService'

import SubmissionHero
from '../../../../components/dashboard/teacher/submission/SubmissionHero'

import SubmissionSearch
from '../../../../components/dashboard/teacher/submission/SubmissionSearch'

import SubmissionList
from '../../../../components/dashboard/teacher/submission/SubmissionList'

import SubmissionReviewModal
from '../../../../components/dashboard/teacher/submission/SubmissionReviewModal'

function TeacherSubmission() {

    const {
        data,
        loading,
        refetch
    } = usePendingReviews()

    const {
        data: detail,
        fetchDetail,
        loading: detailLoading
    } = useSubmissionDetail()

    const [open, setOpen] =
        useState(false)

    const [search, setSearch] =
        useState('')

    const [scoreContent, setScoreContent] =
        useState<number>(0)

    const [scoreUnity, setScoreUnity] =
        useState<number>(0)

    const [submitLoading, setSubmitLoading] =
        useState(false)

    const filteredItems = useMemo(() => {

        if (!data?.length) return []

        return data.filter((item: any) =>
            item.student_name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        )

    }, [data, search])

    const handleOpenDetail = async (
        submissionId: string
    ) => {

        setOpen(true)

        await fetchDetail(submissionId)
    }

    const handleReviewSubmit = async () => {

        if (!detail?.id) return

        try {

            setSubmitLoading(true)

            await reviewSubmission(
                detail.id,
                {
                    score_content: scoreContent,
                    score_unity: scoreUnity
                }
            )

            setOpen(false)

            setScoreContent(0)
            setScoreUnity(0)

            refetch()

        } catch (error) {

            console.log(error)

            alert('Failed review submission')

        } finally {

            setSubmitLoading(false)
        }
    }

    return (

        <DashboardLayout>

            <PageTransition>

                <div className="space-y-6">

                    <SubmissionHero
                        total={data?.length || 0}
                    />

                    <SubmissionSearch
                        value={search}
                        onChange={setSearch}
                    />

                    <SubmissionList
                        loading={loading}
                        items={filteredItems}
                        onOpen={handleOpenDetail}
                    />

                </div>

                <SubmissionReviewModal
                    open={open}
                    onClose={() => setOpen(false)}
                    detail={detail}
                    detailLoading={detailLoading}
                    scoreContent={scoreContent}
                    scoreUnity={scoreUnity}
                    setScoreContent={setScoreContent}
                    setScoreUnity={setScoreUnity}
                    onSubmit={handleReviewSubmit}
                    submitLoading={submitLoading}
                />

            </PageTransition>

        </DashboardLayout>

    )
}

export default TeacherSubmission