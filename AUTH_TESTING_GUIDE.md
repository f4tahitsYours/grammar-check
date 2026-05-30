# Auth System Testing Guide

## Quick Start

```bash
# Start backend
cd backend
uvicorn main:app --reload

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Open browser: `http://localhost:5173`

---

## Test Scenarios

### ✅ Test 1: Student Login & Access Control

**Steps**:
1. Go to `http://localhost:5173/login`
2. Login with student credentials
3. Should redirect to `/dashboard/student/`
4. Check sidebar shows student menu (Dashboard, History, Assignments)
5. Try to manually navigate to `/dashboard/teacher/`
   - **Expected**: Redirect back to `/dashboard/student/`
6. Try to manually navigate to `/dashboard/admin/`
   - **Expected**: Redirect back to `/dashboard/student/`

**Expected Result**: ✅ Student can only access student routes

---

### ✅ Test 2: Teacher Login & Access Control

**Steps**:
1. Logout if logged in
2. Login with teacher credentials
3. Should redirect to `/dashboard/teacher/`
4. Check sidebar shows teacher menu (Dashboard, History, Submission, Assignments)
5. Try to manually navigate to `/dashboard/student/`
   - **Expected**: Redirect back to `/dashboard/teacher/`
6. Try to manually navigate to `/dashboard/admin/`
   - **Expected**: Redirect back to `/dashboard/teacher/`

**Expected Result**: ✅ Teacher can only access teacher routes

---

### ✅ Test 3: Admin Login & Access Control

**Steps**:
1. Logout if logged in
2. Login with admin credentials
3. Should redirect to `/dashboard/admin/`
4. Check sidebar shows admin menu (Dashboard, Users, School, Audit Log)
5. Try to manually navigate to `/dashboard/student/`
   - **Expected**: Redirect back to `/dashboard/admin/`
6. Try to manually navigate to `/dashboard/teacher/`
   - **Expected**: Redirect back to `/dashboard/admin/`

**Expected Result**: ✅ Admin can only access admin routes

---

### ✅ Test 4: Logout Functionality

**Steps**:
1. Login as any role
2. Click "Logout" button in sidebar
3. Confirm logout in dialog
4. Should show "Logout successful" message
5. Should redirect to `/login`
6. Try to navigate to `/dashboard/student/`
   - **Expected**: Redirect to `/login`
7. Check localStorage is cleared (F12 → Application → Local Storage)
   - **Expected**: No `access_token`, `user_id`, etc.

**Expected Result**: ✅ Logout clears session and redirects to login

---

### ✅ Test 5: Session Persistence (Refresh)

**Steps**:
1. Login as any role
2. Navigate to any dashboard page
3. Press F5 to refresh page
4. **Expected**: Should stay logged in
5. **Expected**: Should stay on same page
6. **Expected**: User data still visible in navbar

**Expected Result**: ✅ Session persists across page refresh

---

### ✅ Test 6: Direct URL Access (Not Logged In)

**Steps**:
1. Make sure you're logged out
2. Clear localStorage (F12 → Application → Local Storage → Clear All)
3. Try to access these URLs directly:
   - `http://localhost:5173/dashboard/student/`
   - `http://localhost:5173/dashboard/teacher/`
   - `http://localhost:5173/dashboard/admin/`
4. **Expected**: All should redirect to `/login`

**Expected Result**: ✅ Cannot access protected routes without login

---

### ✅ Test 7: Token Expiry (Manual Test)

**Steps**:
1. Login as any role
2. Open DevTools (F12) → Application → Local Storage
3. Find `access_token`
4. Copy the token value
5. Go to https://jwt.io
6. Paste token in "Encoded" section
7. Check the `exp` field in payload (expiry timestamp)
8. **Option A**: Wait for token to expire naturally (usually 1 hour)
9. **Option B**: Manually edit token in localStorage to make it expired:
   - Decode payload
   - Change `exp` to past timestamp
   - Re-encode and save to localStorage
10. Refresh page (F5)
11. **Expected**: Should auto-logout and redirect to `/login`
12. **Expected**: localStorage should be cleared

**Expected Result**: ✅ Expired tokens are detected and cleared

---

### ✅ Test 8: Loading State

