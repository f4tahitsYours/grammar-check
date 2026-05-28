import {
    LayoutDashboard,
    History,
    ClipboardList,
    Users,
    BookOpen,
    School,
    ShieldCheck
} from 'lucide-react'

export const sidebarMenus = {

    student: [
        {
            label: 'Dashboard',
            path: '/dashboard/student/',
            icon: LayoutDashboard
        },
        {
            label: 'History',
            path: '/dashboard/student/history/',
            icon: History
        },
        {
            label: 'Assignments',
            path: '/dashboard/student/assignment/',
            icon: ClipboardList
        }
    ],

    teacher: [
        {
            label: 'Dashboard',
            path: '/dashboard/teacher/',
            icon: LayoutDashboard
        },

        // HISTORY TEACHER
        {
            label: 'History',
            path: '/dashboard/teacher/history/',
            icon: History
        },

        {
            label: 'Submission',
            path: '/dashboard/teacher/submission/',
            icon: Users
        },

        {
            label: 'Assignments',
            path: '/dashboard/teacher/assignment/',
            icon: BookOpen
        }
    ],

    admin: [
        {
            label: 'Dashboard',
            path: '/dashboard/admin/',
            icon: LayoutDashboard
        },
        {
            label: 'Users',
            path: '/dashboard/admin/users/',
            icon: Users
        },
        {
            label: 'School',
            path: '/dashboard/admin/school/',
            icon: School
        },
        {
            label: 'Audit Log',
            path: '/dashboard/admin/audit-log/',
            icon: ShieldCheck
        }
        // {
        //     label: 'Settings',
        //     path: '/dashboard/admin/settings/',
        //     icon: Settings
        // }
    ]
}