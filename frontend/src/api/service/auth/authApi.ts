import api from "../../axios"
import type { RegisterPayload } from "../../interface/registerPayload"
import type { LoginPayload } from "../../interface/LoginPayload"

export const registerUser = async (
    payload: RegisterPayload
) => {

    const response = await api.post(
        "/auth/register",
        payload
    )

    return response.data
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