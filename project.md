You are building a full-stack Attendance & Workforce Management system for a software house using Next.js (App Router) + TypeScript on the frontend and Convex as the ONLY backend (database, queries/mutations/actions, auth integration, file storage, and real-time). Do not introduce any other backend. Use modern, production-ready patterns.

# Core Goals

- Track attendance (real-time clock-in/out), face verification, remote work tracking (location/IP/device hints), leave management, projects, and tasks.
- Roles: Admin, Manager (optional), Employee.
- Real-time UI updates everywhere (Convex live queries), optimistic updates, and offline-first basics where possible.
- Clean, modular code with clear separation: UI components, hooks, Convex schema/functions, and security rules.

# Tech & Libraries

- Frontend: Next.js 14+ (App Router), TypeScript, React Server Components with Client Components where needed.
- UI: Tailwind CSS, shadcn/ui, lucide-react icons.
- State: minimal local state + Convex live queries; server actions only when absolutely necessary (prefer Convex).
- Auth: NextAuth.js (or @convex-dev/auth) with email/password + OAuth (Google) if possible; role stored in Convex. Gate routes via middleware and client guards.
- Face verification: client-side TensorFlow.js or face-api.js. Store face embeddings or hashed landmarks in Convex. Compare with cosine similarity on client or in Convex action. DO NOT store raw face images by default; allow user consent & deletion.
- Maps/geo (optional): HTML5 Geolocation API client-side; store coords + accuracy + IP in Convex.
- File storage (optional for profile): Convex storage API for avatars or ID docs with user consent.

# High-Level Features

1. **Auth & Users**

   - Admin can create users; users can self-register if allowed.
   - Admin can add/edit/deactivate users; employees can update their profile (name, photo, face embedding enrollment, location opt-in).
   - Role-based navigation and feature access. Audit log for admin actions.

2. **Attendance**

   - Real-time clock-in/out with running timer.
   - Optional face verification on clock events (compare embedding vs enrolled template).
   - Prevent double clock-in; handle missed clock-out with admin fix flow.
   - Work sessions with metadata: device fingerprint, IP, geo coords, notes (e.g., "client onsite").
   - Daily/weekly summaries, total hours, overtime rules (configurable).

3. **Remote Work Tracking**

   - On clock-in/out, capture location (if permitted), IP, user agent; store accuracy.
   - Geofencing (optional): mark “in-office” vs “remote” based on office polygons/radius.
   - Show location trail per session (first/last ping only; avoid continuous tracking by default).

4. **Leave Management**

   - Leave types (annual, sick, casual, WFH, half-day).
   - Accrual/balance per policy; carryover rules (configurable).
   - Requests with dates, reason, attachments; approval by Admin/Manager; comments thread.
   - Calendar view with filters by team/user/project.

5. **Projects & Tasks**

   - Admin & users can create projects (config: client, billable, hourly rate).
   - Admin creates tasks; users can also add tasks (if enabled). Users can update task status, ETA, and log time.
   - Task states: Backlog → In Progress → Blocked/On Hold → Done. Subtasks checklists, attachments, mentions.
   - Time entry linkage: sessions auto-suggest associated task/project during clock-in or via manual assignment.

6. **Reporting**

   - Dashboards for Admin: attendance heatmap, hours per user/project, tardiness, overtime, leave utilization.
   - Export CSV for payroll (by date range/project).
   - Real-time widgets: Who’s in/out now; users missing clock-out.

7. **Notifications**

   - In-app real-time toasts/badges (Convex).
   - Email for leave approvals/denials & missed clock-outs.
   - Daily summary to user & weekly summary to admin (Convex cron).

8. **Security & Compliance**
   - Strict RBAC in Convex functions. Validate role and document ownership in every query/mutation.
   - PII & biometric guidelines: store only embeddings (vector arrays) or hashed landmarks; provide user consent, view, and delete flows.
   - Audit logs on admin actions and sensitive access.
   - Rate limit sensitive mutations; CSRF & XSS hygiene; input validation with zod.

# Convex Data Model (schema.ts)

