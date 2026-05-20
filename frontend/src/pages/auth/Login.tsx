import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { loginUser } from "../../api/authApi"

function Login() {

    const [showPassword, setShowPassword] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [loading, setLoading] = useState(false)

    // SHAKE
    const [shakeEmail, setShakeEmail] = useState(false)
    const [shakePassword, setShakePassword] = useState(false)

    // ERROR
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const navigate = useNavigate()

    // PASSWORD REGEX
    const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_-])[A-Za-z\d@$!%*#?&_-]{8,16}$/

    // SHAKE HELPER
    const triggerShake = (
        setter: React.Dispatch<React.SetStateAction<boolean>>
    ) => {

        setter(false)

        setTimeout(() => {
            setter(true)
        }, 10)

        setTimeout(() => {
            setter(false)
        }, 450)
    }

    // VALIDATION
    const validateForm = () => {

        let isValid = true

        // RESET ERROR
        setEmailError('')
        setPasswordError('')

        // EMAIL
        if (email.trim() === '') {

            setEmailError('This field is required')

            triggerShake(setShakeEmail)

            isValid = false
        }

        // PASSWORD
        if (password.trim() === '') {

            setPasswordError('This field is required')

            triggerShake(setShakePassword)

            isValid = false

        } else if (password.length < 8) {

            setPasswordError('Minimum 8 characters')

            triggerShake(setShakePassword)

            isValid = false

        } else if (!passwordRegex.test(password)) {

            setPasswordError(
                'Must contain letters, numbers, and symbols'
            )

            triggerShake(setShakePassword)

            isValid = false
        }

        return isValid
    }

    const handleLogin = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()

        const valid = validateForm()

        if (!valid) return

        try {

            setLoading(true)

            // LOGIN API
            const data = await loginUser({
                email,
                password
            })

            console.log(data)

            // SIMPAN DATA LOGIN
            localStorage.setItem(
                'access_token',
                data.access_token
            )

            localStorage.setItem(
                'user_role',
                data.role
            )

            localStorage.setItem(
                'user_id',
                data.user_id
            )

            localStorage.setItem(
                'user_name',
                data.name
            )

            localStorage.setItem(
                'user_email',
                data.email
            )

            // SUCCESS POPUP
            await Swal.fire({
                icon: "success",
                title: "Login successful",
                text: "Welcome back",
                confirmButtonColor: "#4f46e5",
                background: "#ffffff",
                timer: 2000,
                showConfirmButton: false,
                backdrop: `
                    rgba(15,23,42,0.45)
                    blur(6px)
                `
            })

            // REDIRECT ROLE
            if (data.role === "admin") {
                navigate('/dashboard/admin/')

            } else if (data.role === "teacher") {
                navigate('/dashboard/teacher/')
            } else {
                navigate('/dashboard/student/')
            }

        } catch (error: any) {

            console.log(error)

            Swal.fire({
                icon: "error",
                title: "Login failed",
                text:
                    error?.response?.data?.detail ||
                    "Invalid email or password",
                confirmButtonColor: "#ef4444",
                backdrop: `
                    rgba(15,23,42,0.45)
                    blur(6px)
                `
            })

        } finally {

            setLoading(false)
        }
    }

    return (

        <div className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">

            {/* CUSTOM SHAKE */}
            <style>
                {`
                    @keyframes inputShake {
                        0% { transform: translateX(0); }
                        20% { transform: translateX(-6px); }
                        40% { transform: translateX(6px); }
                        60% { transform: translateX(-4px); }
                        80% { transform: translateX(4px); }
                        100% { transform: translateX(0); }
                    }

                    .shake-input {
                        animation: inputShake 0.35s ease-in-out;
                    }
                `}
            </style>

            {/* LOADING OVERLAY */}
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">

                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-indigo-600"></div>

                    <p className="mt-4 text-lg font-medium text-white">
                        Signing in...
                    </p>

                </div>
            )}

            {/* CARD */}
            <div
                className={`
                    w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl
                    transition-all duration-300 dark:bg-slate-900

                    ${loading
                        ? "pointer-events-none opacity-70 blur-sm"
                        : ""
                    }
                `}
            >

                {/* HEADER */}
                <div className="mb-8 text-center">

                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Grammar Checker
                    </h1>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Login to your account
                    </p>

                </div>

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">

                    {/* EMAIL */}
                    <div className="relative pb-5">

                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="off"
                            value={email}
                            onChange={(e) => {

                                const value = e.target.value

                                setEmail(value)

                                if (value.trim() !== '') {
                                    setEmailError('')
                                }
                            }}
                            className={`
                                w-full rounded-lg border bg-white px-4 py-3
                                text-slate-800 outline-none transition
                                focus:border-indigo-500
                                focus:ring-4 focus:ring-indigo-100
                                dark:border-slate-700
                                dark:bg-slate-950
                                dark:text-white
                                dark:focus:ring-indigo-900/40

                                ${emailError
                                    ? "border-red-500"
                                    : "border-slate-300"
                                }

                                ${shakeEmail
                                    ? "shake-input"
                                    : ""
                                }
                            `}
                        />

                        {emailError && (
                            <p
                                className="
                                    absolute
                                    bottom-0
                                    left-0
                                    text-xs
                                    text-red-500
                                "
                            >
                                {emailError}
                            </p>
                        )}

                    </div>

                    {/* PASSWORD */}
                    <div className="relative pb-5">

                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Password
                        </label>

                        <div className="relative">

                            <input
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {

                                    const value = e.target.value

                                    setPassword(value)

                                    // EMPTY
                                    if (value.trim() === '') {

                                        setPasswordError('This field is required')
                                    }

                                    // MIN CHAR
                                    else if (value.length < 8) {

                                        setPasswordError('Minimum 8 characters')
                                    }

                                    // REGEX
                                    else if (!passwordRegex.test(value)) {

                                        setPasswordError(
                                            'Must contain letters, numbers, and symbols'
                                        )
                                    }

                                    // VALID
                                    else {

                                        setPasswordError('')
                                    }
                                }}
                                maxLength={16}
                                className={`
                                    w-full rounded-lg border bg-white px-4 py-3 pr-14
                                    text-slate-800 outline-none transition
                                    focus:border-indigo-500
                                    focus:ring-4 focus:ring-indigo-100
                                    dark:border-slate-700
                                    dark:bg-slate-950
                                    dark:text-white
                                    dark:focus:ring-indigo-900/40

                                    ${passwordError
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }

                                    ${shakePassword
                                        ? "shake-input"
                                        : ""
                                    }
                                `}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="
                                    absolute
                                    right-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-500
                                    transition
                                    hover:text-indigo-600
                                "
                            >
                                {showPassword
                                    ? <EyeOff size={18} />
                                    : <Eye size={18} />
                                }
                            </button>

                        </div>

                        {/* ERROR + COUNTER */}
                        <div className="mt-1 flex h-5 items-center justify-between pr-2.5">

                            <p className="text-xs text-red-500">
                                {passwordError || ""}
                            </p>

                            <p className="pr-1 text-xs text-slate-400">
                                {password.length}/16
                            </p>

                        </div>

                    </div>

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full rounded-lg bg-indigo-600 py-3
                            font-semibold text-white transition
                            duration-200 hover:bg-indigo-700
                            disabled:cursor-not-allowed
                            disabled:opacity-70
                        "
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>

                    {/* REGISTER */}
                    <div className="text-center">

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Don't have an account?{" "}

                            <Link
                                to="/register"
                                className="
                                    font-medium text-indigo-600
                                    transition hover:text-indigo-700
                                "
                            >
                                Register
                            </Link>

                        </p>

                    </div>

                </form>

            </div>

        </div>
    )
}

export default Login