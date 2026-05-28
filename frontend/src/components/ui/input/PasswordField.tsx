import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

type PasswordFieldProps = {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    shake?: boolean
    maxLength?: number
    autoComplete?: string
    name?: string
}

function PasswordField({
    label,
    value,
    onChange,
    error,
    shake,
    maxLength,
    autoComplete,
    name
}: PasswordFieldProps) {

    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="relative pb-5">

            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>

            <div className="relative">

                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    autoComplete={autoComplete}
                    name={name}
                    className={`
                        w-full rounded-xl border bg-white
                        px-4 py-3 pr-14
                        text-slate-800 outline-none transition
                        focus:border-indigo-500
                        focus:ring-4 focus:ring-indigo-100
                        dark:border-slate-700
                        dark:bg-slate-950
                        dark:text-white
                        dark:focus:ring-indigo-900/40

                        ${error ? 'border-red-500' : 'border-slate-300'}
                        ${shake ? 'shake-input' : ''}
                    `}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                        absolute right-4 top-1/2
                        -translate-y-1/2
                        text-slate-500
                        transition hover:text-indigo-600
                    "
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

            </div>

            <div className="mt-1 flex h-5 items-center justify-between pr-2">

                <p className="text-xs text-red-500">
                    {error || ''}
                </p>

                <p className="text-xs text-slate-400">
                    {maxLength ? `${value.length}/${maxLength}` : ''}
                </p>

            </div>

        </div>
    )
}

export default PasswordField