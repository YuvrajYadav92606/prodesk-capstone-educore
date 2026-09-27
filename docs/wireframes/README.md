# UI/UX Wireframe Blueprint - EduCore LMS

## Figma Prototype & Canvas Link
- **Figma Design System & Wireframe Canvas URL**: [https://www.figma.com/file/educore-enterprise-lms-blueprint](https://www.figma.com/file/educore-enterprise-lms-blueprint)
*(Access role: Public View / Commenter enabled)*

---

## Core Viewport Wireframe Specifications

### 1. Viewport 1: Auth Screen (Split Hero & Form Layout)
Designed for high conversion and minimal cognitive load, featuring role selection and SSO options.

```
+-----------------------------------------------------------------------------+
|                                EduCore Auth Portal                           |
+--------------------------------------+--------------------------------------+
| [ BRAND HERO & SOCIAL PROOF ]        | [ AUTHENTICATION CARD ]              |
|                                      |                                      |
|  * EduCore Logo & Tagline            |  [ Tab: Sign In ] | [ Tab: Sign Up ] |
|  "Accelerate your career with        |                                      |
|   enterprise mastery."               |  Role Selector:                      |
|                                      |  (o) Student   ( ) Instructor        |
|  [Testimonial Card]                  |                                      |
|  "EduCore reduced our engineering    |  Email Address:                      |
|   onboarding time by 60%."           |  [ student@enterprise.com         ]  |
|  - Engineering Director, CloudTech   |                                      |
|                                      |  Password:                           |
|  Active Students: 120,000+           |  [ ********************      (eye)]  |
|  Completion Rate: 94.8%              |                                      |
|                                      |  [x] Remember me    Forgot Password? |
|                                      |                                      |
|                                      |  [ ====== SIGN IN TO EDUCORE ====== ]|
|                                      |                                      |
|                                      |  ----------- Or continue with -------|
|                                      |  [  (G) Google  ]   [ (GH) GitHub ]  |
+--------------------------------------+--------------------------------------+
```

---

### 2. Viewport 2: Main Dashboard (Student Learning Hub & Progress Center)
Focused on rapid resumption of study, pending deadlines, and personalized recommendations.

```
+-----------------------------------------------------------------------------+
| [EduCore]  [Search courses...]              [Notifications] [Dark] [User (▼)]|
+-------------+---------------------------------------------------------------+
| NAVIGATION  | WELCOME BACK, ALEX R.                              [Filter ▼] |
|             | "You're 2 lessons away from completing Cloud Architecture!"   |
| [Dashboard] |                                                               |
| [My Courses]| +-----------------+ +-----------------+ +-------------------+ |
| [Calendar]  | | ENROLLED: 4     | | HOURS: 38.5 hrs | | CERTIFICATES: 2   | |
| [Quizzes]   | +-----------------+ +-----------------+ +-------------------+ |
| [Settings]  |                                                               |
|             | IN PROGRESS COURSES (RESUME LEARNING)                         |
|             | +-----------------------------------------------------------+ |
|             | | [Thumbnail] Advanced Microservices with Go & Kafka         | |
|             | | Module 4: Event-Driven State Streams                      | |
|             | | [=============================>-----------] 72% Complete   | |
|             | |                                   [ RESUME LESSON -> ]    | |
|             | +-----------------------------------------------------------+ |
|             |                                                               |
|             | RECOMMENDED ROADMAPS & UPCOMING LIVE WEBINARS                 |
|             | +---------------------------+  +----------------------------+ |
|             | | Kubernetes Production Ops |  | System Design Interview    | |
|             | | 12 Modules * 4.9 (420)    |  | Tomorrow at 6:00 PM UTC     | |
|             | | [ View Syllabus ]         |  | [ Set Reminder ]           | |
|             | +---------------------------+  +----------------------------+ |
+-------------+---------------------------------------------------------------+
```

---

### 3. Viewport 3: Course Data Details & Interactive Video Player View
Split-pane learning interface balancing distraction-free media playback and deep curriculum navigation.

```
+-----------------------------------------------------------------------------+
| [<- Back to Courses]  Advanced Microservices with Go & Kafka   [Progress: 72%]|
+----------------------------------------------------+------------------------+
| VIDEO PLAYER / CONTENT VIEWPORT (75% Width)        | CURRICULUM SYLLABUS    |
|                                                    | (25% Collapsible Pane) |
| +------------------------------------------------+ |                        |
| |                                                | | Module 1: Foundations  |
| |                [VIDEO DISPLAY]                 | | [x] 1.1 Intro (12m)    |
| |             1080p 60fps Streaming              | | [x] 1.2 Architecture   |
| |                                                | |                        |
| |                                                | | Module 2: Kafka Engine |
| | [> Play] [08:14 / 24:30] [1.25x] [HD] [Full]   | | [x] 2.1 Brokers (18m)  |
| +------------------------------------------------+ | [>] 2.2 Event Sourcing |
|                                                    |     (Current Playing)  |
| Lesson 4.2: Event-Driven State Streams             | [ ] 2.3 Partitioning   |
|                                                    |                        |
| [Overview] [Resources & Code] [Notes] [Discussion] | Module 3: Storage      |
| +------------------------------------------------+ | [ ] 3.1 Persistence    |
| | Download GitHub Starter Kit: github.com/...    | |                        |
| | Key Takeaway: Ensure partitioning keys match    | | [ Quiz: Assessment ] |
| | customer_id for deterministic stream routing.  | |                        |
| +------------------------------------------------+ | [ Complete & Next -> ] |
+----------------------------------------------------+------------------------+
```

---

## Responsive Breakpoints & Tokens
- **Desktop (Base)**: 1440px (Sidebar fixed at 260px, content auto).
- **Tablet**: 768px - 1024px (Sidebar converts to drawer, split-pane player stacks vertically).
- **Mobile**: 375px - 430px (Video player sticky top, curriculum opens in bottom sheet).
