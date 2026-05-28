import DashboardLayout from '../../../components/layout/DashboardLayout'
import PageTransition from '../../../components/common/PageTransition'

import UsersTableSchool from '../../../components/dashboard/admin/UsersTableSchool'

import { useUsers } from '../../../hooks/admin/useUsers'
import { AdminService } from '../../../api/service/admin/adminService'

export default function UsersPage() {

    const {

        users,
        schools,

        loading,

        search,
        setSearch,

        role,
        setRole,

        refreshUsers,
        handleAssignSchool

    } = useUsers()

    // CHANGE ROLE
    const handleChangeRole = async (
        id: string,
        role: string
    ) => {

        await AdminService.changeRole(id, role)

        await refreshUsers()
    }

    // DELETE USER
    const handleDelete = async (id: string) => {

        const confirmDelete = confirm(
            'Delete this user?'
        )

        if (!confirmDelete) return

        await AdminService.removeUser(id)

        await refreshUsers()
    }

    return (

        <DashboardLayout>

            <PageTransition>

                <UsersTableSchool
                    users={users}
                    schools={schools}

                    loading={loading}

                    search={search}
                    setSearch={setSearch}

                    role={role}
                    setRole={setRole}

                    onAssignSchool={handleAssignSchool}

                    onChangeRole={handleChangeRole}

                    onDelete={handleDelete}

                    refreshUsers={refreshUsers}
                />

            </PageTransition>

        </DashboardLayout>
    )
}