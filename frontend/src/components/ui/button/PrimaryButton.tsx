type PrimaryButtonProps = {
    text: string
    loading?: boolean
    type?: 'button' | 'submit'
}

function PrimaryButton({
    text,
    loading,
    type = 'button'
}: PrimaryButtonProps) {

    return (

        <button
            type={type}
            disabled={loading}
            className="
                w-full rounded-xl bg-indigo-600 py-3
                font-semibold text-white transition
                duration-200 hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-70
            "
        >
            {loading ? 'Loading...' : text}
        </button>
    )
}

export default PrimaryButton