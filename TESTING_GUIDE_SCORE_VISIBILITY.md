# Testing Guide: Score Visibility Toggle Feature

## Overview
This guide will help you test the Score Visibility Toggle feature that allows teachers to control whether students can see their scores for specific assignments.

---

## Prerequisites

### 1. Backend Setup
```bash
# Navigate to backend directory
cd f:\grammar-check\backend

# Ensure virtual environment is activated
# Install/update dependencies if needed
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
# Open a new terminal
# Navigate to frontend directory
cd f:\grammar-check\frontend

# Install dependencies if needed
npm install

# Start the frontend development server
npm run dev
```

### 3. Database Setup
Ensure your Supabase database is running and the following tables exist:
- `users` (with roles: student, teacher)
- `assignments` (with `show_score` boolean field)
- `submissions` (with score fields)
- `assignment_rubrics`

---

## Test Scenarios

### **SCENARIO 1: Create Assignment with Score Hidden (Default)**

#### Steps:
1. **Login as Teacher**
   - Go to `http://localhost:5173/login`
   - Login with teacher credentials
   - Navigate to "Assignment" page

2. **Create New Assignment**
   - Click "Create Assignment" button
   - Fill in the form:
     - Title: "Essay Test - Hidden Score"
     - Description: "Write about your favorite book"
     - Class Target: "10A"
     - Rubric weights: Grammar=5, Mechanics=5, Content=5, Unity=5
   - **IMPORTANT**: Leave the "Tampilkan nilai ke siswa" toggle **OFF** (default)
   - Click "Create Assignment"

3. **Verify Assignment Created**
   - Check that the assignment appears in the list
   - Note the assignment ID for later use

#### Expected Result:
- Assignment created successfully
- `show_score` field in database = `false`
- No errors in browser console or backend logs

---

### **SCENARIO 2: Student Submits Text (Score Should Be Hidden)**

#### Steps:
1. **Login as Student**
   - Logout from teacher account
   - Login with student credentials
   - Navigate to "Assignments" page

2. **Submit Text for Assignment**
   - Find the assignment "Essay Test - Hidden Score"
   - Click to submit
   - Enter text (minimum 20 words):
     ```
     My favorite book is Harry Potter. It is a magical story about a young wizard who discovers his powers. The book teaches us about friendship, courage, and the battle between good and evil. I love how the author creates a detailed magical world.
     ```
   - Click "Submit"

3. **Check Submission Response**
   - Open browser DevTools (F12) → Network tab
   - Look at the response from `/api/v1/student/submit`
   - Verify the response contains:
     ```json
     {
       "score": null,
       "grade": null,
       "score_grammar": null,
       "score_mechanics": null,
       "score_hidden": true,
       "rubric_status": "awaiting_review"
     }
     ```

4. **Check Submission Detail Page**
   - Navigate to "History" page
   - Click on the submission you just made
   - **Expected**: You should see a banner saying "Nilai belum ditampilkan oleh guru"
   - **Expected**: No score numbers should be visible

#### Expected Result:
- Submission created successfully
- Student **CANNOT** see any scores
- `score_hidden: true` in API response
- Banner displayed: "Nilai belum ditampilkan oleh guru"

---

### **SCENARIO 3: Teacher Reviews Submission**

#### Steps:
1. **Login as Teacher**
   - Logout from student account
   - Login with teacher credentials
   - Navigate to "Dashboard" or "Pending Reviews"

2. **Review the Submission**
   - Find the submission from "Essay Test - Hidden Score"
   - Click to view details
   - Enter scores:
     - Content Score: 4
     - Unity Score: 4
   - Click "Submit Review"

3. **Verify Review Completed**
   - Check that `rubric_status` changed to "complete"
   - Check that `score_total` is calculated (should be around 18/20)
   - Check that `grade` is assigned (should be "A")

#### Expected Result:
- Review submitted successfully
- Scores calculated correctly
- Database updated with `rubric_status = 'complete'`