- users: { \_id, authId, email, name, role: 'admin'|'manager'|'employee', status: 'active'|'inactive', avatarStorageId?, faceEmbedding?: number[], faceConsentAt?, createdAt, updatedAt }
- profiles: { userId, phone?, title?, department?, locationPrefs?, workSchedule: { tz, weekTemplate }, emergencyContact?, ... }
- attendanceSessions: { userId, clockInAt, clockOutAt?, durationSec?, method: 'web'|'mobile'|'kiosk', verification: { faceScore?: number, ip, ua, geo?: { lat, lng, acc } }, projectId?, taskId?, notes?, closedByAdminId?, createdAt, updatedAt }
- attendancePolicies: { orgId?, overtimeAfterHours?, graceMinutes?, geofences?: [{name, center:{lat,lng}, radiusM}] }
- leaves: { userId, type, startDate, endDate, partial?: 'AM'|'PM', reason, status: 'pending'|'approved'|'rejected'|'canceled', approverId?, comments: [{userId, text, at}], createdAt, updatedAt }
- leaveBalances: { userId, year, type, accrued, used, remaining }
- projects: { \_id, name, code, client?, billable?: boolean, ratePerHour?, ownerId, members: userId[], status: 'active'|'archived', createdAt, updatedAt }
- tasks: { \_id, projectId, creatorId, assignees: userId[], title, description, status, priority, dueAt?, estimateHrs?, tags?: string[], attachments?: storageId[], createdAt, updatedAt }
- timeEntries: { userId, taskId?, projectId?, sessionId?, startedAt, endedAt?, durationSec?, note? }
- notifications: { userId, type, payload, readAt?, createdAt }
- auditLogs: { actorId, action, target: {type, id}, metadata, at }
- orgSettings: { name, locale, tzDefault, workDays, holidays: date[], emailFrom, policiesRefs? }

# Convex Functions (queries/mutations/actions)

Create folders: convex/{auth.ts, schema.ts, users.ts, attendance.ts, leaves.ts, projects.ts, tasks.ts, reports.ts, notifications.ts, audit.ts, policies.ts, cron.ts}.

Examples (define all with validation and RBAC):

- auth.ts: getCurrentUser, requireRole(…)
- users.ts:
  - q: me(), getUser(id), listUsers(filters)
  - m: adminCreateUser(data), adminUpdateUser(id, patch), deactivateUser(id)
  - m: enrollFaceEmbedding(embedding[], consentFlag)
- attendance.ts:
  - m: clockIn({projectId?, taskId?, geo?, requireFace?: boolean, faceEmbedding?})
    - Validate not already clocked in; optional geofence check; compute verification score if face required.
  - m: clockOut({notes?})
    - Close open session; compute duration; write audit.
  - q: myOpenSession(), myRecentSessions(range), liveWhoIsIn()
  - a: reconcileStaleSessions(), fixByAdmin(sessionId, patch)
- leaves.ts:
  - m: requestLeave(data), approveLeave(id), rejectLeave(id), cancelLeave(id)
  - q: myLeaves(range), teamLeaves(range), leaveBalances(userId)
  - a: accrueMonthlyBalances()
- projects.ts:
  - m: createProject(data), updateProject(id, patch), addMember(projectId, userId), removeMember(…)
  - q: listProjects(filter), getProject(id), myProjects()
- tasks.ts:
  - m: createTask(data), updateTask(id, patch), addAssignee(id, userId), logTime({taskId, startedAt, endedAt})
  - q: listTasks(filter), getTask(id), myTasks()
- reports.ts:
  - q: hoursByUser(range), hoursByProject(range), overtimeReport(range), attendanceHeatmap(range)
- notifications.ts:
  - m: push(userId, type, payload), markRead(id)
  - q: inbox()
- audit.ts:
  - m: write(action, target, metadata)
  - q: list(filter)
- cron.ts:
  - a: dailyUserSummary(), weeklyAdminSummary(), closeOldSessions(), sendLeaveReminders()

All functions must check auth and roles. Use zod schemas for input validation.

# Face Verification Flow

- Enroll: On profile page, user captures 3–5 face images (client-side), create averaged embedding (TensorFlow.js or face-api.js), store as float32[] or compressed representation in Convex after explicit consent.
- Verify on clock-in: capture current embedding; compute cosine similarity against enrolled template; if score ≥ threshold (e.g., 0.85), mark verification.pass=true with score; else block or require admin override.
- Privacy: Never store raw frames by default. Provide “Delete biometric data” button to purge embedding.

