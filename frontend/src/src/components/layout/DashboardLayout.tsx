import { useState } from 'react'

import Sidebar from './Sidebar'
import Navbar from './Navbar'

type DashboardLayoutProps = {
    children: React.ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950">

            {/* SIDEBAR */}
            <Sidebar open={open} setOpen={setOpen} />

            {/* NAVBAR */}
            <Navbar setOpen={setOpen} />

            {/* MAIN CONTENT */}
            <main className="p-4 md:p-6">
                {children}
            </main>

        </div>
    )
}

export default DashboardLayout