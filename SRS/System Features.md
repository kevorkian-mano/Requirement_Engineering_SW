# 4. System Features

---

## 4.1 Secure Registration, Authentication, and Role Management

### 4.1.1 Description and Priority

This feature allows users (children, parents, teachers) to securely create accounts and log in with role-based access control. The system manages sessions, tokens, and profile data while enforcing parental consent for child accounts.

**Priority:** High

### 4.1.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| User navigates to signup page | System displays role selection (Child/Parent/Teacher) |
| User enters signup details (email, password, language preference) | System validates input and prompts for parental consent (if child) |
| Parent provides consent (checkbox/email confirmation) | System creates account and enables login |
| User enters credentials on login page | System validates and issues JWT token + refresh token |
| Token expires or user requests refresh | System issues new access token without re-login |
| User clicks logout | System invalidates token and clears session |
| Authenticated user accesses protected route | System verifies token and role; grants/denies access |

### 4.1.3 Functional Requirements

- **REQ-AUTH-1:** The system shall provide a secure signup flow supporting three roles: child, parent, and teacher, with email validation and password strength enforcement.
- **REQ-AUTH-2:** The system shall require parental email confirmation before activating a child account.
- **REQ-AUTH-3:** The system shall issue JWT tokens upon successful login, with access and refresh tokens, automatic expiration (e.g., 15 min access, 7 day refresh), and secure token rotation on refresh.
- **REQ-AUTH-4:** The system shall implement role-based authorization, restricting API endpoints and frontend routes based on the authenticated user's role (child, parent, teacher).
- **REQ-AUTH-5:** The system shall store user language preference (Arabic/English) during signup and apply it throughout the session.

**Acceptance Criteria:**
- Signup is rejected if email is invalid or already registered.
- Child account activation requires valid parent email and consent confirmation.
- Login issues tokens and stores session state securely (httpOnly cookies or secure storage).
- Protected endpoints return 403 Forbidden for unauthorized roles.
- Token refresh works without re-entry of credentials.
- Logout clears all session tokens and cookies.
- Language preference persists across page reloads.

---

## 4.2 Age-Appropriate Content Filtering and Progress Tracking

### 4.2.1 Description and Priority

This feature automatically filters games and learning content based on the child's age group (3–5, 6–8, 9–12) and tracks detailed progress metrics per game, including completion status, scores, and performance data.

**Priority:** High

### 4.2.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Child views Games page | System queries games tagged for their age band and displays filtered list |
| Child selects a game | System loads the game and initializes progress tracking |
| Child plays and completes game | System records completion status, score, play duration, and timestamp |
| Child exits game (incomplete) | System saves partial progress (time spent, current level) |
| Parent/Teacher views child progress | System displays progress summaries: completion %, score, last played, play count |
| Progress is updated on backend | System immediately reflects changes in dashboards |

### 4.2.3 Functional Requirements

- **REQ-CONTENT-1:** The system shall tag all games and content with age band metadata (3–5, 6–8, 9–12) and filter displayed content to match the logged-in child's age.
- **REQ-CONTENT-2:** The system shall track and persist per-game progress data: completion flag, score, play count, last played date/time, and completion percentage.
- **REQ-CONTENT-3:** The system shall update progress metrics in real-time and reflect them immediately in child, parent, and teacher dashboards without requiring page refresh.
- **REQ-CONTENT-4:** The system shall prevent access to out-of-band content; locked/age-inappropriate games shall not be playable.

**Acceptance Criteria:**
- A child in the 3–5 age band sees only games tagged for that band; other bands are hidden.
- Game completion updates persist across sessions and page reloads.
- Progress dashboard shows accurate totals: correct completion %, scores, and play counts matching backend records.
- Attempting to load an out-of-band game returns an error or redirects to appropriate content.
- Completion updates trigger dependent features (achievements, unlocks, leaderboards).

---

## 4.3 Points, XP, and Achievement System

### 4.3.1 Description and Priority

