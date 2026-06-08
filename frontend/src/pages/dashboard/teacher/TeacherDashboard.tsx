import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageTransition from '../../../components/common/PageTransition'
import { useTeacherDashboard } from '../../../hooks/teacher/useTeacherDashboard'
import { useSubmissionDetail } from '../../../hooks/teacher/useSubmissionDetail'
import TeacherHero from '../../../components/dashboard/teacher/dashboard/TeacherHero'
import TeacherStats from '../../../components/dashboard/teacher/dashboard/TeacherStats'
import RecentSubmissionList from '../../../components/dashboard/teacher/dashboard/RecentSubmissionList'
import QuickActions from '../../../components/dashboard/teacher/dashboard/QuickActions'
import UpcomingDeadline from '../../../components/dashboard/teacher/dashboard/UpcomingDeadline'
import SubmissionReviewModal
from '../../../components/dashboard/teacher/submission/SubmissionReviewModal'

function TeacherDashboard() {

    const navigate = useNavigate()

    const [open, setOpen] =
        useState(false)

    const {
        data,
        loading
    } = useTeacherDashboard()

    const {
        data: detail,
        loading: detailLoading,
        fetchDetail
    } = useSubmissionDetail()

    const teacherName =
        localStorage.getItem('user_name') || 'Teacher'

    const averageScore = useMemo(() => {

        if (!data?.items?.length) return 0

        const total =
            data.items.reduce(
                (acc, item) => acc + item.score,
                0
            )

        return Math.round(
            total / data.items.length
        )

    }, [data])

    const handleOpenDetail = async (
        submissionId: string
    ) => {

        setOpen(true)

        await fetchDetail(submissionId)
    }

    return (
        <DashboardLayout>

            <PageTransition>

                <div className="space-y-5 sm:space-y-6">

                    <TeacherHero
                        teacherName={teacherName}
                    />

                    <TeacherStats
                        totalStudents={
                            data?.total_students || 0
                        }
                        activeAssignments={
                            data?.active_assignments || 0
                        }
                        totalSubmissions={
                            data?.items?.length || 0
                        }
                        averageScore={averageScore}
                    />

                    <div
                        className="
                            grid
                            gap-6
                            items-start
                            xl:grid-cols-[minmax(0,1fr)_320px]
                        "
                    >

                        <RecentSubmissionList
                            loading={loading}
                            items={data?.items || []}
                            onReview={handleOpenDetail}
                            onViewAll={() =>
                                navigate(
                                    '/dashboard/teacher/history/'
                                )
                            }
                        />

                        <div className="flex flex-col gap-4">

                            <QuickActions />

                            <UpcomingDeadline />

                        </div>

                    </div>

                </div>

                <SubmissionReviewModal
                    open={open}
                    onClose={() => setOpen(false)}
                    detail={detail}
                    detailLoading={detailLoading}

                    scoreContent={
                        detail?.score_content ?? 0
                    }

                    scoreUnity={
                        detail?.score_unity ?? 0
                    }

                    setScoreContent={() => { }}
                    setScoreUnity={() => { }}

                    onSubmit={() => { }}

                    submitLoading={false}
                />

            </PageTransition>

        </DashboardLayout>
    )
}

export default TeacherDashboard