**Steps**:
1. Logout if logged in
2. Clear localStorage
3. Login as any role
4. Immediately after login, watch for loading spinner
5. **Expected**: Brief loading spinner while checking auth
6. **Expected**: Then redirect to dashboard

**Alternative**:
1. Login and stay logged in
2. Refresh page (F5)
3. **Expected**: Brief loading spinner while restoring session
4. **Expected**: Then show dashboard

**Expected Result**: ✅ Loading state shows during auth check

---

### ✅ Test 9: Multiple Tabs

**Steps**:
1. Login in Tab 1
2. Open Tab 2 with same URL
3. **Expected**: Tab 2 should also be logged in (session restored)
4. Logout in Tab 1
5. Refresh Tab 2
6. **Expected**: Tab 2 should also be logged out

**Expected Result**: ✅ Session synced across tabs via localStorage

---

### ✅ Test 10: Console Errors

**Steps**:
1. Open DevTools (F12) → Console
2. Login as any role
3. Navigate through different pages
4. Logout
5. Login again
6. **Expected**: No errors in console

**Common Errors to Check**:
- ❌ "useAuth must be used within AuthProvider"
- ❌ "Cannot read property 'role' of null"
- ❌ "localStorage is not defined"
- ❌ "Failed to fetch"

**Expected Result**: ✅ No console errors

---

## Browser DevTools Checks

### Check 1: localStorage Content (After Login)

**Steps**:
1. Login as any role
2. F12 → Application → Local Storage → `http://localhost:5173`
3. **Expected keys**:
   - `access_token` - JWT token string
   - `user_id` - UUID
   - `user_email` - Email address
   - `user_name` - User name
   - `user_role` - student/teacher/admin

### Check 2: Network Requests

**Steps**:
1. F12 → Network tab
2. Login
3. Check `/auth/login` request
4. **Expected**: Status 200
5. Navigate to dashboard
6. Check API requests (e.g., `/student/submissions`)
7. **Expected**: All requests have `Authorization: Bearer <token>` header

### Check 3: React DevTools (Optional)

**Steps**:
1. Install React DevTools extension
2. F12 → Components tab
3. Find `AuthProvider` component
4. Check state:
   - `user` - Should have user data when logged in
   - `isLoading` - Should be false after initial load
   - `isAuthenticated` - Should be true when logged in

---

## Expected Behavior Summary

| Scenario | Expected Behavior |
|----------|-------------------|
| Login as student | Redirect to `/dashboard/student/` |
| Login as teacher | Redirect to `/dashboard/teacher/` |
| Login as admin | Redirect to `/dashboard/admin/` |
| Student tries teacher route | Redirect to `/dashboard/student/` |
| Teacher tries admin route | Redirect to `/dashboard/teacher/` |
| Not logged in, access dashboard | Redirect to `/login` |
| Logout | Clear session, redirect to `/login` |
| Refresh page (logged in) | Stay logged in |
| Token expired | Auto-logout, redirect to `/login` |
| Multiple tabs | Session synced |

---

## Troubleshooting

### Issue: Stuck on loading spinner
**Check**:
- Is backend running?
- Is token valid?
- Check console for errors

**Fix**: Clear localStorage and refresh

### Issue: Redirected to wrong dashboard
**Check**:
- What role is in localStorage?
- Check `user_role` value

**Fix**: Logout and login again

### Issue: Can access wrong routes
**Check**:
- Is ProtectedRoute wrapping the route?
- Check `allowedRoles` prop

**Fix**: Check `App.tsx` route configuration

### Issue: Token not in API requests
**Check**:
- Is token in localStorage?
- Check axios interceptor in Network tab

**Fix**: Logout and login again

---

## Quick Commands

```bash
# Clear localStorage (in browser console)
localStorage.clear()

# Check current token
localStorage.getItem('access_token')

# Check current role
localStorage.getItem('user_role')

# Decode JWT (in browser console)
JSON.parse(atob(localStorage.getItem('access_token').split('.')[1]))
```

---

## Test Credentials

Create test users via `/register` or use existing:

```
Student:
- Email: student@example.com
- Password: Student123!

Teacher:
- Email: teacher@example.com
- Password: Teacher123!

Admin:
- Email: admin@example.com
- Password: Admin123!
```

---

**Happy Testing!** 🚀
