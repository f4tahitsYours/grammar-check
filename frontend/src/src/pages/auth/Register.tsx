import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

import InputField from '../../components/ui/input/InputField'
import PasswordField from '../../components/ui/input/PasswordField'
import PrimaryButton from '../../components/ui/button/PrimaryButton'

import { useRegister } from '../../hooks/auth/useRegister'

function Register() {

    const {

        // FORM
        name,
        setName,

        email,
        setEmail,

        className,
        setClassName,

        password,
        setPassword,

        role,
        setRole,

        // ERROR
        nameError,
        emailError,
        classError,
        passwordError,

        // SHAKE
        shakeName,
        shakeEmail,
        shakeClass,
        shakePassword,

        // LOADING
        loading,

        // ACTION
        handleRegister,

        setNameError,
        setEmailError,
        setClassError,
        setPasswordError

    } = useRegister()

    return (

        <div className="relative flex min-h-screen items-center justify-center bg-slate-100 px-6 py-8 dark:bg-slate-950">

            {/* LOADING */}
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">

                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-indigo-600"></div>

                    <p className="mt-4 text-lg font-medium text-white">
                        Registering account...
                    </p>

                </div>
            )}

            {/* CARD */}
            <div
                className={`
                    grid w-full max-w-4xl overflow-hidden rounded-3xl
                    bg-white shadow-2xl dark:bg-slate-900
                    lg:grid-cols-[1.2fr_0.8fr]
                    transition-all duration-300

                    ${loading
                        ? 'blur-sm opacity-70 pointer-events-none'
                        : ''
                    }
                `}
            >

                {/* LEFT */}
                <div className="p-4 md:p-6">

                    {/* HEADER */}
                    <div className="mb-4">

                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                            Create Account
                        </h1>

                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Register to continue
                        </p>

                    </div>

                    {/* FORM */}
                    <form
                        onSubmit={handleRegister}
                        className="space-y-3"
                        autoComplete="off"
                    >

                        {/* NAME */}
                        <InputField
                            label="Full Name"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => {

                                const value = e.target.value

                                setName(value)

                                if (value.trim() !== '') {
                                    setNameError('')
                                }
                            }}
                            error={nameError}
                            shake={shakeName}
                        />

                        {/* EMAIL */}
                        <InputField
                            label="Email"
                            type="email"
                            autoComplete="off"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {

                                const value = e.target.value

                                setEmail(value)

                                if (value.trim() !== '') {
                                    setEmailError('')
                                }
                            }}
                            error={emailError}
                            shake={shakeEmail}
                        />

                        {/* ROW */}
                        <div className="grid gap-4 md:grid-cols-2">

                            {/* ROLE */}
                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Role
                                </label>

                                <div className="relative">

                                    <select
                                        value={role}
                                        onChange={(e) =>
                                            setRole(e.target.value)
                                        }
                                        className="
                                            w-full appearance-none rounded-xl
                                            border border-slate-300 bg-white
                                            px-4 py-3 pr-11 text-slate-800
                                            outline-none transition
                                            focus:border-indigo-500
                                            focus:ring-4 focus:ring-indigo-100
                                            dark:border-slate-700
                                            dark:bg-slate-950
                                            dark:text-white
                                            dark:focus:ring-indigo-900/40
                                        "
                                    >
                                        <option value="student">
                                            Student
                                        </option>

                                        <option value="teacher">
                                            Teacher
                                        </option>

                                        {/* <option value="admin">
                                            Admin
                                        </option> */}

                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500">

                                        <ChevronDown size={18} />

                                    </div>

                                </div>

                            </div>

                            {/* CLASS */}
                            <InputField
                                label="Class"
                                placeholder="Example: 7A"
                                value={className}
                                onChange={(e) => {

                                    const value = e.target.value

                                    setClassName(value)

                                    if (value.trim() !== '') {
                                        setClassError('')
                                    }
                                }}
                                error={classError}
                                shake={shakeClass}
                            />

                        </div>

                        {/* PASSWORD */}
                        <PasswordField
                            label="Password"
                            value={password}
                            autoComplete="new-password"
                            onChange={(e) => {

                                const value = e.target.value

                                setPassword(value)

                                if (value.trim() === '') {

                                    setPasswordError(
                                        'This field is required'
                                    )

                                } else {

                                    setPasswordError('')
                                }
                            }}
                            error={passwordError}
                            shake={shakePassword}
                            maxLength={16}
                        />

                        {/* BUTTON */}
                        <PrimaryButton
                            type="submit"
                            text="Register"
                            loading={loading}
                        />

                        {/* LOGIN */}
                        <div className="text-center">

                            <p className="text-sm text-slate-500 dark:text-slate-400">

                                Already have an account?{' '}

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

                {/* RIGHT */}
                <div className="hidden items-center justify-center bg-indigo-600 p-8 lg:flex">

                    <div className="px-10 text-center text-white">

                        <h2 className="mb-4 text-4xl font-bold">
                            JenggalaTalks
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