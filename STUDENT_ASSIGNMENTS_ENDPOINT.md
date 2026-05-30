# Student Assignments Endpoint Documentation

## Endpoint Baru: GET /api/v1/student/assignments

### Overview
Endpoint ini mengembalikan daftar assignment yang aktif dan relevan untuk student yang sedang login.

### Authentication
- **Required**: Yes
- **Role**: Student only
- **Method**: JWT Bearer Token

### Request
```http
GET /api/v1/student/assignments
Authorization: Bearer <student_jwt_token>
```

**No query parameters required.**

### Logic Flow

1. **Get Student Info**
   - Ambil `school_id` dan `class_name` dari tabel `users` berdasarkan `user_id` yang login

2. **Query Assignments**
   - Filter: `is_active = true`
   - Join ke `users` (teacher) via `assignments_teacher_id_fkey`
   - Join ke `assignment_rubrics` (left join, nullable)
   - Order by `created_at DESC`

3. **School Filtering**
   - **Jika student punya `school_id`**: Hanya tampilkan assignment dari teacher dengan `school_id` yang sama
   - **Jika student TIDAK punya `school_id`**: Tampilkan semua assignment aktif (fallback untuk data lama)

4. **Response Formatting**
   - `show_score` field **TIDAK** dimasukkan ke response (student tidak perlu tahu)
   - `rubric` bisa `null` jika assignment belum punya rubrik
   - `teacher_name` diambil dari join ke tabel `users`

### Response

#### Success (200 OK)
```json
{
  "data": [
    {
      "assignment_id": "ace9ef01-cd1e-43c0-8a0a-c90f1401d5df",
      "title": "Grammar Check: Analytical Writing on AI/NLP Topics",
      "description": "Write a short analytical essay (300–500 words) explaining one concept in Natural Language Processing or Machine Learning. Use correct grammar, proper academic mechanics, coherent content, and a unified argument.",
      "class_target": "9 A",
      "is_active": true,
      "created_at": "2026-05-22T10:30:00Z",
      "teacher_name": "Ibu Gunarti",
      "rubric": {
        "grammar_weight": 5,
        "mechanics_weight": 5,
        "content_weight": 5,
        "unity_weight": 5
      }
    },
    {
      "assignment_id": "f714fd58-5544-45b9-8e7a-6d563c509ebe",
      "title": "Daily Routine Essay",
      "description": "Write about your daily routine in English.",
      "class_target": "7A",
      "is_active": true,
      "created_at": "2026-05-20T08:00:00Z",
      "teacher_name": "Mr. John",
      "rubric": null
    }
  ],
  "total": 2
}
```

#### Empty Result (200 OK)
```json
{
  "data": [],
  "total": 0
}
```

#### Unauthorized (401)
```json
{
  "detail": "Not authenticated"
}
```

#### Forbidden (403)
```json
{
  "detail": "Access forbidden: student role required"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | Array | List of assignment objects |
| `total` | Integer | Total number of assignments returned |

#### Assignment Object Fields

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `assignment_id` | String (UUID) | No | Unique assignment ID |
| `title` | String | No | Assignment title |
| `description` | String | No | Assignment description/instructions |
| `class_target` | String | Yes | Target class (e.g., "7A", "9 B") |
| `is_active` | Boolean | No | Whether assignment is active |
| `created_at` | String (ISO 8601) | No | Assignment creation timestamp |
| `teacher_name` | String | Yes | Name of teacher who created the assignment |
| `rubric` | Object | Yes | Rubric configuration (null if not set) |

#### Rubric Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `grammar_weight` | Integer | Weight for grammar scoring (1-5) |
| `mechanics_weight` | Integer | Weight for mechanics scoring (1-5) |
| `content_weight` | Integer | Weight for content scoring (1-5) |
| `unity_weight` | Integer | Weight for unity scoring (1-5) |

### Use Cases

#### 1. Student Melihat Daftar Assignment
```bash
curl -X GET "http://localhost:8000/api/v1/student/assignments" \
  -H "Authorization: Bearer <student_token>"
```

#### 2. Frontend Integration
```typescript
// TypeScript/React example
const fetchAssignments = async () => {
  const response = await fetch('/api/v1/student/assignments', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Display assignments in UI
  data.data.forEach(assignment => {
    console.log(`${assignment.title} by ${assignment.teacher_name}`);
  });
};
```

### Testing

#### Manual Test
1. Start backend server: `uvicorn backend.main:app --reload`
2. Login as student to get JWT token
3. Update `STUDENT_TOKEN` in `test_student_assignments_endpoint.py`
4. Run: `python backend/test_student_assignments_endpoint.py`

#### Automated Test
```bash
cd backend
python -m pytest tests/test_student_api.py -v
```

All 57 existing tests should still pass.

### Implementation Details

**File**: `backend/routers/student.py`
- **Function**: `get_assignments()`
- **Line**: ~490-580 (at the end of file)

**Models**: `backend/models/response.py`
- `AssignmentRubricInfo` (line ~165)
- `StudentAssignmentItem` (line ~170)
- `StudentAssignmentListResponse` (line ~180)

### Security Notes

1. **Authentication Required**: Endpoint protected by `Depends(require_student)`
2. **Role Check**: Only students can access this endpoint
3. **School Filtering**: Students only see assignments from teachers in their school
4. **No Score Visibility Info**: `show_score` field is intentionally hidden from students

### Database Schema

#### Tables Used
- `users` - Get student's school_id and teacher info
- `assignments` - Main assignment data
- `assignment_rubrics` - Rubric configuration (optional)

#### Foreign Keys
- `assignments.teacher_id` → `users.id`
- `assignment_rubrics.assignment_id` → `assignments.id`
- `users.school_id` → `schools.id` (nullable)

### Known Limitations

1. **No Pagination**: Returns all matching assignments (could be many)
   - **Future**: Add `page` and `limit` query parameters
   
2. **No Class Filtering**: Returns all assignments regardless of `class_target`
   - **Future**: Filter by student's `class_name`
   
3. **No Search/Filter**: Cannot search by title or filter by date
   - **Future**: Add query parameters for search and filters

### Changelog

**2026-05-30**: Initial implementation
- Added GET /api/v1/student/assignments endpoint
- Added 3 new Pydantic models
- All 57 existing tests passing

---

**Status**: ✅ Implemented and Tested  
**Version**: 1.0.0  
**Last Updated**: 2026-05-30
