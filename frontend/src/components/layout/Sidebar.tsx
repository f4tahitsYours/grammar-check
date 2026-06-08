import {
    X,
    LogOut
} from 'lucide-react'

import { sidebarMenus } from './menuConfig'

import { useState } from 'react'

import {
    useNavigate,
    useLocation
} from 'react-router-dom'

import Swal from 'sweetalert2'
import { useAuth } from '../../hooks/auth/useAuth'

type SidebarProps = {
    open: boolean
    setOpen: (value: boolean) => void
}

function Sidebar({ open, setOpen }: SidebarProps) {

    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    // ROLE USER
    const role = user?.role || 'student'

    // MENU
    const menus =
        sidebarMenus[
        role as keyof typeof sidebarMenus
        ] || sidebarMenus.student

    // LOGOUT LOADING
    const [logoutLoading, setLogoutLoading] =
        useState(false)

    // ACTIVE MENU
    const isActive = (
        path: string
    ) => {

        return location.pathname === path
    }

    // MENU STYLE
    const menuClass = (
        active: boolean
    ) => `
        flex
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-left
        font-medium
        transition-all
        duration-300

        ${active
            ? `
                bg-indigo-50
                text-indigo-600
                shadow-sm
                dark:bg-indigo-500/15
                dark:text-indigo-300
            `
            : `
                text-slate-700
                hover:bg-slate-100
                dark:text-slate-200
                dark:hover:bg-slate-800
            `
        }
    `

    // LOGOUT
    const handleLogout = async () => {

        const result = await Swal.fire({
            title: 'Logout?',
            text: 'Your current session will end',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel',
        })

        if (!result.isConfirmed) return

        setLogoutLoading(true)

        const currentRole = user?.role

        logout()

        await Swal.fire({
            icon: 'success',
            title: 'Logout successful',
            timer: 1200,
            showConfirmButton: false,
        })

        if (currentRole === 'admin') {
            navigate('/admin-portal', { replace: true })
            return
        }

        navigate('/login', { replace: true })
    }

    return (
        <>

            {/* LOADING */}
            {logoutLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">

                    <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-indigo-600"></div>

                    <p className="mt-4 text-lg font-medium text-white">
                        Signing out...
                    </p>

                </div>
            )}

            {/* OVERLAY */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/20
                        backdrop-blur-[2px]
                    "
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-50
                    h-screen
                    w-64
                    border-r
                    border-slate-200
                    bg-white
                    transition-transform
                    duration-300
                    dark:border-slate-800
                    dark:bg-slate-900

                    ${open
                        ? 'translate-x-0'
                        : '-translate-x-full'
                    }
                `}
            >

                {/* HEADER */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-slate-200
                        px-6
                        py-5
                        dark:border-slate-800
                    "
                >

                    <div>

                        <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                            JenggalaTalks
                        </h1>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            AI Writing Assistant
                        </p>

                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        className="
                            rounded-xl
                            p-2
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                        "
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* MENU */}
                <nav className="flex h-[calc(100vh-88px)] flex-col p-4">

                    {/* MENU LIST */}
                    <div className="flex flex-col gap-2">

                        {menus.map((menu, index) => {

                            const Icon = menu.icon

                            return (
                                <button
                                    key={index}
                                    onClick={() => {

                                        navigate(menu.path)

                                        setOpen(false)
                                    }}
                                    className={menuClass(
                                        isActive(menu.path)
                                    )}
                                >

                                    <Icon size={18} />

                                    {menu.label}

                                </button>
                            )
                        })}

                    </div>

                    {/* LOGOUT */}
                    <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">

                        <button
                            onClick={handleLogout}
                            className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-2xl
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-red-500
                                transition-all
                                duration-300
                                hover:bg-red-50
                                hover:translate-x-1
                                dark:hover:bg-red-950/20
                            "
                        >

                            <LogOut size={18} />

                            Logout

                        </button>

                    </div>
                </nav>
            </aside>

        </>
    )
}

export default Sidebar