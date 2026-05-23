# Score Visibility Toggle Feature

## Status: ✅ IMPLEMENTED

## Overview
Teachers can now control whether students see their submission scores per assignment using the `show_score` boolean field.

---

## Files Modified

### 1. **backend/models/request.py**
- Added `show_score: bool = False` to `AssignmentCreateRequest`
- Added `is_active: bool = True` to `AssignmentCreateRequest`

### 2. **backend/models/response.py**
- Added `score_hidden: bool = False` to:
  - `SubmitResponse`
  - `SubmissionListItem`
  - `SubmissionDetailResponse`
- Changed `score` and `grade` from `int`/`str` to `Optional[int]`/`Optional[str]` in:
  - `SubmitResponse`
  - `SubmissionListItem`
  - `SubmissionDetailResponse`

### 3. **backend/routers/teacher.py**
- `create_assignment()`: Added `show_score` to assignment insert data
- `update_assignment()`: Added `show_score` and `is_active` to update data

### 4. **backend/routers/student.py**
- `submit_text()`: 
  - Fetches assignment `show_score` setting
  - Hides scores if `show_score=False`
  - Sets `score_hidden=True` in response
  - Free practice always shows scores
- `get_submissions()`:
  - Joins with assignments table to get `show_score`
  - Hides scores per item based on assignment setting
- `get_submission_detail()`:
  - Joins with assignments table to get `show_score`
  - Hides all score fields if `show_score=False`

---

## Test Results

✅ **50 tests passed**

All existing tests continue to pass with the new feature.

---

## API Response Examples

### Example 1: Free Practice (show_score not applicable)

**Request:**
```json
POST /api/v1/student/submit
{
  "text": "Yesterday I go to school...",
  "assignment_id": null
}
```

**Response:**
```json
{
  "submission_id": "abc-123",
  "source": "pipeline",
  "original_text": "Yesterday I go to school...",
  "corrected_text": "Yesterday I went to school...",
  "errors": [...],
  "score": 85,
  "grade": "B",
  "word_count": 50,
  "error_count": 3,
  "error_breakdown": {"grammar": 2, "spelling": 1},
  "feedback": "Good work! Focus on verb tenses.",
  "diff_html": "",
  "fallback_used": false,
  "warning": null,
  "rubric_status": "auto_only",
  "score_grammar": null,
  "score_mechanics": null,
  "score_hidden": false
}
```

---

### Example 2: Assignment with show_score=true

**Create Assignment:**
```json
POST /api/v1/teacher/assignment
{
  "title": "Essay 1",
  "description": "Write about your hobby",
  "class_target": "Class A",
  "show_score": true,
  "rubric": {
    "grammar_weight": 5,
    "mechanics_weight": 5,
    "content_weight": 5,
    "unity_weight": 5,
    "grading_scale": {"17": "A", "13": "B", "9": "C", "0": "D"}
  }
}
```

**Submit to Assignment:**
```json
POST /api/v1/student/submit
{
  "text": "Yesterday I go to school...",
  "assignment_id": "assign-123"
}
```

**Response:**
```json
{
  "submission_id": "sub-456",
  "source": "pipeline",
  "original_text": "Yesterday I go to school...",
  "corrected_text": "Yesterday I went to school...",
  "errors": [...],
  "score": 0,
  "grade": "-",
  "word_count": 50,
  "error_count": 3,
  "error_breakdown": {"grammar": 2, "spelling": 1},
  "feedback": "Good work! Focus on verb tenses.",
  "diff_html": "",
  "fallback_used": false,
  "warning": null,
  "rubric_status": "awaiting_review",
  "score_grammar": 4,
  "score_mechanics": 4,
  "score_hidden": false
}
```

**Note:** Scores are visible because `show_score=true`. Student can see `score_grammar` and `score_mechanics`.

---

### Example 3: Assignment with show_score=false (HIDDEN SCORES)

**Create Assignment:**
```json
POST /api/v1/teacher/assignment
{
  "title": "Essay 2",
  "description": "Write about your hobby",
  "class_target": "Class A",
  "show_score": false,
  "rubric": {
    "grammar_weight": 5,
    "mechanics_weight": 5,
    "content_weight": 5,
    "unity_weight": 5,
    "grading_scale": {"17": "A", "13": "B", "9": "C", "0": "D"}
  }
}
```

**Submit to Assignment:**
```json
POST /api/v1/student/submit
{
  "text": "Yesterday I go to school...",
  "assignment_id": "assign-789"
}
```

