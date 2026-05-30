import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { loginUser } from '../../api/service/auth/authApi'
import { useAuth } from './useAuth'

import {
    passwordRegex,
    triggerShake
} from '../../utils/validation'

export function useLogin() {

    const navigate = useNavigate()
    const { login } = useAuth()

    // FORM
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    // LOADING
    const [loading, setLoading] = useState(false)

    // SHAKE
    const [shakeEmail, setShakeEmail] = useState(false)
    const [shakePassword, setShakePassword] = useState(false)

    // ERROR
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    // VALIDATION
    const validateForm = () => {

        let isValid = true

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

    // LOGIN
    const handleLogin = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()

        const valid = validateForm()

        if (!valid) return

        try {

            setLoading(true)

            const data = await loginUser({
                email,
                password
            })

            // SAVE LOGIN via AuthContext
            login({
                user_id: data.user_id,
                email: data.email,
                name: data.name,
                role: data.role,
                access_token: data.access_token
            })

            // SUCCESS
            await Swal.fire({
                icon: 'success',
                title: 'Login successful',
                text: 'Welcome back',
                confirmButtonColor: '#4f46e5',
                timer: 2000,
                showConfirmButton: false
            })

            // REDIRECT
            if (data.role === 'admin') {

                navigate('/dashboard/admin/')

            } else if (data.role === 'teacher') {

                navigate('/dashboard/teacher/')

            } else {

                navigate('/dashboard/student/')
            }

        } catch (error: any) {

            Swal.fire({
                icon: 'error',
                title: 'Login failed',
                text:
                    error?.response?.data?.detail ||
                    'Invalid email or password',
                confirmButtonColor: '#ef4444'
            })

        } finally {

            setLoading(false)
        }
    }

    return {

        // FORM
        email,
        setEmail,
        password,
        setPassword,

        // ERROR
        emailError,
        passwordError,

        // SHAKE
        shakeEmail,
        shakePassword,

        // LOADING
        loading,

        // ACTION
        handleLogin,
        setEmailError,
        setPasswordError
    }
}