This feature awards points and XP to children upon game completion and milestone events, and unlocks achievements when certain conditions are met. Achievements and points are visible on the child's profile and contribute to leaderboard ranking.

**Priority:** High

### 4.3.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Child completes a game | System calculates points/XP based on score and awards to child's account |
| Child reaches a milestone (e.g., 10 games completed) | System checks achievement conditions and unlocks achievement badge |
| Achievement is unlocked | System displays achievement notification and adds to child's profile |
| Child views profile or leaderboard | System displays current points/XP total and unlocked achievements/badges |
| Anti-abuse check runs | System prevents duplicate rewards for the same game/session |

### 4.3.3 Functional Requirements

- **REQ-ACH-1:** The system shall award points and XP to children upon game completion, using a configurable formula based on score, difficulty, and age band.
- **REQ-ACH-2:** The system shall define and track achievements (badges) for milestones such as: completing N games, achieving high scores, maintaining play streaks, or mastering a subject.
- **REQ-ACH-3:** The system shall prevent duplicate reward issuance; a single game play session shall yield points/XP only once.
- **REQ-ACH-4:** The system shall display unlocked achievements on the child's profile and include them in leaderboard ranking calculations.
- **REQ-ACH-5:** The system shall notify the child (in-app and optionally via parent) when an achievement is unlocked.

**Acceptance Criteria:**
- Game completion triggers point/XP award; totals increase correctly on profile.
- Achieving a milestone unlocks the corresponding achievement; achievement appears in the profile immediately.
- Replaying the same game in the same session does not award duplicate points.
- Leaderboard rankings reflect combined points and achievement weight.
- Achievement notifications are visible in-app; parent notifications are accurate and timely.

---

## 4.4 Level Unlocking and Game Access Rules

### 4.4.1 Description and Priority

This feature implements a progression system where children unlock new levels and games by meeting prerequisite conditions (e.g., completing prior levels or achieving minimum scores). Locked content is clearly marked with unlock requirements.

**Priority:** Medium

### 4.4.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Child views Games page or Level list | System queries unlock rules for each item and marks locked items as unavailable |
| Child hovers/clicks on a locked item | System displays unlock requirements (e.g., "Complete Level 1 with 80+ score") |
| Child meets unlock criteria (completes prerequisite) | System re-evaluates unlock status; item transitions to unlocked |
| Child now attempts locked item | System allows launch of the unlocked game/level |
| System admin updates unlock rules | System re-calculates unlock status for all users |

### 4.4.3 Functional Requirements

- **REQ-UNLOCK-1:** The system shall define unlock rules per game/level (e.g., prerequisite completion, minimum score threshold) and store them in a configurable repository.
- **REQ-UNLOCK-2:** The system shall evaluate unlock conditions for each child and mark items locked or unlocked based on their current progress.
- **REQ-UNLOCK-3:** The system shall display clear lock messaging on the UI, showing the requirement needed to unlock (e.g., "Complete Level 1 first").
- **REQ-UNLOCK-4:** The system shall immediately update unlock status when a child meets criteria (no admin intervention required).
- **REQ-UNLOCK-5:** The system shall prevent playable access to locked items; attempting to load a locked game shall return an error.

**Acceptance Criteria:**
- Locked items show as disabled/unavailable on the Games page with clear messaging.
- Hovering/clicking a locked item displays unlock requirements.
- Upon meeting criteria, the item becomes clickable/playable without delay.
- Backend prevents API access to locked games; frontend blocks navigation.
- Unlock rules are consistently applied across all children and persisted after logout/login.

---

## 4.5 Subject-Aligned Serious Games (Math, Physics, Chemistry, Language)

### 4.5.1 Description and Priority

This feature provides curriculum-aligned, interactive games across four core subjects (Math, Physics, Chemistry, Language) tailored to each age band. Games are localized to Egyptian context and track learning outcomes alongside progress metrics.

**Priority:** High