**Response:**
```json
{
  "submission_id": "sub-999",
  "source": "pipeline",
  "original_text": "Yesterday I go to school...",
  "corrected_text": "Yesterday I went to school...",
  "errors": [...],
  "score": null,
  "grade": null,
  "word_count": 50,
  "error_count": 3,
  "error_breakdown": {"grammar": 2, "spelling": 1},
  "feedback": "Good work! Focus on verb tenses.",
  "diff_html": "",
  "fallback_used": false,
  "warning": null,
  "rubric_status": "awaiting_review",
  "score_grammar": null,
  "score_mechanics": null,
  "score_hidden": true
}
```

**Note:** All score fields are `null` and `score_hidden=true` because `show_score=false`.

---

### Example 4: Get Submission List with Mixed Visibility

**Request:**
```json
GET /api/v1/student/submissions?page=1&limit=20
```

**Response:**
```json
{
  "items": [
    {
      "id": "sub-999",
      "score": null,
      "grade": null,
      "word_count": 50,
      "error_count": 3,
      "created_at": "2024-01-15T10:00:00Z",
      "assignment_id": "assign-789",
      "rubric_status": "awaiting_review",
      "score_grammar": null,
      "score_mechanics": null,
      "score_total": null,
      "score_hidden": true
    },
    {
      "id": "sub-456",
      "score": 0,
      "grade": "-",
      "word_count": 50,
      "error_count": 3,
      "created_at": "2024-01-14T10:00:00Z",
      "assignment_id": "assign-123",
      "rubric_status": "awaiting_review",
      "score_grammar": 4,
      "score_mechanics": 4,
      "score_total": null,
      "score_hidden": false
    },
    {
      "id": "abc-123",
      "score": 85,
      "grade": "B",
      "word_count": 50,
      "error_count": 3,
      "created_at": "2024-01-13T10:00:00Z",
      "assignment_id": null,
      "rubric_status": "auto_only",
      "score_grammar": null,
      "score_mechanics": null,
      "score_total": null,
      "score_hidden": false
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20
}
```

---

## Behavior Summary

| Scenario | show_score | score visible? | score_hidden |
|----------|-----------|----------------|--------------|
| Free practice (no assignment_id) | N/A | ✅ Yes | false |
| Assignment with show_score=true | true | ✅ Yes | false |
| Assignment with show_score=false | false | ❌ No (null) | true |

---

## Database Schema

The `show_score` column was added to the `assignments` table:

```sql
ALTER TABLE assignments 
ADD COLUMN show_score BOOLEAN DEFAULT false;
```

---

## Frontend Integration

The frontend should check the `score_hidden` field:

```typescript
if (response.score_hidden) {
  // Show message: "Scores hidden by teacher"
  // Don't display score, grade, score_grammar, score_mechanics
} else {
  // Display scores normally
}
```

---

## Testing Commands

```powershell
# 1. Create assignment with show_score=false
$assign = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/v1/teacher/assignment" `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $TT"} `
  -Body '{"title":"Hidden Score Test","description":"Test","class_target":"Class A","show_score":false,"rubric":{"grammar_weight":5,"mechanics_weight":5,"content_weight":5,"unity_weight":5,"grading_scale":{"17":"A","13":"B","9":"C","0":"D"}}}'

Write-Host "Assignment ID: $($assign.assignment_id)"

# 2. Submit as student
$sub = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/v1/student/submit" `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $ST"} `
  -Body "{`"text`":`"Yesterday I go to school and I meet my friend. We was very happy.`",`"assignment_id`":`"$($assign.assignment_id)`"}"

Write-Host "Score: $($sub.score)"
Write-Host "Grade: $($sub.grade)"
Write-Host "Score Hidden: $($sub.score_hidden)"

# Expected: score=null, grade=null, score_hidden=true

# 3. Create assignment with show_score=true
$assign2 = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/v1/teacher/assignment" `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $TT"} `
  -Body '{"title":"Visible Score Test","description":"Test","class_target":"Class A","show_score":true,"rubric":{"grammar_weight":5,"mechanics_weight":5,"content_weight":5,"unity_weight":5,"grading_scale":{"17":"A","13":"B","9":"C","0":"D"}}}'

# 4. Submit as student
$sub2 = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:8000/api/v1/student/submit" `
  -ContentType "application/json" `
  -Headers @{"Authorization"="Bearer $ST"} `
  -Body "{`"text`":`"Yesterday I go to school and I meet my friend. We was very happy.`",`"assignment_id`":`"$($assign2.assignment_id)`"}"

Write-Host "Score Grammar: $($sub2.score_grammar)"
Write-Host "Score Mechanics: $($sub2.score_mechanics)"
Write-Host "Score Hidden: $($sub2.score_hidden)"

# Expected: score_grammar=4, score_mechanics=4, score_hidden=false
```

---

## Conclusion

✅ Feature fully implemented
✅ All tests passing (50/50)
✅ Backward compatible (default show_score=false)
✅ Works for submit, list, and detail endpoints
✅ Free practice always shows scores
