import { useEffect, useState } from 'react'
import {
    Menu,
    ChevronDown,
    Mail,
    GraduationCap,
    Shield
} from 'lucide-react'
import { useAuth } from '../../hooks/auth/useAuth'

type NavbarProps = {
    setOpen: (value: boolean) => void
}

function Navbar({ setOpen }: NavbarProps) {

    const [dropdownOpen] = useState(false)
    // const [dropdownOpen, setDropdownOpen] = useState(false)

    const { user } = useAuth()

    // USER DATA
    const [userName, setUserName] = useState('')
    const [userRole, setUserRole] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [userClass, setUserClass] = useState('')

    useEffect(() => {

        if (user) {
            setUserName(user.name)
            setUserRole(user.role)
            setUserEmail(user.email)
            // class_name is not in AuthUser, keep from localStorage for now
            setUserClass(localStorage.getItem('user_class') || '-')
        } else {
            setUserName('User')
            setUserRole('Student')
            setUserEmail('-')
            setUserClass('-')
        }

    }, [user])

    // AVATAR INITIAL
    const initial = userName.charAt(0).toUpperCase()

    // FORMAT ROLE
    const formatRole = (role: string) => {

        if (role === 'admin') return 'Admin'

        if (role === 'teacher') return 'Teacher'

        return 'Student'
    }

    return (
        <header
            className="
                sticky
                top-0
                z-30
                border-b
                border-slate-200
                bg-white/80
                backdrop-blur-lg
                dark:border-slate-800
                dark:bg-slate-950/80
            "
        >
            <div
                className="
                    flex
                    h-16
                    items-center
                    justify-between
                    px-4
                    md:px-6
                "
            >

                {/* LEFT */}
                <div className="flex items-center gap-3">

                    {/* HAMBURGER */}
                    <button
                        onClick={() => setOpen(true)}
                        className="
                            rounded-xl
                            p-2
                            transition
                            hover:bg-slate-100
                            text-slate-800
                            dark:text-slate-100
                            dark:hover:bg-slate-800
                        "
                    >
                        <Menu size={22} />
                    </button>

                    {/* LOGO */}
                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-indigo-600
                                text-lg
                                font-bold
                                text-white
                            "
                        >
                            G
                        </div>

                        <div>

                            <h1
                                className="
                                    text-lg
                                    font-bold
                                    text-slate-800
                                    dark:text-slate-100
                                "
                            >
                                JenggalaTalks
                            </h1>

                            <p
                                className="
                                    text-xs
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                AI Writing Assistant
                            </p>

                        </div>

                    </div>

                </div>

                {/* RIGHT */}
                <div className="relative">

                    <button
                        // onClick={() =>
                        //     setDropdownOpen(!dropdownOpen)
                        // }
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2
                            transition
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                        "
                    >

                        {/* AVATAR */}
                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-indigo-100
                                font-semibold
                                text-indigo-600
                                dark:bg-indigo-950/40
                                dark:text-indigo-300
                            "
                        >
                            {initial}
                        </div>

                        {/* USER */}
                        <div className="hidden text-left sm:block">

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                    dark:text-slate-100
                                "
                            >
                                {userName}
                            </p>

                            <p
                                className="
                                    text-xs
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                {formatRole(userRole)}
                            </p>

                        </div>

                        <ChevronDown
                            size={18}
                            // className={`
                            //     text-slate-500
                            //     transition
                            //     duration-200

                            //     ${dropdownOpen
                            //         ? "rotate-180"
                            //         : ""
                            //     }
                            // `}
                        />

                    </button>

                    {/* PROFILE CARD */}
                    {dropdownOpen && (

                        <div
                            className="
                                absolute
                                right-0
                                mt-3
                                w-80
                                overflow-hidden
                                rounded-3xl
                                border
                                border-slate-200
                                bg-white
                                shadow-2xl
                                dark:border-slate-700
                                dark:bg-slate-900
                            "
                        >

                            {/* TOP */}
                            <div
                                className="
                                    bg-gradient-to-r
                                    from-indigo-600
                                    to-indigo-500
                                    p-6
                                    text-white
                                "
                            >

                                <div className="flex items-center gap-4">

                                    {/* BIG AVATAR */}
                                    <div
                                        className="
                                            flex
                                            h-16
                                            w-16
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-white/20
                                            text-2xl
                                            font-bold
                                            backdrop-blur-md
                                        "
                                    >
                                        {initial}
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold">
                                            {userName}
                                        </h2>

                                        <p className="text-sm text-indigo-100">
                                            {formatRole(userRole)}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* CONTENT */}
                            <div className="space-y-4 p-5">

                                {/* EMAIL */}
                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            rounded-xl
                                            bg-slate-100
                                            p-2
                                            dark:bg-slate-800
                                        "
                                    >
                                        <Mail
                                            size={18}
                                            className="
                                                text-slate-600
                                                dark:text-slate-300
                                            "
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                text-slate-500
                                            "
                                        >
                                            Email
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                dark:text-white
                                            "
                                        >
                                            {userEmail}
                                        </p>

                                    </div>

                                </div>

                                {/* ROLE */}
                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            rounded-xl
                                            bg-slate-100
                                            p-2
                                            dark:bg-slate-800
                                        "
                                    >
                                        <Shield
                                            size={18}
                                            className="
                                                text-slate-600
                                                dark:text-slate-300
                                            "
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                text-slate-500
                                            "
                                        >
                                            Role
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                dark:text-white
                                            "
                                        >
                                            {formatRole(userRole)}
                                        </p>

                                    </div>

                                </div>

                                {/* CLASS */}
                                <div className="flex items-start gap-3">

                                    <div
                                        className="
                                            rounded-xl
                                            bg-slate-100
                                            p-2
                                            dark:bg-slate-800
                                        "
                                    >
                                        <GraduationCap
                                            size={18}
                                            className="
                                                text-slate-600
                                                dark:text-slate-300
                                            "
                                        />
                                    </div>

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                text-slate-500
                                            "
                                        >
                                            Class
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                font-medium
                                                text-slate-800
                                                dark:text-white
                                            "
                                        >
                                            {userClass}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </header>
    )
}

export default Navbar