---

### **SCENARIO 4: Student Still Cannot See Score (Score Hidden)**

#### Steps:
1. **Login as Student**
   - Logout from teacher account
   - Login with student credentials
   - Navigate to "History" page

2. **Check Submission Detail**
   - Click on the reviewed submission
   - **Expected**: Banner still shows "Nilai belum ditampilkan oleh guru"
   - **Expected**: No score numbers visible even though review is complete

3. **Check API Response**
   - Open DevTools → Network tab
   - Look at `/api/v1/student/submission/{id}` response
   - Verify:
     ```json
     {
       "score": null,
       "grade": null,
       "score_grammar": null,
       "score_mechanics": null,
       "score_content": null,
       "score_unity": null,
       "score_total": null,
       "score_hidden": true,
       "rubric_status": "complete"
     }
     ```

#### Expected Result:
- Student still **CANNOT** see scores
- `score_hidden: true` even after review is complete
- Banner displayed correctly

---

### **SCENARIO 5: Teacher Enables Score Visibility**

#### Steps:
1. **Login as Teacher**
   - Navigate to "Assignment" page
   - Find "Essay Test - Hidden Score"
   - Click the **Edit** button (pencil icon)

2. **Update Assignment**
   - Toggle "Tampilkan nilai ke siswa" to **ON**
   - Click "Update Assignment"

3. **Verify Update**
   - Check that the assignment is updated
   - Check database: `show_score` should now be `true`

#### Expected Result:
- Assignment updated successfully
- `show_score = true` in database

---

### **SCENARIO 6: Student Can Now See Score**

#### Steps:
1. **Login as Student**
   - Navigate to "History" page
   - Click on the same submission

2. **Check Submission Detail**
   - **Expected**: Banner "Nilai belum ditampilkan oleh guru" should **NOT** appear
   - **Expected**: All scores should be visible:
     - Grammar Score
     - Mechanics Score
     - Content Score
     - Unity Score
     - Total Score
     - Grade (A/B/C/D)

3. **Check API Response**
   - Open DevTools → Network tab
   - Look at `/api/v1/student/submission/{id}` response
   - Verify:
     ```json
     {
       "score": 18,
       "grade": "A",
       "score_grammar": 5,
       "score_mechanics": 5,
       "score_content": 4,
       "score_unity": 4,
       "score_total": 18,
       "score_hidden": false,
       "rubric_status": "complete"
     }
     ```

#### Expected Result:
- Student **CAN** see all scores
- `score_hidden: false` in API response
- All score fields populated with actual values

---

### **SCENARIO 7: Create Assignment with Score Visible from Start**

#### Steps:
1. **Login as Teacher**
   - Navigate to "Assignment" page
   - Click "Create Assignment"

2. **Create New Assignment**
   - Fill in the form:
     - Title: "Essay Test - Visible Score"
     - Description: "Write about your dream job"
     - Class Target: "10B"
     - Rubric weights: Grammar=5, Mechanics=5, Content=5, Unity=5
   - **IMPORTANT**: Toggle "Tampilkan nilai ke siswa" to **ON**
   - Click "Create Assignment"

3. **Student Submits Text**
   - Login as student
   - Submit text for this assignment
   - Check submission detail immediately after submit

4. **Verify Score Visibility**
   - **Expected**: Student can see `score_grammar` and `score_mechanics` immediately
   - **Expected**: `score_hidden: false` in API response
   - **Expected**: No banner about hidden scores

#### Expected Result:
- Assignment created with `show_score = true`
- Student can see partial scores immediately after submission
- Full scores visible after teacher review

---

### **SCENARIO 8: History Page Score Display**

#### Steps:
1. **Login as Student**
   - Navigate to "History" page

2. **Check Submission List**
   - Find submissions with `score_hidden: true`
     - **Expected**: Shows "-" or "?" in score column
     - **Expected**: Badge or tooltip: "Nilai disembunyikan"
   - Find submissions with `score_hidden: false`
     - **Expected**: Shows actual score and grade

