/* REGISTER */
export interface RegisterPayload {
    name: string
    email: string
    password: string
    role: string
    class_name?: string
}