## Functional Requirements 
---
---

#### FR-1: Secure Registration, Authentication, and Role Management
**User Story:** As a parent, teacher, or child, I want to sign up and log in securely with role-based access so that I can use features intended for me.

**Description:** Provide role-aware auth with profile data (age group for children) and secure session handling.

**Detailed Specifications:**
- Must support JWT/OAuth tokens with refresh, logout, and rotation; sessions expire per policy.
- Roles: child, parent, teacher; authorization gates routes and APIs accordingly.
- Stores minimal PII; enforces parental consent flows for child accounts.
- Localized profile preferences (Arabic/English) captured at signup/edit.

**Acceptance Criteria:**
- Signup/login returns tokens; protected endpoints reject unauthenticated/unauthorized access.
- Role-based dashboards show only permitted sections; forbidden routes return 403.
- Parental consent required before activating a child account.
- Session expiry and refresh flows function without leaking roles.

**Diagrams to draw:** Use Case Diagram (actors/flows), Sequence Diagram (login + refresh).

**WRSPM:** Draw for this requirement.



---

#### FR-2: Age-Appropriate Content Filtering and Progress Tracking
**User Story:** As a child, I want the platform to show content for my age so I stay safe and engaged.

**Description:** Filter games by age bands (3–5, 6–8, 9–12) and track per-game progress.

**Detailed Specifications:**
- Content catalog tagged with age band and subject; queries filter by the child’s band.
- Progress per game: completion flag, score, play count, last played timestamp, completion percentage.
- Progress surfaces in dashboards for child, parent, teacher; used for unlock logic.

**Acceptance Criteria:**
- A child sees only items tagged for their band; cross-band items are hidden/locked.
- Progress updates on game completion and persists across sessions.
- Dashboards display completion state consistent with backend records.

**Diagrams to draw:** Activity Diagram (content filtering + fetch), Sequence Diagram (save progress).

---

#### FR-3: Points, XP, and Achievement System
**User Story:** As a child, I want to earn points and achievements when I complete activities so I stay motivated.

**Description:** Award points/XP and unlock achievements on completion and milestones.

**Detailed Specifications:**
- Points/XP awarded per completion; caps and anti-abuse checks (e.g., cooldowns).
- Achievements: streaks, mastery thresholds, subject milestones; stored per user.
- Achievements and XP visible on child profile and used in leaderboards.

**Acceptance Criteria:**
- Completing a game awards points/XP within defined rules and updates totals.
- Unlocking a milestone creates an achievement record and displays in UI.
- Duplicate rewards for the same event are prevented.

**Diagrams to draw:** State Diagram (achievement lifecycle), Sequence Diagram (award flow).

---

#### FR-4: Level Unlocking and Game Access Rules
**User Story:** As a child, I want to unlock new levels by completing earlier ones so I can progress.

**Description:** Gate content by completion/performance rules per age band.

**Detailed Specifications:**
- Unlock rules configurable by game/level (e.g., completion + minimum score).
- Locked items clearly indicated with requirement messaging.
- Unlock status recalculated after each progress update.

**Acceptance Criteria:**
- Locked content cannot be launched until prerequisites are met.
- Upon meeting criteria, item becomes available without manual admin action.
- UI shows current lock reason and updates immediately after unlock.

**Diagrams to draw:** Activity Diagram (unlock decision), Use Case Diagram (progress/unlock actors).

---

#### FR-5: Subject-Aligned Serious Games (Math, Physics, Chemistry, Language)
**User Story:** As a child, I want subject games that teach core concepts so I learn while playing.

**Description:** Provide localized, curriculum-aligned games per subject and age band.

**Detailed Specifications:**
- Each game tagged by subject, age band, and learning objectives/outcomes.
- Localized content (Arabic primary, English secondary) with Egyptian context.
- Games instrumented for completion and scoring consistent with progress tracking.

**Acceptance Criteria:**
- Each published game has subject, band, and objectives metadata.
- Completion emits progress events with score and completion flag.
- Language toggle works per game where bilingual content exists.

**Diagrams to draw:** Class Diagram (game metadata model), Sequence Diagram (game session -> progress event).

---

#### FR-6: Leaderboards and Friendly Competition
**User Story:** As a child, I want to see my ranking among peers so I can compete in a friendly way.

**Description:** Leaderboards by age group using points, achievements, and completion rates; optional competitions.

**Detailed Specifications:**
- Leaderboards segmented by age band; ranking formula combines points, XP, achievements.
- Optional time-bounded competitions; standings update in near-real time.
- Privacy: display first name or alias; no sensitive data exposed.

**Acceptance Criteria:**
- Leaderboard reflects latest scores within defined update interval.
- Age band filtering works; users do not see other bands.
- Competition standings close and archive at end of period.

**Diagrams to draw:** Use Case Diagram (view leaderboard, join competition), Activity Diagram (ranking refresh).

---

#### FR-7: Parent Dashboard with Screen Time and Activity Insights
**User Story:** As a parent, I want to see my child’s screen time and activity so I can guide healthy habits.

**Description:** Provide parent-facing analytics for time on platform and per-game usage.

