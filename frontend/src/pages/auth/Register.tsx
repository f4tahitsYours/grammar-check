import { useState } from "react"
import { Eye, EyeOff, ChevronDown } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../../api/authApi"
import Swal from "sweetalert2"

function Register() {

    const [showPassword, setShowPassword] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [className, setClassName] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("student")
    const [loading, setLoading] = useState(false)

    // SHAKE
    const [shakeName, setShakeName] = useState(false)
    const [shakeEmail, setShakeEmail] = useState(false)
    const [shakeClass, setShakeClass] = useState(false)
    const [shakePassword, setShakePassword] = useState(false)

    // ERROR
    const [nameError, setNameError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [classError, setClassError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const navigate = useNavigate()
    const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_\-])[A-Za-z\d@$!%*#?&_\-]{8,16}$/

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

    // VALIDASI
    const validateForm = () => {

        let isValid = true

        // RESET ERROR
        setNameError("")
        setEmailError("")
        setClassError("")
        setPasswordError("")

        // NAME
        if (name.trim() === "") {

            setNameError("This field is required")

            triggerShake(setShakeName)

            isValid = false
        }

        // EMAIL
        if (email.trim() === "") {

            setEmailError("This field is required")

            triggerShake(setShakeEmail)

            isValid = false
        }

        // CLASS
        if (className.trim() === "") {

            setClassError("This field is required")

            triggerShake(setShakeClass)

            isValid = false
        }

        // PASSWORD
        if (password.trim() === "") {

            setPasswordError("This field is required")

            triggerShake(setShakePassword)

            isValid = false

        } else if (password.length < 8) {

            setPasswordError("Minimum 8 characters")

            triggerShake(setShakePassword)

            isValid = false

        } else if (!passwordRegex.test(password)) {

            setPasswordError(
                "Must contain letters, numbers, and symbols"
            )

            triggerShake(setShakePassword)

            isValid = false
        }

        return isValid
    }

    const handleRegister = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()

        const valid = validateForm()

        if (!valid) return

        try {

            setLoading(true)

            const data = await registerUser({
                name,
                email,
                password,
                role,
                class_name: className
            })

            console.log(data)

            await Swal.fire({
                icon: "success",
                title: "Registration successful",
                text: "Your account has been created",
                confirmButtonColor: "#4f46e5",
                background: "#ffffff",
                timer: 2000,
                showConfirmButton: false,
                backdrop: `
                    rgba(15,23,42,0.45)
                    blur(6px)
                `
            })

            navigate("/")

        } catch (error: any) {

            console.log(error)

            Swal.fire({
                icon: "error",
                title: "Registration failed",
                text:
                    error?.response?.data?.detail ||
                    "Something went wrong",
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

        <div className="relative flex min-h-screen items-center justify-center bg-slate-100 px-6 py-8 dark:bg-slate-950">

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
                        Registering account...
                    </p>

                </div>
            )}

            <div
                className={`
                    grid w-full max-w-4xl overflow-hidden rounded-3xl
                    bg-white shadow-2xl dark:bg-slate-900
                    lg:grid-cols-[1.2fr_0.8fr]
                    transition-all duration-300

                    ${loading ? "blur-sm opacity-70 pointer-events-none" : ""}
                `}
            >

                {/* LEFT SIDE - FORM */}
                <div className="p-4 md:p-6">

                    {/* Header */}
                    <div className="mb-4">

                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                            Create Account
                        </h1>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Register to continue
                        </p>

                    </div>

                    {/* FORM */}
                    <form onSubmit={handleRegister} className="space-y-3">

                        {/* Full Name */}
                        <div className="relative pb-5">

                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`
                                    w-full rounded-lg border px-4 py-3
                                    text-slate-800 outline-none transition
                                    focus:border-indigo-500 focus:ring-4
                                    focus:ring-indigo-100
                                    dark:bg-slate-950 dark:text-white
                                    dark:border-slate-700
                                    dark:focus:ring-indigo-900/40

                                    ${nameError
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }

                                    ${shakeName ? "shake-input" : ""}
                                `}
                            />

                            {nameError && (
                                <p
                                    className="
                                        absolute
                                        bottom-0
                                        left-0
                                        text-xs
                                        text-red-500
                                    "
                                >
                                    {nameError}
                                </p>
                            )}

                        </div>

                        {/* Email */}
                        <div className="relative pb-5">

                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                className={`
                                    w-full rounded-lg border px-4 py-3
                                    text-slate-800 outline-none transition
                                    focus:border-indigo-500 focus:ring-4
                                    focus:ring-indigo-100
                                    dark:bg-slate-950 dark:text-white
                                    dark:border-slate-700
                                    dark:focus:ring-indigo-900/40

                                    ${emailError
                                        ? "border-red-500"
                                        : "border-slate-300"
                                    }

                                    ${shakeEmail ? "shake-input" : ""}
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

                        {/* ROW 2 */}
                        <div className="grid gap-4 md:grid-cols-2">

                            {/* Role */}
                            <div className="relative pb-5">

                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Role
                                </label>

                                <div className="relative">

                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="
                                            w-full appearance-none rounded-lg
                                            border border-slate-300 bg-white
                                            px-4 py-3 pr-11 text-slate-800
                                            outline-none transition
                                            focus:border-indigo-500
                                            focus:ring-4 focus:ring-indigo-100
                                            dark:border-slate-700
                                            dark:bg-slate-950 dark:text-white
                                            dark:focus:ring-indigo-900/40
                                        "
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">
                                        <ChevronDown size={18} />
                                    </div>

                                </div>

                            </div>

                            {/* Class */}
                            <div className="relative pb-5">

                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Class
                                </label>

                                <input
                                    type="text"
                                    placeholder="Example: 7A"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className={`
                                        w-full rounded-lg border px-4 py-3
                                        text-slate-800 outline-none transition
                                        focus:border-indigo-500 focus:ring-4
                                        focus:ring-indigo-100
                                        dark:bg-slate-950 dark:text-white
                                        dark:border-slate-700
                                        dark:focus:ring-indigo-900/40

                                        ${classError
                                            ? "border-red-500"
                                            : "border-slate-300"
                                        }

                                        ${shakeClass ? "shake-input" : ""}
                                    `}
                                />

                                {classError && (
                                    <p
                                        className="
                                            absolute
                                            bottom-0
                                            left-0
                                            text-xs
                                            text-red-500
                                        "
                                    >
                                        {classError}
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* PASSWORD */}
                        <div className="relative pb-5">

                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    autoComplete="new-password"
                                    onChange={(e) => {

                                        const value = e.target.value

                                        setPassword(value)

                                        // EMPTY
                                        if (value.trim() === "") {

                                            setPasswordError("This field is required")

                                        }

                                        // LESS THAN 8
                                        else if (value.length < 8) {

                                            setPasswordError("Minimum 8 characters")

                                        }

                                        // VALID LENGTH
                                        else {

                                            setPasswordError("")
                                        }
                                    }}

                                    maxLength={16}
                                    className={`
                                        w-full rounded-lg border px-4 py-3
                                        text-slate-800 outline-none transition
                                        focus:border-indigo-500 focus:ring-4
                                        focus:ring-indigo-100
                                        dark:bg-slate-950 dark:text-white
                                        dark:border-slate-700
                                        dark:focus:ring-indigo-900/403

                                        ${passwordError
                                            ? "border-red-500"
                                            : "border-slate-300"
                                        }

                                        ${shakePassword ? "shake-input" : ""}
                                    `}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="
                                        absolute right-4 top-1/2
                                        -translate-y-1/2 text-slate-500
                                        transition hover:text-indigo-600
                                    "
                                >
                                    {showPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>

                            </div>
                            
                            {/* ERROR + COUNTER */}
                            <div className="pr-2.5 mt-1 flex h-5 items-center justify-between">

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
                            {loading ? "Loading..." : "Register"}
                        </button>

                        {/* LOGIN */}
                        <div className="text-center">

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Already have an account?{" "}

                                <Link
                                    to="/login"
                                    className="
                                        font-medium text-indigo-600
                                        transition hover:text-indigo-700
                                    "
                                >
                                    Login
                                </Link>

                            </p>

                        </div>

                    </form>

                </div>

                {/* RIGHT SIDE */}
                <div className="hidden items-center justify-center bg-indigo-600 p-8 lg:flex">

                    <div className="px-10 text-center text-white">

                        <h2 className="mb-4 text-4xl font-bold">
                            Grammar Checker
                        </h2>

                        <p className="text-lg text-indigo-100">
                            Improve grammar writing skills for students easily
                            and effectively.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Register