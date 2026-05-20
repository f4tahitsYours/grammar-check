import DashboardLayout from '../../../components/layout/DashboardLayout'

import {
    ShieldCheck,
    Users,
    ClipboardList,
    Activity
} from 'lucide-react'

function AdminDashboard() {

    return (

        <DashboardLayout>

            <div className="space-y-6">

                {/* HEADER */}
                <div
                    className="
                        overflow-hidden
                        rounded-3xl
                        bg-gradient-to-r
                        from-slate-900
                        to-slate-800
                        p-6
                        text-white
                        shadow-lg
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-6
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        {/* LEFT */}
                        <div>

                            <p className="text-sm font-medium text-slate-300">
                                Admin Dashboard
                            </p>

                            <h1 className="mt-2 text-3xl font-bold leading-tight">
                                Welcome Back, Admin 👋
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                                Monitor system activity, manage users,
                                and control platform access from one dashboard.
                            </p>

                        </div>

                        {/* RIGHT */}
                        <div
                            className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-white/10
                                backdrop-blur-sm
                            "
                        >
                            <ShieldCheck size={34} />
                        </div>

                    </div>

                </div>

                {/* STATS */}
                <div
                    className="
                        grid
                        gap-4
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >

                    {/* TOTAL USERS */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Total Users
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                    256
                                </h3>

                            </div>

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-indigo-100
                                    text-indigo-600
                                "
                            >
                                <Users size={22} />
                            </div>

                        </div>

                    </div>

                    {/* ACTIVE CLASSES */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Active Classes
                                </p>

                                <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
                                    18
                                </h3>

                            </div>

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-emerald-100
                                    text-emerald-600
                                "
                            >
                                <ClipboardList size={22} />
                            </div>

                        </div>

                    </div>

                    {/* SYSTEM STATUS */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    System Status
                                </p>

                                <h3 className="mt-2 text-xl font-bold text-emerald-600">
                                    Online
                                </h3>

                            </div>

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-emerald-100
                                    text-emerald-600
                                "
                            >
                                <Activity size={22} />
                            </div>

                        </div>

                    </div>

                    {/* ADMIN ROLE */}
                    <div
                        className="
                            rounded-2xl
                            bg-white
                            p-5
                            shadow-sm
                            dark:bg-slate-900
                        "
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Role
                                </p>

                                <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
                                    Super Admin
                                </h3>

                            </div>

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-amber-100
                                    text-amber-600
                                "
                            >
                                <ShieldCheck size={22} />
                            </div>

                        </div>

                    </div>

                </div>

                {/* CONTENT */}
                <div
                    className="
                        rounded-2xl
                        bg-white
                        p-6
                        shadow-sm
                        dark:bg-slate-900
                    "
                >

                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Admin Activity
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        This page is currently used for testing
                        admin login and dashboard routing.
                    </p>

                    <div
                        className="
                            mt-6
                            rounded-2xl
                            border
                            border-dashed
                            border-slate-300
                            p-10
                            text-center
                            text-slate-500
                            dark:border-slate-700
                            dark:text-slate-400
                        "
                    >
                        Admin dashboard content will appear here.
                    </div>

                </div>

            </div>

        </DashboardLayout>
    )
}

export default AdminDashboard