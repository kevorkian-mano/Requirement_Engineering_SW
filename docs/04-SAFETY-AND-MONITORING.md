# Safety, Monitoring, and Cyberbullying Protection

## Overview
A unified safety layer that combines real-time cyberbullying detection, behavioral monitoring, screen-time tracking, and progressive consequences. Designed for children-first UX: educate, nudge, escalate only when needed, and keep parents/teachers in the loop.

---

## Architecture
- **Three-layer cyberbullying detection**: Text → Behavioral → Social graph, orchestrated by `cyberbullying.service.ts`.
- **Monitoring pipeline**: Activity logger → Screen-time aggregator → Pattern detectors → Alerts → Parent/teacher notifications.
- **Feedback loop**: Alerts feed incident service; consequences update violation log; parent notifications and dashboards close the loop.

### Detection Stack (3 Layers)
1. **Text Analysis (real-time)**
   - Keyword/phrase and sentiment scan; caps/excess punctuation; repetition rate.
   - Blocks or sanitizes messages before posting; creates incidents for severe/repeat cases.
2. **Behavioral Analysis (periodic, ~daily/weekly)**
   - Looks at 2-week performance history, play frequency, hint usage, time-spent deltas.
   - Flags distress (drops, avoidance, excessive play) and writes anomalies.
3. **Social Network Analysis (periodic, ~weekly/bi-weekly)**
   - Builds peer graph from shared sessions; detects isolation, exclusion, coordinated bullying.

### Monitoring Stack
- **Activity Tracking**: Logs every gameplay/content action with duration, metadata, risk flags.
- **Screen Time**: Aggregates session durations by day/week/month; enforces age-based limits and break reminders.
- **Alert Engine**: Generates cyberbullying, inappropriate content, excessive gaming, and screen-time-limit alerts with severity.
- **Notification Layer**: Parents/teachers get actionable alerts; victims/offenders get educational guidance.

---

## Detection Patterns & Thresholds

### Text/Message Patterns
- Harsh insults: "stupid", "idiot", "dumb", "loser".
- Threats: "kill", "hurt", "beat", "punch".
- Mocking/exclusion: "you suck", "nobody likes you", "you are not welcome".
- Harassment cadence: rapid repeats (>10 msgs/min), excessive caps/punctuation.
- Actions: first offense warn/block; repeat offenses create incidents and escalate consequences.

### Behavioral Distress Patterns
- Score drop ≥20% vs. baseline → alert.
- Game avoidance ≥60% of usual titles → alert.
- Play frequency: <20% of days (withdrawal) or >90% (avoidance coping) → alert.
- Hint usage: sudden stop after frequent use → confidence loss alert.
- Time spent: >100% increase week-over-week → anxiety alert.

### Social Graph Patterns
- Isolation: social score <2σ below class mean → medium severity.
- Exclusion: plays <30% of peers' group games → medium severity.
- Coordinated bullying: multiple offenders targeting one victim in short window → high severity.

### Screen Time & Gaming Thresholds (configurable)
- Age 3–5: 30 min/day; Age 6–8: 60 min/day; Age 9–12: 120 min/day.
- Continuous play >2h → warning; daily game time >4h → high alert.
- No break >1h → break reminder; late-night activity (>21:00) → alert.

---

## Monitoring System (What We Track)
- **Activity events**: game_played, content_viewed, message_sent, search_performed, achievement_unlocked.
- **Session metrics**: start/end timestamps, duration, peak hours, per-activity breakdown.
- **Risk flags**: cyberbullying, inappropriate_content, excessive_gaming, screen_time_limit.

---

## Alert Generation & Notifications
- **Alert types**: cyberbullying, inappropriate_content, excessive_gaming, screen_time_limit.
- **Severity**: low | medium | high | critical; derived from thresholds above.
- **Who gets notified**:
  - **Parents**: repeat offenses (violation ≥2), high/critical alerts, screen-time violations.
  - **Teachers**: every cyberbullying incident, behavioral anomalies, class summaries.
  - **Students**: educational, non-punitive messaging; guided actions.
- **Channels**: in-app alerts, email/SMS hooks (extensible), dashboard counters.
- **Acknowledgment**: alerts can be marked read/acknowledged; incidents flow to review.

---

## Consequence Progression System
| Violation Count | Actions | Duration | Status |
| --- | --- | --- | --- |
| 1st | Warning, 1h message timeout, parent notified | 1h | active |
| 2nd | 24h chat ban, kindness training, apology letter, parent conversation | 24h | active |
| 3rd | 1 week restriction from group activities, counselor meeting, empathy course | 7d | restricted |
| 4th+ | Account restricted/suspended, admin review, school disciplinary path | indefinite | banned |

---