# Next.js App Structure (app/)

- app/(auth)/signin, signup (if allowed)
- app/(dashboard)/dashboard (role-aware panels)
- app/attendance
  - page: clock widget (face capture modal), open session card, history table
- app/leaves
  - request form, balances, team calendar (admin/manager)
- app/projects
  - list/create/update; members management
- app/tasks
  - kanban & table views, task drawer, time logging
- app/admin/users
  - CRUD users, role & status, reset face data, impersonate (optional)
- app/reports
  - hours by user/project, heatmap, exports
- app/settings
  - org policies, geofences, holidays

# UI Components (src/components)

- AuthGuard, RoleGuard
- ClockWidget (timer, face modal, geo capture)
- FaceCaptureModal (camera feed, capture, show similarity result)
- GeoConsentBanner
- AttendanceTable, SessionsChart
- LeaveRequestForm, LeaveCalendar
- ProjectForm, TaskKanban, TaskTable, TaskDrawer
- ReportsCards, ExportButton
- NotificationsBell
- AdminUserTable, UserForm
- AuditLogTable

# Hooks & Utils (src/lib, src/hooks)

- useLiveQuery wrappers for Convex queries.
- useFace (load models, get embedding, compare cosine).
- useGeo (request permission, capture coords).
- device fingerprint util (hash of UA + platform + time skew).
- time utils (TZ handling, overtime calculation).
- rbac utils (canEditTask, canApproveLeave, etc).
- csv export util.

# Routing & Security

- Middleware to protect app routes; redirect unauthenticated to /signin.
- Client guards for role-based sections.
- Convex functions enforce RBAC regardless of UI.

# Developer Experience

- Strict TypeScript, ESLint, Prettier.
- zod schemas for all form inputs and Convex endpoints.
- Seed script (Convex action) to create admin, policies, demo data.
- Example .env: NEXTAUTH_SECRET, OAUTH keys (if any), CONVEX deployment keys, EMAIL_FROM, MAPS_KEY (optional).

# Testing

- Unit tests for utils (cosine similarity, overtime calc).
- Component tests for ClockWidget and Task forms.
- Convex function tests (where feasible) using Convex testing utilities.

# Reporting & Exports

- CSV exports for: attendance by period, project hours, leave ledger.
- Simple charts using Recharts; avoid blocking SSR by lazy-loading charts.

# Accessibility & i18n

- Keyboard navigable modals; ARIA labels.
- Basic i18n scaffolding (en + placeholders).

# Acceptance Criteria (must-have)

- User can enroll face (consent), clock in with face check, clock out, and see running timer live.
- Admin can create/edit/deactivate users; reset a user’s face data.
- Admin/Manager can approve/reject leave; balances update via cron.
- Users can create projects and tasks (per org setting), admin can also create tasks; users can update tasks and log time.
- Real-time “Who’s In” widget reflects sessions without refresh.
- Reports show hours by user/project and export CSV.
- All sensitive mutations and queries enforce RBAC and input validation.
- Audit logs for admin actions and attendance adjustments.
- Biometric data can be viewed and deleted by the user at any time.

# Implementation Hints

- Prefer Convex mutations for writes; queries for live dashboards; actions for heavy/cron tasks.
- Use optimistic updates for task/status changes; for clock-in/out rely on mutation return.
- Cosine similarity threshold configurable in orgSettings.
- Handle “missed clock-out” by cron after configurable cutoff.
- Show banners if location permissions denied; system still works without geo.
- Use Suspense boundaries and skeletons for live lists.

Deliver:

1. Convex schema.ts with collections described above.
2. A minimal but working set of Convex queries/mutations for users, attendance, leaves, projects, tasks.
3. Next.js pages/routes with role-guarded layouts.
4. Face enrollment & verification components with client-side model loading and embedding compare.
5. Seed script and demo data.
6. Documentation README with setup steps (Convex deploy, NextAuth config, env vars).

Build clean, typed, and production-ready code with comments where non-obvious.
