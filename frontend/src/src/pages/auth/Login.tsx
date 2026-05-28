import { Link } from 'react-router-dom'

import InputField from '../../components/ui/input/InputField'
import PasswordField from '../../components/ui/input/PasswordField'
import PrimaryButton from '../../components/ui/button/PrimaryButton'

import { useLogin } from '../../hooks/auth/useLogin'

function Login() {

    const {

        email,
        setEmail,

        password,
        setPassword,

        emailError,
        passwordError,

        shakeEmail,
        shakePassword,

        loading,

        handleLogin,

        setEmailError,
        setPasswordError

    } = useLogin()

    return (

        <div className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">

            {/* LOADING */}
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">

                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-indigo-600"></div>

                    <p className="mt-4 text-lg font-medium text-white">
                        Signing in...
                    </p>

                </div>
            )}

            {/* CARD */}
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">

                {/* HEADER */}
                <div className="mb-8 text-center">

                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        JenggalaTalks
                    </h1>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Login to your account
                    </p>

                </div>

                {/* FORM */}
                <form
                    onSubmit={handleLogin}
                    className="space-y-4"
                >

                    <InputField
                        label="Email"
                        type="email"
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

                    <PasswordField
                        label="Password"
                        value={password}
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

                    <PrimaryButton
                        type="submit"
                        text="Login"
                        loading={loading}
                    />

                    <div className="text-center">

                        <p className="text-sm text-slate-500 dark:text-slate-400">

                            Don't have an account?{' '}

                            <Link
                                to="/register"
                                className="font-medium text-indigo-600 hover:text-indigo-700"
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