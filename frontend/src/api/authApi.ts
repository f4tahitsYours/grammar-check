import api from "./axios"

/* REGISTER */
interface RegisterPayload {
    name: string
    email: string
    password: string
    role: string
    class_name?: string
}

export const registerUser = async (
    payload: RegisterPayload
) => {

    const response = await api.post(
        "/auth/register",
        payload
    )

    return response.data
}

/* LOGIN */
interface LoginPayload {
    email: string
    password: string
}

export const loginUser = async (
    payload: LoginPayload
) => {

    const response = await api.post(
        "/auth/login",
        payload
    )

    return response.data
}