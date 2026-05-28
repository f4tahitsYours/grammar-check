import { assignUserSchool } from '../../api/service/admin/schoolApi'

export function useAssignSchool() {

    const handleAssignSchool = async (userId: string, schoolId: string) => {
        try {
            await assignUserSchool(userId, schoolId)
            alert('School assigned successfully')
        } catch (error) {
            console.error('ASSIGN SCHOOL ERROR:', error)
        }
    }

    return {
        handleAssignSchool
    }
}