### 4.5.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Child browses Games page | System displays games filtered by subject tags and age band |
| Child selects a subject (e.g., Math) | System shows all age-appropriate Math games with descriptions and difficulty |
| Child launches a game | System loads the game in Phaser.js with localized content (Arabic/English toggle) |
| Child completes a game | System records progress event: subject, age band, score, completion, objectives met |
| Parent/Teacher views analytics | System displays subject mastery indicators (e.g., "Child has completed 3 of 5 Math levels") |
| Teacher assigns a subject activity | System links the game/activity to the assignment and tracks completion per student |

### 4.5.3 Functional Requirements

- **REQ-GAME-1:** The system shall catalog all games with metadata: subject (Math, Physics, Chemistry, Language), age band (3–5, 6–8, 9–12), learning objectives, and difficulty level.
- **REQ-GAME-2:** The system shall provide localized content for each game in Arabic (primary) and English (secondary), with in-game language toggle support.
- **REQ-GAME-3:** The system shall emit progress events upon game completion, capturing subject, score, time spent, objectives achieved, and completion flag.
- **REQ-GAME-4:** The system shall integrate games with the achievement and unlock systems so subject mastery milestones trigger appropriate badges/unlocks.
- **REQ-GAME-5:** The system shall support assignment linking, allowing teachers to assign specific games to students and track completion per assignment.

**Acceptance Criteria:**
- All published games have complete metadata (subject, age band, objectives).
- Games toggle between Arabic and English; content is age-appropriate for each band.
- Completion emits valid progress events; events are logged and stored correctly.
- Subject mastery is calculated correctly in dashboards; leaderboards include subject-specific rankings.
- Assigned games appear in the student's assigned work list and track completion independently.

---

## 4.6 Leaderboards and Friendly Competition

### 4.6.1 Description and Priority

This feature displays leaderboards segmented by age group, showing child rankings based on points, achievements, and completion rates. Optional time-bounded competitions track standings and deliver friendly, non-punitive competition.

**Priority:** Medium

### 4.6.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Child opens Leaderboards page | System displays rankings for their age band, sorted by composite score (points + achievement weight) |
| Child views leaderboard | System shows first name or alias (privacy aliasing) and score; their own rank highlighted |
| Child joins a competition | System enrolls child in the active competition period; displays real-time standings |
| Competition period ends | System archives final standings and displays results (certificates or badges) |
| System recalculates standings | System updates leaderboards in near-real-time (e.g., every 5 minutes) based on latest progress |

### 4.6.3 Functional Requirements

- **REQ-LB-1:** The system shall maintain leaderboards segmented by age band (3–5, 6–8, 9–12), calculating rank based on a composite score: points, achievement weight, and completion rate.
- **REQ-LB-2:** The system shall update leaderboard standings at regular intervals (e.g., every 5 minutes) or on each progress event, ensuring near-real-time rankings.
- **REQ-LB-3:** The system shall display player names as aliases (first name or username) to protect privacy; no sensitive data shall be exposed.
- **REQ-LB-4:** The system shall support time-bounded competitions with defined start/end dates, enrollment, and archived results.
- **REQ-LB-5:** The system shall provide friendly, non-punitive competition messaging; competitors shall not be publicly shamed or ranked below minimum visibility thresholds.

**Acceptance Criteria:**
- Leaderboards show correct age band filtering; children see only peers in their band.
- Rankings reflect latest points and achievements; updates appear within 5 minutes of a progress event.
- Player names are anonymized or use first name only; full name/email not visible.
- Competition enrollment is optional; enrolled children appear in standings; archived results persist.
- Messaging emphasizes fun and improvement, not failure or shame.

---

## 4.7 Parent Dashboard with Screen Time and Activity Insights

### 4.7.1 Description and Priority

This feature provides parents with detailed analytics on their child's platform usage, including screen time, per-game time, daily/weekly trends, and content categories accessed. Reports are exportable and support multi-child monitoring.

**Priority:** Medium

