import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { registerUser } from '../../api/service/auth/authApi'

import {
    passwordRegex,
    triggerShake
} from '../../utils/validation'

export function useRegister() {

    const navigate = useNavigate()

    // FORM
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [className, setClassName] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('student')

    // LOADING
    const [loading, setLoading] = useState(false)

    // SHAKE
    const [shakeName, setShakeName] = useState(false)
    const [shakeEmail, setShakeEmail] = useState(false)
    const [shakeClass, setShakeClass] = useState(false)
    const [shakePassword, setShakePassword] = useState(false)

    // ERROR
    const [nameError, setNameError] = useState('')
    const [emailError, setEmailError] = useState('')
    const [classError, setClassError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    // VALIDATION
    const validateForm = () => {

        let isValid = true

        setNameError('')
        setEmailError('')
        setClassError('')
        setPasswordError('')

        // NAME
        if (name.trim() === '') {

            setNameError('This field is required')

            triggerShake(setShakeName)

            isValid = false
        }

        // EMAIL
        if (email.trim() === '') {

            setEmailError('This field is required')

            triggerShake(setShakeEmail)

            isValid = false
        }

        // CLASS
        if (className.trim() === '') {

            setClassError('This field is required')

            triggerShake(setShakeClass)

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

    // REGISTER
    const handleRegister = async (
        e: React.FormEvent
    ) => {

        e.preventDefault()

        const valid = validateForm()

        if (!valid) return

        try {

            setLoading(true)

            await registerUser({
                name,
                email,
                password,
                role,
                class_name: className
            })

            // SUCCESS
            await Swal.fire({
                icon: 'success',
                title: 'Registration successful',
                text: 'Your account has been created',
                confirmButtonColor: '#4f46e5',
                timer: 2000,
                showConfirmButton: false
            })

            // RESET FORM
            setName('')
            setEmail('')
            setClassName('')
            setPassword('')
            setRole('student')
            setNameError('')
            setEmailError('')
            setClassError('')
            setPasswordError('')
            navigate('/login')

        } catch (error: any) {

            Swal.fire({
                icon: 'error',
                title: 'Registration failed',
                text:
                    error?.response?.data?.detail ||
                    'Something went wrong',
                confirmButtonColor: '#ef4444'
            })

        } finally {

            setLoading(false)
        }
    }

    return {

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
    }
}