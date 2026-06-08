import React, { Component, type ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.state = {
            hasError: false
        }
    }

    static getDerivedStateFromError() {

        return {
            hasError: true
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {

        console.error(
            'Application Error:',
            error,
            errorInfo
        )
    }

    render() {

        if (this.state.hasError) {

            return (

                <div
                    className="
                        flex
                        min-h-screen
                        items-center
                        justify-center
                        bg-slate-100
                        px-6
                        dark:bg-slate-950
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-3xl
                            bg-white
                            p-8
                            text-center
                            shadow-lg
                            dark:bg-slate-900
                        "
                    >

                        <h1
                            className="
                                text-2xl
                                font-bold
                                text-slate-800
                                dark:text-white
                            "
                        >
                            Something went wrong
                        </h1>

                        <p
                            className="
                                mt-3
                                text-sm
                                text-slate-500
                                dark:text-slate-400
                            "
                        >
                            An unexpected error occurred.
                            Please refresh the page.
                        </p>

                        <button
                            onClick={() =>
                                window.location.reload()
                            }
                            className="
                                mt-6
                                rounded-xl
                                bg-indigo-600
                                px-5
                                py-3
                                text-white
                                transition
                                hover:bg-indigo-700
                            "
                        >
                            Refresh Page
                        </button>

                    </div>

                </div>

            )
        }

        return this.props.children
    }
}

export default ErrorBoundary