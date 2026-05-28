interface Props {
    open: boolean
    onClose: () => void
    detail: any
    loading: boolean
}

function SubmissionDetailModal({
    open,
    onClose,
    detail,
    loading
}: Props) {

    return (
        <div
            className={`
                fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4
                transition-all duration-300
                ${open
                    ? 'pointer-events-auto bg-black/50 opacity-100'
                    : 'pointer-events-none bg-black/0 opacity-0'}
            `}
        >

            <div
                className={`
                    max-h-[90vh]
                    w-full
                    max-w-3xl
                    overflow-y-auto
                    rounded-2xl
                    bg-white
                    p-4
                    shadow-2xl
                    dark:bg-slate-900
                    sm:p-6
                `}
            >

                <button
                    onClick={onClose}
                    className="mb-4 text-sm text-red-500"
                >
                    Close
                </button>

                {loading && (
                    <p>Loading...</p>
                )}

                {!loading && detail && (
                    <div className="space-y-4">

                        <div>

                            <h3 className="font-semibold">
                                Original Text
                            </h3>

                            <p>
                                {detail.original_text}
                            </p>

                        </div>

                        <div>

                            <h3 className="font-semibold">
                                Corrected Text
                            </h3>

                            <p>
                                {detail.corrected_text}
                            </p>

                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}

export default SubmissionDetailModal