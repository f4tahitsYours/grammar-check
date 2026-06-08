import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Shield, Loader2, Eye, EyeOff } from 'lucide-react'
import Swal from 'sweetalert2'

import { loginUser } from '../../api/authApi'
import { useAuth } from '../../hooks/auth/useAuth'
import { passwordRegex } from '../../utils/validation'

function AdminLogin() {

    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [loading, setLoading] = useState(false)

    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const [shakeEmail, setShakeEmail] = useState(false)
    const [shakePassword, setShakePassword] = useState(false)

    const validateEmail = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
    }

    const triggerShake = (setter: any) => {
        setter(true)
        setTimeout(() => setter(false), 400)
    }

    // ❌ VALIDASI: hanya shake + inline error (NO POPUP)
    const validateForm = () => {

        let valid = true

        setEmailError('')
        setPasswordError('')

        if (!email.trim()) {
            setEmailError('Email is required')
            triggerShake(setShakeEmail)
            valid = false
        } else if (!validateEmail(email)) {
            setEmailError('Invalid email format')
            triggerShake(setShakeEmail)
            valid = false
        }

        if (!password.trim()) {
            setPasswordError('Password is required')
            triggerShake(setShakePassword)
            valid = false
        } else if (password.length < 8) {
            setPasswordError('Minimum 8 characters required')
            triggerShake(setShakePassword)
            valid = false
        } else if (!passwordRegex.test(password)) {
            setPasswordError('Must include letters, numbers & symbol')
            triggerShake(setShakePassword)
            valid = false
        }

        return valid
    }

    // 🔥 POPUP ONLY FOR AUTH RESULT
    const showError = (msg: string) => {
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: msg,
            confirmButtonColor: '#4f46e5'
        })
    }

    const showSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: 'Welcome Admin',
            text: 'Login successful',
            timer: 1500,
            showConfirmButton: false
        })
    }

    const handleLogin = async () => {

        if (!validateForm()) return

        try {

            setLoading(true)

            const res = await loginUser({ email, password })
            const data = res?.data || res

            console.log("LOGIN RESPONSE:", res)

            // FIX: mapping response aman
            const user = {
                user_id: data.user_id,
                email: email,
                name: data.name,
                role: data.role
            }

            const token = data.access_token

            // ❗ FIX 1: pastikan loading berhenti sebelum return
            if (!user.user_id || !token) {
                await showError('Invalid response dari server')
                setLoading(false)
                return
            }

            // ❗ FIX 2: role check admin ONLY + STOP flow
            if (user.role !== 'admin') {
                await showError('Access denied. Admin only.')
                setLoading(false)
                return
            }

            login({
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
                access_token: token
            })

            await showSuccess()

            navigate('/dashboard/admin/', { replace: true })

        } catch (err: any) {

            console.log("LOGIN ERROR:", err)

            await showError(
                err?.response?.data?.message ||
                'Login gagal, silakan coba lagi'
            )

        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl">

                {/* HEADER */}
                <div className="text-center mb-6">

                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Shield size={22} />
                    </div>

                    <h1 className="text-xl font-bold text-white">
                        Admin Portal
                    </h1>

                    <p className="text-xs text-slate-400 mt-1">
                        Secure access for administrators only
                    </p>

                </div>

                {/* EMAIL */}
                <div className="mb-3">

                    <label className="text-sm text-slate-300">
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`
                            mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none text-sm
                            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20
                            ${shakeEmail ? 'animate-shake' : ''}
                        `}
                    />

                    <div className="h-4 mt-1">
                        {emailError && (
                            <p className="text-xs text-red-400">{emailError}</p>
                        )}
                    </div>

                </div>

                {/* PASSWORD */}
                <div className="mb-2">

                    <label className="text-sm text-slate-300">
                        Password
                    </label>

                    <div className="relative mt-1">

                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className={`
                                w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 pr-12 text-white outline-none text-sm
                                focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20
                                ${shakePassword ? 'animate-shake' : ''}
                            `}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                    </div>

                    <div className="mt-1 flex items-center justify-between h-4 text-xs">

                        <span className="text-red-400">
                            {passwordError || ''}
                        </span>

                        <span className="text-slate-500 pr-2">
                            {password.length}/16
                        </span>

                    </div>

                </div>

                {/* BUTTON */}
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-white text-sm font-semibold transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60 mt-8"
                >

                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <LogIn size={16} />
                            Sign in as Admin
                        </>
                    )}

                </button>

            </div>

            {/* SHAKE ANIMATION */}
            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)}
                    20%{transform:translateX(-5px)}
                    40%{transform:translateX(5px)}
                    60%{transform:translateX(-3px)}
                    80%{transform:translateX(3px)}
                }

                .animate-shake {
                    animation: shake 0.35s ease-in-out;
                }
            `}</style>

        </div>
    )
}

export default AdminLogin