type Props = {
    grammarWeight: number
    mechanicsWeight: number
    contentWeight: number
    unityWeight: number

    setGrammarWeight: (value: number) => void
    setMechanicsWeight: (value: number) => void
    setContentWeight: (value: number) => void
    setUnityWeight: (value: number) => void
}

function RubricInput({
    grammarWeight,
    mechanicsWeight,
    contentWeight,
    unityWeight,

    setGrammarWeight,
    setMechanicsWeight,
    setContentWeight,
    setUnityWeight
}: Props) {

    const rubricItems = [
        {
            label: 'Grammar',
            value: grammarWeight,
            setter: setGrammarWeight
        },
        {
            label: 'Mechanics',
            value: mechanicsWeight,
            setter: setMechanicsWeight
        },
        {
            label: 'Content',
            value: contentWeight,
            setter: setContentWeight
        },
        {
            label: 'Unity',
            value: unityWeight,
            setter: setUnityWeight
        }
    ]

    return (

        <div>

            <div
                className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-5

                    dark:border-slate-800
                    dark:bg-slate-800/40
                "
            >

                <div>

                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Writing Rubric
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Set writing assessment weight values.
                    </p>

                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    {rubricItems.map((item) => (

                        <div key={item.label}>

                            <label className="text-sm text-slate-500 dark:text-slate-400">
                                {item.label}
                            </label>

                            <input
                                type="number"
                                min={0}
                                max={5}
                                value={item.value}
                                onChange={(e) =>
                                    item.setter(
                                        Math.min(
                                            5,
                                            Math.max(
                                                0,
                                                Number(e.target.value)
                                            )
                                        )
                                    )
                                }
                                className="
                                    mt-2
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    transition-all

                                    focus:border-indigo-500
                                    focus:ring-4
                                    focus:ring-indigo-100

                                    dark:border-slate-700
                                    dark:bg-slate-900
                                    dark:text-white
                                    dark:focus:ring-indigo-500/20
                                "
                            />

                        </div>

                    ))}

                </div>

                {/* INFO */}
                <div
                    className="
                        mt-5
                        rounded-2xl
                        bg-indigo-50
                        p-4
                        dark:bg-indigo-500/10
                    "
                >

                    <p
                        className="
                            text-sm
                            leading-relaxed
                            text-indigo-700
                            dark:text-indigo-300
                        "
                    >
                        Rubric values are flexible and can start from 0
                        depending on your assessment preference.
                    </p>

                </div>

            </div>

        </div>
    )
}

export default RubricInput