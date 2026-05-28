import * as adminApi from '../admin/adminApi'
import * as schoolApi from '../admin/schoolApi'

export const AdminService = {

    // METRICS
    metricsSummary: adminApi.getMetricsSummary,
    dailyMetrics: adminApi.getDailyMetrics,

    // USERS
    users: adminApi.getUsers,
    changeRole: adminApi.updateUserRole,
    removeUser: adminApi.deleteUser,
    assignUserSchool: schoolApi.assignUserSchool,

    // SCHOOLS
    getSchools: schoolApi.getSchools,
    createSchool: schoolApi.createSchool,
    updateSchool: schoolApi.updateSchool,

    // AUDIT
    auditLog: adminApi.getAuditLog,

    // CACHE
    clearCache: adminApi.clearCache,
    cacheStats: adminApi.getCacheStats,

    // HEALTH
    health: adminApi.getHealth
}