### 4.7.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Parent logs in and navigates to Dashboard | System displays overview: total screen time, active children, alerts summary |
| Parent selects a child | System shows detailed metrics: time on platform, games played, session history |
| Parent views Time tab | System displays daily/weekly trends as charts (bar graphs, line graphs) |
| Parent views Games tab | System shows per-game time breakdown and play frequency |
| Parent selects a date range | System re-calculates and displays metrics for the selected range |
| Parent clicks Export | System generates PDF or CSV report with metrics and exports for download |
| Parent manages multiple children | System allows switching between children; data filters accordingly |

### 4.7.3 Functional Requirements

- **REQ-PARENT-1:** The system shall track and display session-level metrics: session duration, games played, start/end times, and daily/weekly aggregates per child.
- **REQ-PARENT-2:** The system shall provide visualizations: time trend charts, per-game breakdowns, and category summaries (e.g., time spent on Math vs. Language).
- **REQ-PARENT-3:** The system shall support date range filters; parents can view metrics for a specific day, week, or custom range.
- **REQ-PARENT-4:** The system shall enable report export in PDF and CSV formats containing the displayed metrics and summaries.
- **REQ-PARENT-5:** The system shall support multi-child monitoring; parents can manage multiple accounts and switch between children to view individual analytics.

**Acceptance Criteria:**
- Dashboard loads with correct data for the selected child.
- Time metrics match backend session logs (within <1 min of actual play time).
- Charts render correctly and respond to date range changes.
- Export files include all displayed metrics and are opened/downloaded without errors.
- Multi-child selection works; switching between children updates all data correctly.

---

## 4.8 Safety Alerts and Educational Guidance

### 4.8.1 Description and Priority

This feature detects risk signals (excessive gaming, inappropriate content patterns, potential cyberbullying) and delivers parent-facing alerts with educational guidance. Alerts are non-punitive and include coaching recommendations.

**Priority:** High

### 4.8.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Child plays excessively in a session | System monitors play duration and detects threshold breach (e.g., >120 min in one day) |
| Risk signal is detected | System generates an alert record with context (date, activity, signal type) |
| Alert is generated | System notifies parent via email/in-app with guidance message and suggestions |
| Parent views alert in dashboard | System displays alert summary, triggered condition, and recommended actions |
| Parent acknowledges or dismisses alert | System records parent response and adjusts sensitivity if needed |
| Teacher views alerts for class | System shows aggregated signal counts (excessive gaming, flags per student) without exposing sensitive content |
| Alert sensitivity is adjusted | System recalculates risk detection using new thresholds |

### 4.8.3 Functional Requirements

- **REQ-ALERT-1:** The system shall define and monitor risk signals: excessive daily/weekly play time (configurable thresholds), inappropriate content interactions, behavioral/cyberbullying patterns detected via text analysis.
- **REQ-ALERT-2:** The system shall generate and deliver alerts to authorized parents and teachers with clear context, guidance messages, and non-punitive recommendations (e.g., "Consider screen break activities; suggest 20-min break every 2 hours").
- **REQ-ALERT-3:** The system shall provide sensitivity controls (Low/Medium/High) allowing parents to adjust alert frequency and thresholds per signal type.
- **REQ-ALERT-4:** The system shall allow parents/teachers to acknowledge, dismiss, or snooze alerts; dismissed alerts shall be logged for trend analysis.
- **REQ-ALERT-5:** The system shall escalate critical signals (e.g., explicit cyberbullying) to teacher/admin review without exposing sensitive child data to unauthorized parties.

**Acceptance Criteria:**
- Risk signals are detected correctly based on configured thresholds.
- Alerts are delivered within 15 minutes of signal detection.
- Alert messages are clear, educational, and free of punitive language.
- Sensitivity adjustments take effect immediately and change alert frequency appropriately.
- Teachers see aggregated signal summaries (e.g., "3 students with excessive gaming alerts"); sensitive content is redacted.
- Critical escalations are logged and marked for human review.

---

## 4.9 Class Performance and Progress Overview

### 4.9.1 Description and Priority

This feature provides teachers with dashboards displaying class-level aggregate progress, per-student completion rates, subject mastery indicators, and engagement patterns. Teachers can filter by subject, time range, and class.

**Priority:** Medium

