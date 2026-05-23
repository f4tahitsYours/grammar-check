# Frontend Score Visibility Toggle - Implementation Summary

## ✅ STATUS: COMPLETED

---

## 📋 Files Modified

### 1. **src/types/teacher.ts**
**Changes:**
- Added `Assignment` interface with `show_score` and `is_active` fields
- Updated `SubmissionDetailResponse` to make score fields nullable
- Added `score_hidden: boolean` field
- Added `SubmissionListItem` interface with nullable scores and `score_hidden`

**New Types:**
```typescript
export interface Assignment {
    assignment_id?: string
    id?: string
    title: string
    description: string
    class_target: string
    is_active: boolean
    show_score: boolean  // ← NEW
    rubric?: { ... }
    created_at?: string
    updated_at?: string
}

export interface SubmissionDetailResponse {
    // ... existing fields
    score: number | null        // ← Changed to nullable
    grade: string | null        // ← Changed to nullable
    score_grammar: number | null
    score_mechanics: number | null
    score_content: number | null
    score_unity: number | null
    score_total: number | null
    score_hidden: boolean       // ← NEW
}

export interface SubmissionListItem {
    id: string
    score: number | null        // ← Changed to nullable
    grade: string | null        // ← Changed to nullable
    // ... other fields
    score_hidden: boolean       // ← NEW
}
```

---

### 2. **src/api/teacherApi.ts**
**Changes:**
- Updated `createTeacherAssignment` payload to include `is_active` and `show_score`
- Updated `updateTeacherAssignment` payload to include `is_active` and `show_score`

**Updated Payload:**
```typescript
{
    title: string
    description: string
    class_target: string
    is_active: boolean      // ← NEW
    show_score: boolean     // ← NEW
    rubric: { ... }
}
```

---

### 3. **src/pages/dashboard/teacher/assignment/TeacherAssignment.tsx**
**Changes:**
- Added `showScore` state: `const [showScore, setShowScore] = useState(false)`
- Updated `Assignment` type to include `is_active` and `show_score`
- Added show_score to `resetForm()` function
- Added show_score to `handleEditAssignment()` function
- Updated payload in `handleCreateAssignment()` to include `is_active: true` and `show_score`
- Added toggle UI in the form modal

**New UI Component - Score Visibility Toggle:**
```tsx
{/* SHOW SCORE TOGGLE */}
<div>
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Score Visibility
    </label>

    <div className="mt-2 flex items-center justify-between rounded-2xl border ...">
        <span className="text-sm text-slate-600 dark:text-slate-300">
            Tampilkan nilai ke siswa
        </span>

        <button
            type="button"
            onClick={() => setShowScore(!showScore)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200
                ${showScore ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}
            `}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200
                ${showScore ? 'translate-x-6' : 'translate-x-1'}
            `} />
        </button>
    </div>

    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {showScore
            ? 'Siswa dapat melihat nilai mereka'
            : 'Nilai disembunyikan dari siswa'}
    </p>
</div>
```

**Toggle Position:** Placed after the "Description" field in the left column of the form

---

### 4. **src/pages/dashboard/student/submission/SubmissionDetail.tsx**
**Changes:**
- Added imports: `EyeOff`, `Clock` from lucide-react
- Changed state type from `any` to `SubmissionDetailResponse`
- Added conditional rendering based on `score_hidden`
- Added "Nilai Belum Ditampilkan" banner when `score_hidden = true`
- Added "Menunggu Penilaian Guru" banner when `rubric_status = 'awaiting_review'`
- Added rubric scores breakdown when `rubric_status = 'complete'` and not hidden
- Made score display conditional on `!score_hidden`

**New UI Components:**

**1. Score Hidden Banner (Amber):**
```tsx
{data.score_hidden && (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 ...">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <EyeOff size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-amber-800">
                    Nilai Belum Ditampilkan
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                    Guru belum mengaktifkan tampilan nilai untuk tugas ini.
                    Anda masih dapat melihat koreksi grammar dan feedback.
                </p>
            </div>
        </div>
    </div>
)}
```

**2. Awaiting Review Banner (Blue):**
```tsx
{!data.score_hidden && data.rubric_status === 'awaiting_review' && (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 ...">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-blue-800">
                    Menunggu Penilaian Guru
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                    Submission Anda sedang menunggu penilaian dari guru.
                    Nilai final akan muncul setelah guru menyelesaikan review.
                </p>
            </div>
        </div>
    </div>
)}
```

