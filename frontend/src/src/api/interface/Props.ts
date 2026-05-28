import type { User } from "../interface/User"

export interface Props {
    users: User[]
    loading: boolean

    search: string
    setSearch: (value: string) => void

    role: string
    setRole: (value: string) => void
    readonly?: boolean
    onChangeRole: (
        userId: string,
        role: string
    ) => void

    onDelete: (
        userId: string
    ) => void
}