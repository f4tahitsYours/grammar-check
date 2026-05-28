import React from 'react'

type InputFieldProps = {
    label: string
    type?: string
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    shake?: boolean
    maxLength?: number
    autoComplete?: string
    name?: string
}

function InputField({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    shake,
    maxLength,
    autoComplete,
    name
}: InputFieldProps) {

    return (
        <div className="relative pb-5">

            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                autoComplete={autoComplete}
                name={name}
                className={`
                    w-full rounded-xl border bg-white px-4 py-3
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

            {error && (
                <p className="absolute bottom-0 left-0 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}

export default InputField