**3. Rubric Scores Breakdown:**
```tsx
{!data.score_hidden && data.rubric_status === 'complete' && data.score_total && (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Rubric Scores</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Grammar, Mechanics, Content, Unity cards */}
        </div>
        <div className="mt-4 rounded-xl bg-indigo-50 p-4">
            <p className="text-sm text-indigo-600">Total Score</p>
            <p className="mt-1 text-3xl font-bold text-indigo-700">
                {data.score_total} / 20
            </p>
        </div>
    </div>
)}
```

---

### 5. **src/pages/dashboard/student/history/History.tsx**
**Changes:**
- Added `EyeOff` import from lucide-react
- Changed state type from `any[]` to `SubmissionListItem[]`
- Updated `getGradeStyle()` to handle `null` grades
- Updated average score calculation to only include visible scores
- Added conditional rendering for hidden scores in the list
- Added "Nilai disembunyikan oleh guru" badge

**New UI Components:**

**1. Hidden Score Display:**
```tsx
{item.score_hidden ? (
    <div className="flex items-center gap-2 text-slate-400">
        <EyeOff size={18} />
        <div className="text-right">
            <p className="text-xs text-slate-400">Score</p>
            <h3 className="text-xl font-bold text-slate-400">-</h3>
        </div>
    </div>
) : (
    <>
        <div className="text-right">
            <p className="text-sm text-slate-400">Score</p>
            <h3 className="text-xl font-bold">{item.score ?? '-'}</h3>
        </div>
        <div className={`rounded-xl px-3 py-2 text-sm font-bold ${getGradeStyle(item.grade)}`}>
            {item.grade ?? '-'}
        </div>
    </>
)}
```

**2. Hidden Badge:**
```tsx
{item.score_hidden && (
    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
        <EyeOff size={14} />
        <span>Nilai disembunyikan oleh guru</span>
    </div>
)}
```

**3. Average Score Calculation:**
```typescript
const visibleScores = histories.filter(item => !item.score_hidden && item.score !== null)
const averageScore = visibleScores.length > 0
    ? Math.round(visibleScores.reduce((acc, item) => acc + (item.score ?? 0), 0) / visibleScores.length)
    : 0
```

---

## 🎨 Visual Design Description

### Teacher Assignment Form - Toggle Display

**Location:** Modal form, left column, after "Description" field

**Appearance:**
- **Label:** "Score Visibility" (semibold, slate-700)
- **Container:** Rounded-2xl white card with border
- **Text:** "Tampilkan nilai ke siswa" (left side)
- **Toggle Switch:** 
  - OFF state: Gray background (slate-300)
  - ON state: Indigo background (indigo-600)
  - White circle that slides left/right
  - Smooth transition animation (200ms)
- **Helper Text:** 
  - OFF: "Nilai disembunyikan dari siswa" (slate-500, xs)
  - ON: "Siswa dapat melihat nilai mereka" (slate-500, xs)

**Behavior:**
- Click anywhere on the toggle to switch
- Default: OFF (show_score = false)
- Persists when editing existing assignment

---

### Student Submission Detail - Score Hidden State

**When score_hidden = true:**

**Banner Display:**
- **Color Scheme:** Amber (warning style)
- **Icon:** EyeOff (20px, amber-600)
- **Title:** "Nilai Belum Ditampilkan" (semibold, amber-800)
- **Message:** "Guru belum mengaktifkan tampilan nilai untuk tugas ini. Anda masih dapat melihat koreksi grammar dan feedback."
- **Position:** Top of page, before any score cards
- **Style:** Rounded-2xl, border, padding, flex layout with icon

**Hidden Elements:**
- Score card (3-column grid)
- Grade card
- Rubric scores breakdown
- All numeric score displays

**Visible Elements:**
- Original text
- Corrected text
- Grammar changes (diff)
- AI Feedback
- Error count (still visible)

---

### Student Submission Detail - Awaiting Review State

**When rubric_status = 'awaiting_review' AND score_hidden = false:**

**Banner Display:**
- **Color Scheme:** Blue (info style)
- **Icon:** Clock (20px, blue-600)
- **Title:** "Menunggu Penilaian Guru" (semibold, blue-800)
- **Message:** "Submission Anda sedang menunggu penilaian dari guru. Nilai final akan muncul setelah guru menyelesaikan review."
- **Position:** After score cards, before content
- **Style:** Same rounded-2xl style as score hidden banner

---

### Student History List - Hidden Score Display

**When score_hidden = true:**