#### Expected Result:
- Hidden scores display "-" with appropriate badge
- Visible scores display actual values
- UI clearly distinguishes between hidden and visible scores

---

## Verification Checklist

### Backend Verification
- [ ] `POST /api/v1/teacher/assignment` accepts `show_score` field
- [ ] `PATCH /api/v1/teacher/assignment/{id}` accepts `show_score` field
- [ ] `POST /api/v1/student/submit` returns `score_hidden: true` when `show_score = false`
- [ ] `GET /api/v1/student/submissions` hides scores when `show_score = false`
- [ ] `GET /api/v1/student/submission/{id}` hides all score fields when `show_score = false`
- [ ] All 50 backend tests still passing: `pytest backend/tests/ -v`

### Frontend Verification
- [ ] Teacher assignment form has "Tampilkan nilai ke siswa" toggle
- [ ] Toggle default state is OFF (false)
- [ ] Toggle state is saved correctly on create
- [ ] Toggle state is saved correctly on update
- [ ] Student submission detail shows banner when `score_hidden: true`
- [ ] Student submission detail hides all scores when `score_hidden: true`
- [ ] Student history page shows "-" for hidden scores
- [ ] Student history page shows actual scores when visible
- [ ] No TypeScript errors in browser console
- [ ] No runtime errors in browser console

### Database Verification
```sql
-- Check assignment show_score field
SELECT id, title, show_score FROM assignments;

-- Check submission score visibility
SELECT 
  s.id,
  s.score,
  s.grade,
  s.score_hidden,
  a.show_score
FROM submissions s
LEFT JOIN assignments a ON s.assignment_id = a.id;
```

---

## Common Issues & Troubleshooting

### Issue 1: "405 Method Not Allowed" on GET /teacher/assignment
**Cause**: Backend missing GET endpoint for listing assignments

**Fix**: Add GET endpoint in `backend/routers/teacher.py`:
```python
@router.get("/assignment")
async def get_assignments(
    current_user: UserPayload = Depends(require_teacher),
):
    supabase = get_supabase_client()
    
    result = supabase.table("assignments").select(
        "*, assignment_rubrics(*)"
    ).eq("teacher_id", current_user.user_id).execute()
    
    return {"data": result.data}
```

### Issue 2: Scores still visible when they should be hidden
**Check**:
1. Verify `show_score` field in database
2. Check API response in DevTools
3. Verify frontend is checking `score_hidden` field correctly

### Issue 3: Toggle not saving
**Check**:
1. Verify payload in DevTools → Network tab
2. Check backend logs for errors
3. Verify database column exists and accepts boolean

---

## Test Data Examples

### Teacher Account
```
Email: teacher@test.com
Password: teacher123
Role: teacher
```

### Student Account
```
Email: student@test.com
Password: student123
Role: student
```

### Sample Text for Submission (50+ words)
```
Technology has transformed education in remarkable ways. Online learning platforms allow students to access courses from anywhere in the world. Interactive tools make lessons more engaging and help students understand complex concepts better. Teachers can track progress more easily and provide personalized feedback. However, we must ensure that technology enhances rather than replaces human interaction in education.
```

---

## Success Criteria

✅ **Feature is working correctly if**:
1. Teacher can toggle score visibility when creating/editing assignments
2. Student cannot see scores when `show_score = false`
3. Student can see scores when `show_score = true`
4. Score visibility can be changed after assignment creation
5. All existing functionality still works (no regressions)
6. All backend tests pass
7. No console errors in frontend
8. UI clearly indicates when scores are hidden

---

## Next Steps After Testing

If all tests pass:
1. Document any edge cases discovered
2. Consider adding automated E2E tests
3. Update user documentation
4. Deploy to staging environment

If tests fail:
1. Document the failure scenario
2. Check backend logs
3. Check browser console
4. Review API responses in DevTools
5. Report issues with detailed reproduction steps
