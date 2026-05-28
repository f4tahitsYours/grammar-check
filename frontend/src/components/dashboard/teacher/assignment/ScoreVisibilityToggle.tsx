type Props = {
    showScore: boolean
    setShowScore: (value: boolean) => void
}

function ScoreVisibilityToggle({
    showScore,
    setShowScore
}: Props) {

    return (

        <div>

            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Score Visibility
            </label>

            <div
                className="
                    mt-2
                    flex items-center justify-between
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    px-4 py-3
                    dark:border-slate-700
                    dark:bg-slate-800
                "
            >

                <span className="text-sm text-slate-600 dark:text-slate-300">
                    Show the score to the student
                </span>
                

                <button
                    type="button"
                    onClick={() =>
                        setShowScore(!showScore)
                    }
                    className={`
                        relative inline-flex
                        h-7 w-12
                        items-center
                        rounded-full
                        transition-colors

                        ${showScore
                            ? 'bg-indigo-600'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }
                    `}
                >

                    <span
                        className={`
                            inline-block
                            h-5 w-5
                            transform
                            rounded-full
                            bg-white
                            transition-transform

                            ${showScore
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }
                        `}
                    />

                </button>


            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {showScore 
                    ? 'Students can view their scores' 
                    : 'Scores are hidden from students'}                
            </p>

        </div>
    )
}

export default ScoreVisibilityToggle