**Detailed Specifications:**
- Metrics: total time, per-game time, session counts, daily/weekly trends.
- Visualizations: charts and summaries, exportable reports (e.g., PDF/CSV).
- Multi-child support; respects parental consent and data minimization.

**Acceptance Criteria:**
- Parent can select a child and view time metrics by day/week.
- Data matches backend session/progress logs.
- Exports include the same metrics shown in UI.

**Diagrams to draw:** Use Case Diagram (parent views reports), Sequence Diagram (fetch analytics).

---

#### FR-8: Safety Alerts and Educational Guidance
**User Story:** As a parent, I want educational alerts if risky patterns appear so I can coach safer behavior.

**Description:** Detect excessive gaming, inappropriate content patterns, and potential cyberbullying; deliver guidance.

**Detailed Specifications:**
- Signals: time thresholds, content flags, behavioral/cyberbullying indicators.
- Alerts include context and suggested guidance; avoid punitive blocking by default.
- Escalation to teacher view for school-managed accounts (if applicable).

**Acceptance Criteria:**
- When a configured signal triggers, an alert is generated with guidance text.
- Alerts are visible to authorized parents/teachers only; children receive age-appropriate notices if needed.
- False-positive controls: ability to dismiss/acknowledge and adjust sensitivity.

**Diagrams to draw:** Activity Diagram (detection to alert pipeline), Sequence Diagram (alert delivery).

**WRSPM:** Draw for this requirement.

---

#### FR-9: Class Performance and Progress Overview
**User Story:** As a teacher, I want an overview of class learning so I can identify who needs support.

**Description:** Teacher dashboards with class-level and per-student progress and mastery indicators.

**Detailed Specifications:**
- Views: class aggregate stats, per-student completion, subject mastery signals.
- Filters: subject, time range, age band/class assignment.
- Privacy: only assigned classes/students visible to the teacher.

**Acceptance Criteria:**
- Teacher sees only their classes; unauthorized access blocked.
- Progress and mastery metrics match backend data for the selected range.
- Filters change the dataset and visuals accordingly.

**Diagrams to draw:** Use Case Diagram (teacher views class), Sequence Diagram (fetch class metrics).

---

#### FR-10: Course Assignments and Achievement Tracking
**User Story:** As a teacher, I want to assign games/activities and track completion so I can manage learning goals.

**Description:** Allow teachers to assign subject activities to students/groups and monitor completion and achievements.

**Detailed Specifications:**
- Assignment creation with due dates, subject tags, and target groups/students.
- Tracks completion status, scores, and achievements earned per assignment.
- Feedback/notes channel for teacher to student (and optionally parent visibility).

**Acceptance Criteria:**
- Teacher can create an assignment with targets and due dates; it appears for those students.
- Completion status updates when students finish linked activities.
- Teacher can view achievements earned within the assignment scope and leave feedback.

**Diagrams to draw:** Activity Diagram (create and complete assignment), Sequence Diagram (assignment lifecycle updates).

---
---

## Non-Functional Requirements (NFR)
---
---

### NFR1: Performance and Responsiveness
**Description:** Pages and games shall load within 2 seconds under normal conditions; interactive actions shall respond within 100 ms. The platform shall support at least 1000 concurrent users with graceful degradation.

**Rationale:** Children require fast feedback; delays reduce engagement.

### NFR2: Security and Privacy
**Description:** All data in transit shall use HTTPS/TLS; sensitive data at rest shall be encrypted. Authentication shall use secure tokens with rotation and proper expiration. Parental consent is required for children under 13. The platform shall follow COPPA guidance and local Egyptian privacy laws.

**Rationale:** Protecting children’s data is paramount and regulated.

### NFR3: Usability and Accessibility
**Description:** UI shall be intuitive for ages 3+, with large controls and simple flows. The platform shall meet WCAG 2.1 AA, support screen readers and keyboard navigation, and offer Arabic and English localization.

**Rationale:** Accessibility and localization expand reach and independence.

### NFR4: Scalability and Reliability
**Description:** The system shall scale horizontally; database queries shall be optimized; uptime shall be ≥99.5%. Failures shall be handled gracefully with clear errors and recovery.

**Rationale:** Growth and reliable access are essential for schools and families.

### NFR5: Data Integrity, Backup, and Recovery
**Description:** The system shall perform automated daily backups of user data, progress, achievements, and analytics, with redundant storage. Recovery shall allow restore to any point within the last 30 days. Transactions for critical operations (points, achievements, progress) shall ensure integrity.

**Rationale:** Lost progress harms motivation; integrity builds trust.

### NFR6: Cross-Platform Compatibility and Responsiveness
**Description:** The platform shall function consistently across Chrome, Firefox, Safari, and Edge, on desktop, tablet, and mobile. Phaser games shall maintain performance and visual quality across resolutions from 320px to 1920px, adapting via responsive design.

**Rationale:** Children access via diverse devices; consistency is key.

### NFR7: Observability and Moderation Readiness
**Description:** The system shall include logging and monitoring for key events (auth, progress updates, alerts) with privacy-respecting analytics. Safety signals (cyberbullying, inappropriate content, excessive gaming) shall be traceable for teacher/parent review without exposing sensitive content.

**Rationale:** Observability improves reliability and responsible safety features.

---