### 4.9.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Teacher logs in and navigates to Class Dashboard | System displays class overview: total students, average completion %, average points |
| Teacher views Class Details | System shows per-student progress: games completed, points earned, achievements unlocked, last activity |
| Teacher filters by subject | System re-calculates and displays metrics (completion, mastery) for the selected subject only |
| Teacher filters by time range (e.g., last week) | System updates metrics to reflect activity within the selected range |
| Teacher clicks on a student | System displays that student's individual profile: progress, assignments, alerts |
| Teacher views Mastery Indicators | System shows subject-specific mastery levels (e.g., "3 of 5 Math levels completed") |
| System refreshes data | Dashboard updates automatically every 5 minutes or on demand |

### 4.9.3 Functional Requirements

- **REQ-TEACH-1:** The system shall display class-level aggregate metrics: total students, average completion %, average points, total games played, and average play time.
- **REQ-TEACH-2:** The system shall provide per-student progress visibility: completion status per game/level, points earned, achievements, and last activity timestamp.
- **REQ-TEACH-3:** The system shall support filtering by subject (Math, Physics, Chemistry, Language) and time range (day, week, month, custom); filters shall update metrics in real-time.
- **REQ-TEACH-4:** The system shall calculate and display subject mastery indicators (e.g., "Student completed 4 of 6 Physics levels") based on completion and performance.
- **REQ-TEACH-5:** The system shall ensure teachers see only students in their assigned classes; unauthorized access shall be blocked.

**Acceptance Criteria:**
- Class dashboard loads with correct aggregate metrics matching backend records.
- Per-student data is accurate; no students outside the teacher's class are visible.
- Subject and date filters update metrics correctly.
- Mastery indicators match the actual game completion count per subject.
- Data refreshes automatically; manual refresh also works.
- Teachers cannot access another teacher's class data.

---

## 4.10 Course Assignments and Achievement Tracking

### 4.10.1 Description and Priority

This feature allows teachers to create assignments (specific games or activities) for individual students or groups, set due dates, and track completion. Teachers can view achievements earned within assignments and provide feedback to students.

**Priority:** Medium

### 4.10.2 Stimulus/Response Sequences

| User Action | System Response |
|---|---|
| Teacher opens Assignments page | System displays list of created assignments and their status (active, due soon, completed) |
| Teacher clicks Create Assignment | System opens assignment creation form: select games/activities, target students/groups, set due date |
| Teacher submits assignment | System creates the assignment record and makes it visible to assigned students |
| Student views Assignments | System displays assigned games/activities with due dates and completion status |
| Student completes assigned game | System marks assignment item as completed and records achievement |
| Teacher views Assignment Results | System shows per-student completion: which students finished, completion time, score, achievements earned |
| Teacher leaves feedback | System stores feedback note and notifies student/parent |
| Assignment due date passes | System marks assignment as overdue for incomplete students; may escalate to teacher alert |

### 4.10.3 Functional Requirements

- **REQ-ASSIGN-1:** The system shall allow teachers to create assignments by selecting games/activities, specifying target students or groups, and setting a due date.
- **REQ-ASSIGN-2:** The system shall track assignment completion per student: status (not started, in progress, completed), completion timestamp, and score/achievements earned.
- **REQ-ASSIGN-3:** The system shall display assigned work in the student's dashboard with clear due dates and completion status; students see only their own assignments.
- **REQ-ASSIGN-4:** The system shall allow teachers to view aggregated assignment results (per-student completion, scores, achievements) and provide feedback notes to students.
- **REQ-ASSIGN-5:** The system shall track due dates and generate optional notifications for overdue or upcoming assignments (teacher and student notifications).

**Acceptance Criteria:**
- Assignment creation form is intuitive; all required fields are validated.
- Assigned games appear in the student's assignment list with correct due dates.
- Completion tracking is accurate; scores and achievements match the game results.
- Teachers see only results for their assigned classes.
- Feedback notes are stored and displayed to students/parents.
- Due date notifications are sent on schedule and are accurate.

---

