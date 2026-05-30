/**
 * Token store for axios interceptor
 * Provides a way to access token outside React context
 */

let _token: string | null = null

export const setToken = (token: string | null): void => {
    _token = token
}

export const getToken = (): string | null => {
    return _token
}
