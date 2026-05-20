import PageTransition from '../../../../components/common/PageTransition'
import DashboardLayout from '../../../../components/layout/DashboardLayout'

function StudentSubmission() {

    return (
        <DashboardLayout>
            <PageTransition>
                <div className="rounded-2xl bg-white p-6 dark:bg-slate-900">

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                        Student Submission
                    </h1>

                </div>
            </PageTransition>

        </DashboardLayout>
    )
}

export default StudentSubmission