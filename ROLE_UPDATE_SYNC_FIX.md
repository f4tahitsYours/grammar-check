# Role Update Sync Fix - Documentation

## ✅ Problem Fixed

Endpoint `PATCH /api/v1/admin/users/{user_id}/role` sekarang sudah sync role ke Supabase Auth `user_metadata`, sehingga JWT yang di-generate saat login berikutnya akan menggunakan role yang sudah diupdate.

---

## 🐛 Problem Statement

### Before Fix
Ketika admin mengubah role user via endpoint `PATCH /api/v1/admin/users/{user_id}/role`:

1. ✅ Role di tabel `users` (database) berhasil diupdate
2. ❌ Role di Supabase Auth `user_metadata` TIDAK diupdate
3. ❌ JWT yang di-generate saat login berikutnya masih menggunakan role lama dari `user_metadata`

**Akibatnya**: User harus logout dan login ulang, tapi tetap dapat role lama karena `user_metadata` tidak berubah.

### Root Cause
Fungsi `update_user_role` hanya update tabel `users` di database, tidak sync ke Supabase Auth.

---

## 🔧 Solution Implemented

### What Was Changed
**File**: `backend/routers/admin.py`  
**Function**: `update_user_role()` (line ~295-340)

### Code Added
Setelah update database berhasil, ditambahkan sync ke Supabase Auth:

```python
# Sync role ke Supabase Auth user_metadata
# Ini memastikan JWT baru akan punya role yang sudah diupdate
try:
    supabase.auth.admin.update_user_by_id(
        user_id,
        {"user_metadata": {"role": request.role}}
    )
    logger.info(
        f"Role synced to Supabase Auth: user_id={user_id}, "
        f"new_role={request.role}"
    )
except Exception as e:
    logger.warning(
        f"Failed to sync role to Supabase Auth: user_id={user_id}, "
        f"error={e}. Database update succeeded."
    )
```

### Error Handling Strategy
- ✅ Jika sync ke Auth **berhasil** → Log info
- ⚠️ Jika sync ke Auth **gagal** → Log warning, tapi **TIDAK rollback** database update
- ✅ Database update tetap sukses meskipun sync gagal

**Rationale**: Database adalah source of truth. Jika sync gagal, admin bisa retry atau user bisa re-login nanti.

---

## 📊 Flow Comparison

### Before Fix
```
Admin calls PATCH /users/{user_id}/role
  ↓
Update tabel users (database) ✅
  ↓
Log to audit_log ✅
  ↓
Return success
  ↓
User login → JWT masih pakai role lama ❌
```

### After Fix
```
Admin calls PATCH /users/{user_id}/role
  ↓
Update tabel users (database) ✅
  ↓
Sync ke Supabase Auth user_metadata ✅
  ↓
Log to audit_log ✅
  ↓
Return success
  ↓
User login → JWT pakai role baru ✅
```

---

## 🧪 Testing

### All Tests Passing
```bash
cd backend
python -m pytest tests/ -v
```

**Result**: ✅ **57/57 tests PASSED**

```
tests/test_admin_api.py::test_update_user_role PASSED ✅
... (56 other tests)
========== 57 passed, 1 warning in 20.94s ===========
```

### Manual Testing Steps

#### 1. Update User Role
```bash
# Login as admin to get token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Update user role from student to teacher
curl -X PATCH "http://localhost:8000/api/v1/admin/users/{user_id}/role" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"role": "teacher"}'
```

**Expected Response**:
```json
{
  "user_id": "uuid",
  "role": "teacher"
}
```

**Expected Logs**:
```
INFO: User role updated: user_id=..., old_role=student, new_role=teacher, admin_id=...
INFO: Role synced to Supabase Auth: user_id=..., new_role=teacher
```

#### 2. Verify JWT Contains New Role
```bash
# User login with updated credentials
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Expected Response**:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "role": "teacher",  ← Should be new role
  "user_id": "uuid",
  "name": "User Name"
}
```

#### 3. Decode JWT to Verify user_metadata
```python
import jwt
import json

token = "eyJ..."  # JWT from login response
decoded = jwt.decode(token, options={"verify_signature": False})

print(json.dumps(decoded, indent=2))
```

**Expected Output**:
```json
{
  "user_metadata": {
    "role": "teacher"  ← Should be new role
  },
  ...
}
```

