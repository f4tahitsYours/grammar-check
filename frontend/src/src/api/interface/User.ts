export interface User {

    id: string

    email: string
    name: string

    role: string

    class_name?: string | null

    school_id?: string | null
    school_name?: string | null

    is_active: boolean

    created_at?: string
}