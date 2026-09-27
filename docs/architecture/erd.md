# Architecture & Data Models - EduCore LMS

## 1. Fullstack Entity Relationship Diagram (ERD) - MongoDB

EduCore adopts a hybrid schema design combining normalized document references for high-cardinality collections (`Enrollment`, `QuizSubmission`, `Review`) and bounded embedding for cohesive entities (`Curriculum Modules` -> `Lessons`, `Quiz Questions`).

```mermaid
erDiagram
    USER ||--o{ COURSE : "instructs/creates"
    USER ||--o{ ENROLLMENT : "registers"
    USER ||--o{ QUIZ_SUBMISSION : "attempts"
    USER ||--o{ REVIEW : "authors"
    USER ||--o{ PROGRESS_TRACKER : "maintains"

    COURSE ||--|{ MODULE : "contains"
    COURSE ||--o{ ENROLLMENT : "has"
    COURSE ||--o{ REVIEW : "receives"
    COURSE ||--o{ QUIZ : "evaluates_via"

    MODULE ||--|{ LESSON : "composed_of"

    ENROLLMENT ||--|| PROGRESS_TRACKER : "monitors"
    PROGRESS_TRACKER ||--o{ LESSON_PROGRESS : "records"

    QUIZ ||--|{ QUIZ_QUESTION : "has"
    QUIZ ||--o{ QUIZ_SUBMISSION : "receives"

    USER {
        string _id PK
        string email UK
        string passwordHash
        string fullName
        string role "student | instructor | admin"
        string avatarUrl
        string bio
        boolean isVerified
        date createdAt
        date updatedAt
    }

    COURSE {
        string _id PK
        string instructorId FK "ref: USER._id"
        string title
        string slug UK
        string subtitle
        string description
        string category
        string level "beginner | intermediate | advanced"
        number price
        string thumbnailUrl
        string promotionalVideoUrl
        string status "draft | published | archived"
        float averageRating
        number totalEnrollments
        date createdAt
        date updatedAt
    }

    MODULE {
        string _id PK
        string courseId FK "ref: COURSE._id"
        string title
        number orderIndex
        string summary
    }

    LESSON {
        string _id PK
        string moduleId FK "ref: MODULE._id"
        string courseId FK "ref: COURSE._id"
        string title
        string type "video | article | quiz"
        string contentUrl "Video S3/Cloudinary URL"
        string markdownContent
        number durationSeconds
        number orderIndex
        boolean isPreviewFree
    }

    ENROLLMENT {
        string _id PK
        string userId FK "ref: USER._id"
        string courseId FK "ref: COURSE._id"
        date enrolledAt
        string status "active | completed | cancelled"
        string paymentTransactionId
    }

    PROGRESS_TRACKER {
        string _id PK
        string userId FK "ref: USER._id"
        string courseId FK "ref: COURSE._id"
        number completedLessonsCount
        number totalLessonsCount
        float progressPercentage
        string lastAccessedLessonId FK "ref: LESSON._id"
        date lastAccessedAt
    }

    LESSON_PROGRESS {
        string lessonId FK "ref: LESSON._id"
        boolean isCompleted
        number watchedDurationSeconds
        date completedAt
    }

    QUIZ {
        string _id PK
        string courseId FK "ref: COURSE._id"
        string lessonId FK "ref: LESSON._id"
        string title
        number passingScorePercentage
        number timeLimitMinutes
    }

    QUIZ_QUESTION {
        string questionId PK
        string prompt
        string questionType "single_choice | multiple_choice"
        string[] options
        number[] correctOptionIndices
        number points
    }

    QUIZ_SUBMISSION {
        string _id PK
        string quizId FK "ref: QUIZ._id"
        string userId FK "ref: USER._id"
        number score
        float scorePercentage
        boolean isPassed
        object selectedAnswers
        date submittedAt
    }

    REVIEW {
        string _id PK
        string courseId FK "ref: COURSE._id"
        string userId FK "ref: USER._id"
        number rating "1 to 5"
        string comment
        date createdAt
    }
```

---

## 2. MongoDB Schema Invariants & Design Principles

1. **Denormalization for Fast Dashboard Reads**:
   - `COURSE` stores `averageRating` and `totalEnrollments` updated asynchronously upon review creation or enrollment commit.
   - `PROGRESS_TRACKER` calculates `progressPercentage` on lesson completion to avoid costly table scans across lesson collections during student portal loading.
2. **Access Control & Multi-Tenancy**:
   - Every read and write to protected course assets queries role permissions (`student`, `instructor`, `admin`) validated against JWT tokens.
3. **Compound Indexes**:
   - `Enrollment`: `{ userId: 1, courseId: 1 }` (Unique compound index preventing duplicate enrollments).
   - `ProgressTracker`: `{ userId: 1, courseId: 1 }` (Fast user-course resume queries).
   - `Lesson`: `{ moduleId: 1, orderIndex: 1 }` (Ordered sequence resolution).