## Database Schemas (Key Collections)
```typescript
// Activity Logs
activities: {
  userId: ObjectId;
  activityType: 'game_played' | 'content_viewed' | 'message_sent' | 'search_performed';
  timestamp: Date;
  duration: number; // seconds
  metadata: {
    gameId?: string;
    contentUrl?: string;
    messageContent?: string;
    searchQuery?: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[]; // ['cyberbullying', 'inappropriate_content', ...]
}

// Screen Time Records
screenTime: {
  userId: ObjectId;
  date: Date;
  totalMinutes: number;
  sessionCount: number;
  averageSessionDuration: number;
  peakHours: number[];
  gameTime: number;
  learningTime: number;
  breakTime: number;
}

// Alerts
alerts: {
  userId: ObjectId;
  alertType: 'cyberbullying' | 'inappropriate_content' | 'excessive_gaming' | 'screen_time_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  details: {
    detectedContent?: string;
    detectedPattern?: string;
    recommendedAction: string;
    educationalMessage: string;
  };
  status: 'pending' | 'acknowledged' | 'resolved';
  notifiedUsers: ObjectId[]; // parents/teachers
}

// Cyberbullying Incidents
cyberbullying_incidents: {
  reportedStudentId: ObjectId;
  victimStudentId: ObjectId;
  teacherId: ObjectId;
  incidentType: 'text_analysis' | 'behavioral' | 'social_network' | 'manual_report';
  description: string;
  flaggedContent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  flagReasons: string[];
  teacherNotes: string;
  victimNotified: boolean;
  parentNotified: boolean;
  appliedConsequences: string[];
  offenderViolationCount: number;
}

// Behavioral Anomalies
behavioral_anomalies: {
  studentId: ObjectId;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  metrics: object;
  teacherNotified: boolean;
  teacherResponse: string;
  status: 'new' | 'investigating' | 'addressed' | 'resolved';
}

// Violation Logs
cyberbullying_violation_logs: {
  studentId: ObjectId;
  violationType: string;
  violationCount: number;
  firstViolationDate: Date;
  lastViolationDate: Date;
  status: 'active' | 'restricted' | 'banned';
  currentRestrictionEndDate: Date;
  appliedConsequences: string[];
  relatedIncidents: ObjectId[];
}
```

---

## API Endpoints (Safety & Monitoring)
Base path uses project conventions; replace `{id}` with ObjectId strings.

### Monitoring
- `POST /monitoring/activity` — log an activity event.
- `GET /monitoring/screen-time/:userId?range=day|week|month&startDate&endDate` — screen-time summary.
- `GET /monitoring/activity/:userId?range=day|week|month` — activity log.
- `GET /monitoring/class` — class-level activity (teacher only).
- `GET /monitoring/analytics/:userId` — analytics summary.
- `GET /monitoring/patterns/:userId` — behavior patterns.

### Alerts
- `POST /alerts/detect` — run text/content detection for a snippet.
- `POST /alerts/check-gaming` — evaluate daily screen-time overage.
- `GET /alerts/:userId?unreadOnly=true|false` — user alerts.
- `GET /alerts/parent/all` — parent view of children’s unread alerts.
- `PUT /alerts/:id/read` — mark alert as read.

### Cyberbullying
- `POST /cyberbullying/check-message` — pre-post message scan.
- `GET /cyberbullying/student/:studentId/safety-profile` — student risk snapshot.
- `GET /cyberbullying/incidents/student/:studentId?role=reported|victim` — incident history.
- `GET /cyberbullying/incidents/pending` — pending incidents (teacher).
- `PUT /cyberbullying/incidents/:incidentId/review` — teacher review/decision.
- `PUT /cyberbullying/incidents/:incidentId/apply-consequences` — apply restrictions/training.
- `POST /cyberbullying/incidents/:incidentId/notify-victim` — notify victim.
- `POST /cyberbullying/incidents/:incidentId/notify-parent` — notify offender’s parent.
- `GET /cyberbullying/statistics/classroom?timeWindowDays=30` — class stats.
- `GET /cyberbullying/dashboard?classroomId=...` — safety dashboard.
- `GET /cyberbullying/analysis/hotspots?classroomId=...` — hotspot analysis.
- `POST /cyberbullying/analyze/behavior/:studentId` — run behavioral analysis.
- `POST /cyberbullying/analyze/social` — run social graph analysis.
- `POST /cyberbullying/full-check/:studentId` — full 3-layer check.

---

## Parent Notifications (Policy)
- Trigger on: violation count ≥2, severity high/critical, screen-time limit reached, repeated text flags.
- Content includes: what was detected, why it matters, recommended conversation tips, next steps taken.
- Rate limiting: debounce repeat notifications within short windows to avoid overload.

---

## Operational Notes
- Schedule behavioral analysis daily (~02:00) and social analysis weekly (~03:00 Sunday).
- Log every alert action (created, acknowledged, resolved) for audit.
- Keep thresholds configurable per age group/class; expose configs to admins.
- "Teach, don’t block": default to educational prompts unless high/critical severity.
