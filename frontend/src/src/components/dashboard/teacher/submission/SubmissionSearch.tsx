import {
    Search
} from 'lucide-react'

interface Props {
    value: string
    onChange: (value: string) => void
}

function SubmissionSearch({
    value,
    onChange
}: Props) {

    return (

        <div
            className="
                rounded-2xl
                bg-white
                p-4
                shadow-sm
                dark:bg-slate-900
                sm:p-5
            "
        >

            <div className="relative">

                <Search
                    size={18}
                    className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                    "
                />

                <input
                    type="text"
                    placeholder="Search student..."
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        py-3
                        pl-11
                        pr-4
                        text-sm
                        outline-none
                        transition-all
                        focus:border-amber-500
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-white
                    "
                />

            </div>

        </div>
    )
}

export default SubmissionSearch