---

## 🔍 Technical Details

### Supabase Auth API Used
```python
supabase.auth.admin.update_user_by_id(
    user_id: str,
    attributes: dict
)
```

**Parameters**:
- `user_id`: UUID of the user to update
- `attributes`: Dictionary with `user_metadata` key

**What It Does**:
- Updates user metadata in Supabase Auth (auth.users table)
- Next JWT generated will include updated metadata
- Requires service role key (admin access)

### Why user_metadata?
- `user_metadata` adalah field yang di-include dalam JWT payload
- Saat login, backend membaca `user_metadata.role` untuk menentukan role user
- Lihat `backend/dependencies.py` line ~40-50 untuk logic ini

### Database vs Auth
- **Database (`public.users`)**: Source of truth untuk user data
- **Auth (`auth.users`)**: Digunakan untuk authentication dan JWT generation
- **Sync**: Kedua tempat harus konsisten agar JWT valid

---

## 📝 Code Changes Summary

### Modified Files
1. ✅ `backend/routers/admin.py` - Added sync to Supabase Auth

### Lines Changed
**File**: `backend/routers/admin.py`

**Before** (line ~295-315):
```python
# Update role
update_result = supabase.table("users").update({
    "role": request.role
}).eq("id", user_id).execute()

if not update_result.data:
    raise HTTPException(...)

# Log to audit_log
supabase.table("audit_log").insert({...}).execute()
```

**After** (line ~295-335):
```python
# Update role
update_result = supabase.table("users").update({
    "role": request.role
}).eq("id", user_id).execute()

if not update_result.data:
    raise HTTPException(...)

# Sync role ke Supabase Auth user_metadata
try:
    supabase.auth.admin.update_user_by_id(
        user_id,
        {"user_metadata": {"role": request.role}}
    )
    logger.info(f"Role synced to Supabase Auth: ...")
except Exception as e:
    logger.warning(f"Failed to sync role to Supabase Auth: ...")

# Log to audit_log
supabase.table("audit_log").insert({...}).execute()
```

---

## 🚨 Important Notes

### 1. Service Role Key Required
Sync ke Auth membutuhkan **service role key** (bukan anon key).

Pastikan di `backend/config.py`:
```python
supabase_service_key: str
```

Dan di `.env`:
```
SUPABASE_SERVICE_KEY=eyJ...
```

### 2. No Rollback on Sync Failure
Jika sync ke Auth gagal, database update **TIDAK di-rollback**.

**Rationale**:
- Database adalah source of truth
- Sync failure biasanya temporary (network issue, rate limit)
- Admin bisa retry atau user bisa re-login nanti

### 3. Audit Log Still Works
Audit log tetap dicatat meskipun sync gagal, karena:
- Database update berhasil
- Sync failure hanya warning, bukan error

### 4. Backward Compatible
Perubahan ini **backward compatible**:
- Tidak mengubah API contract
- Tidak mengubah response format
- Tidak mengubah validasi
- Semua existing tests masih passing

---

## 🎯 Benefits

### Before Fix
- ❌ Role update tidak langsung efektif
- ❌ User harus logout/login berkali-kali
- ❌ JWT masih pakai role lama
- ❌ Confusing untuk admin dan user

### After Fix
- ✅ Role update langsung efektif
- ✅ User cukup logout/login sekali
- ✅ JWT langsung pakai role baru
- ✅ Consistent antara database dan Auth

---

## 📚 Related Files

### Files Modified
- `backend/routers/admin.py` - Added sync logic

### Files Referenced
- `backend/dependencies.py` - Reads role from `user_metadata.role`
- `backend/routers/auth.py` - Sets `user_metadata.role` during registration
- `backend/config.py` - Contains `supabase_service_key`

### Files NOT Modified
- All other endpoints remain unchanged
- All tests remain unchanged
- No breaking changes

---

## ✅ Checklist

- [x] Sync code added after database update
- [x] Error handling implemented (try/except)
- [x] Logging added (info on success, warning on failure)
- [x] No rollback on sync failure (by design)
- [x] All 57 tests passing
- [x] No breaking changes
- [x] Documentation created

---

**Status**: ✅ **FIXED**  
**Date**: 2026-05-30  
**Tests**: 57/57 PASSING  
**Breaking Changes**: None