**Score Section:**
- **Icon:** EyeOff (18px, slate-400)
- **Score Display:** "-" (gray, muted)
- **Grade Badge:** Not shown
- **Style:** Grayed out appearance

**Badge Below:**
- **Icon:** EyeOff (14px, amber-600)
- **Text:** "Nilai disembunyikan oleh guru" (xs, amber-600)
- **Position:** Below the main card content
- **Style:** Flex layout with icon and text

**When score_hidden = false:**
- Normal score and grade display
- Colored grade badge (green/blue/yellow/red)
- No special badge

---

## 🔄 Data Flow

### Teacher Creates Assignment:
1. Teacher opens assignment form
2. Toggle "Tampilkan nilai ke siswa" (default: OFF)
3. Fill other fields (title, description, rubric)
4. Click "Publish Assignment"
5. Payload sent: `{ ..., is_active: true, show_score: false }`
6. Backend saves to database

### Student Submits to Assignment:
1. Student submits text
2. Backend checks assignment's `show_score` field
3. If `show_score = false`:
   - Response: `{ score: null, grade: null, score_hidden: true }`
4. If `show_score = true`:
   - Response: `{ score: 85, grade: "B", score_hidden: false }`

### Student Views Submission:
1. Frontend receives response with `score_hidden` field
2. If `score_hidden = true`:
   - Show amber banner
   - Hide all score displays
   - Show corrections and feedback only
3. If `score_hidden = false`:
   - Show scores normally
   - Show rubric breakdown if complete

### Student Views History:
1. Frontend receives list with `score_hidden` per item
2. For each item:
   - If `score_hidden = true`: Show "-" with EyeOff icon
   - If `score_hidden = false`: Show actual score and grade
3. Average score calculated from visible scores only

---

## ✅ TypeScript Compliance

**No `any` types used:**
- ✅ `SubmissionDetailResponse` type for submission detail
- ✅ `SubmissionListItem[]` type for history list
- ✅ `Assignment` type for assignment data
- ✅ All nullable fields properly typed as `| null`

**Type Safety:**
- ✅ All score fields can be `null`
- ✅ `score_hidden` is always `boolean`
- ✅ Proper null checks with `??` operator
- ✅ Type guards for conditional rendering

---

## 🎯 Feature Behavior Summary

| Scenario | show_score | Student Sees | Display |
|----------|-----------|--------------|---------|
| Free Practice | N/A | ✅ All scores | Normal display |
| Assignment (show_score=true) | true | ✅ All scores | Normal display |
| Assignment (show_score=false) | false | ❌ No scores | Amber banner + "-" |
| Awaiting Review (show_score=true) | true | ⏳ Partial scores | Blue banner + auto scores |
| Complete (show_score=true) | true | ✅ Full scores | All scores + rubric breakdown |
| Complete (show_score=false) | false | ❌ No scores | Amber banner only |

---

## 🚀 Testing Checklist

### Teacher Side:
- [ ] Create assignment with show_score OFF → Toggle should be OFF by default
- [ ] Create assignment with show_score ON → Toggle should be ON
- [ ] Edit assignment → Toggle should reflect current value
- [ ] Submit form → Payload should include `show_score` field
- [ ] Check backend → Assignment saved with correct `show_score` value

### Student Side:
- [ ] Submit to assignment with show_score=false → See amber banner, no scores
- [ ] Submit to assignment with show_score=true → See scores normally
- [ ] View history with mixed visibility → Hidden items show "-" with icon
- [ ] View detail of hidden submission → See amber banner, corrections visible
- [ ] View detail of visible submission → See all scores and rubric
- [ ] Average score calculation → Only counts visible scores

---

## 📝 Notes

1. **Default Behavior:** `show_score` defaults to `false` (scores hidden) for new assignments
2. **Backward Compatibility:** Existing assignments without `show_score` field will be treated as `false`
3. **Free Practice:** Always shows scores regardless of assignment settings (no assignment_id)
4. **Rubric Scores:** Grammar and Mechanics are auto-calculated, Content and Unity need teacher review
5. **Icons Used:** `EyeOff` for hidden state, `Clock` for awaiting review
6. **Color Scheme:** Amber for hidden (warning), Blue for awaiting (info), Indigo for complete (success)

---

## ✅ Implementation Complete

All files have been updated following the existing project patterns:
- ✅ TypeScript types properly defined
- ✅ Tailwind CSS for all styling
- ✅ Lucide React icons
- ✅ Consistent with existing UI patterns
- ✅ No new dependencies required
- ✅ Responsive design maintained
- ✅ Dark mode support included
