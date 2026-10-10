# Task List: Auditable Mini Task Manager

## Task 1: Establish TypeScript workspace tooling

**Description:** Create the minimal root, client, and server build/test setup needed to run a React frontend and Express API during development.

**Acceptance criteria:**
- [x] Root scripts run development, build, test, and lint commands.
- [x] Client and server TypeScript compilation succeeds in strict mode.
- [x] The development command starts both applications with a documented local API connection.

**Verification:**
- [x] Tests pass: `npm run test`
- [x] Build succeeds: `npm run build`
- [x] Manual check: `npm run dev` started Vite at `127.0.0.1:5173` and the API at `127.0.0.1:3001`.

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `tsconfig.json`
- `client/vite.config.ts`
- `server/tsconfig.json`
- `.gitignore`

**Estimated scope:** Medium: 3-5 files

## Task 2: Define shared task, actor, status, and audit contracts

**Description:** Establish the strongly typed domain model and input validation rules before persistence or UI work begins.

**Acceptance criteria:**
- [x] Shared types represent tasks, immutable audit entries, allowed actors, and the four status values.
- [x] Validation rejects blank titles, unknown actors, invalid statuses, and skipped/backward status transitions.
- [x] Unit tests cover valid and invalid transitions.

**Verification:**
- [x] Tests pass: `npm run test -- server/src/validation.test.ts`
- [x] Build succeeds: `npm run build`
- [x] Manual check: verified the exported actor list and four ordered status values.

**Dependencies:** Task 1

**Files likely touched:**
- `shared/task.ts`
- `shared/audit.ts`
- `server/src/validation.ts`
- `server/src/validation.test.ts`

**Estimated scope:** Medium: 3-4 files

## Task 3: Implement SQLite persistence and append-only audit service

**Description:** Add the schema and service operations that persist tasks, soft-delete tasks, and transactionally record every task update without exposing audit mutation operations.

**Acceptance criteria:**
- [x] Tasks persist title, description, status, timestamps, and soft-deletion state.
- [x] Updates insert one audit record containing actor, field changes, and timestamp in the same transaction.
- [x] History returns oldest-first and survives task deletion; no service method edits or deletes audit entries.

**Verification:**
- [x] Tests pass: `npm run test -- server/src/services/taskService.test.ts`
- [x] Build succeeds: `npm run build`
- [x] Manual check: in-memory database assertions verified updates and retained deleted-task history.

**Dependencies:** Task 2

**Files likely touched:**
- `server/src/db/schema.ts`
- `server/src/db/connection.ts`
- `server/src/services/taskService.ts`
- `server/src/services/taskService.test.ts`
- `server/src/services/auditFormatter.ts`

**Estimated scope:** Medium: 5 files

## Checkpoint: After Tasks 1-3

- [x] All focused tests pass.
- [x] `npm run build` succeeds.
- [x] Review the schema, transaction, and immutable-audit guarantees.

## Task 4: Add validated Express task and history endpoints

**Description:** Expose the task operations and read-only audit-history endpoint through the agreed JSON API.

**Acceptance criteria:**
- [x] The list, create, update, delete, and history routes return documented JSON responses.
- [x] Update routes validate the selected actor and status workflow and return useful 4xx errors.
- [x] The API has no audit mutation endpoint.

**Verification:**
- [x] Tests pass: `npm run test -- server/src/app.test.ts`
- [x] Build succeeds: `npm run build`
- [x] Manual check: API integration tests covered create, update, list, and chronological history.

**Dependencies:** Task 3

**Files likely touched:**
- `server/src/app.ts`
- `server/src/routes/tasks.ts`
- `server/src/routes/tasks.test.ts`
- `server/src/httpErrors.ts`

**Estimated scope:** Medium: 4 files

## Task 5: Add the React API client and selected-user control

**Description:** Let the browser choose a predefined actor, persist that preference locally, and make typed API requests.

**Acceptance criteria:**
- [x] A dropdown offers exactly the three specified actors.
- [x] The selected actor is remembered on refresh and included on every mutation request.
- [x] API failures are rendered as a clear, non-destructive message.

**Verification:**
- [x] Tests pass: `npm run test -- client/src/App.test.tsx`
- [x] Build succeeds: `npm run build`
- [x] Manual check: browser verification confirmed the actor dropdown is available and the chosen actor was sent on update.

**Dependencies:** Task 4

**Files likely touched:**
- `client/src/api/tasks.ts`
- `client/src/hooks/useSelectedActor.ts`
- `client/src/components/ActorSelect.tsx`
- `client/src/components/ActorSelect.test.tsx`
- `client/src/App.tsx`

**Estimated scope:** Medium: 5 files

## Task 6: Deliver create, list, edit, and delete task UI

**Description:** Build the focused task-management interface, including editable title/description, permitted status progression, and non-restorable deletion confirmation.

**Acceptance criteria:**
- [x] Users can create and view active tasks.
- [x] Users can edit title, description, and only a valid next status.
- [x] Users can confirm deletion; deleted tasks disappear from the active list.

**Verification:**
- [x] Tests pass: `npm run test -- client/src/App.test.tsx`
- [x] Build succeeds: `npm run build`
- [x] Manual check: browser verification created and advanced a task using the selected actor.

**Dependencies:** Task 5

**Files likely touched:**
- `client/src/features/tasks/TaskForm.tsx`
- `client/src/features/tasks/TaskList.tsx`
- `client/src/features/tasks/TaskEditor.tsx`
- `client/src/features/tasks/taskComponents.test.tsx`
- `client/src/App.tsx`

**Estimated scope:** Medium: 5 files

## Checkpoint: After Tasks 4-6

- [x] API and UI tests pass.
- [x] `npm run build` succeeds.
- [x] The complete task-management flow works with the predefined actor selector.

## Task 7: Deliver chronological, readable task history UI

**Description:** Add the per-task history view that communicates immutable audit entries in plain language and chronological order.

**Acceptance criteria:**
- [x] A task can open its audit history from the UI.
- [x] Entries display actor, task title, date/time, and before/after field values oldest first.
- [x] The empty-history and load-error states are understandable.

**Verification:**
- [x] Tests pass: `npm run test -- client/src/App.test.tsx`
- [x] Build succeeds: `npm run build`
- [x] Manual check: browser verification displayed `jane.smith` with the `to_do` to `pending` transition in history.

**Dependencies:** Tasks 4 and 6

**Files likely touched:**
- `client/src/features/history/TaskHistory.tsx`
- `client/src/features/history/TaskHistory.test.tsx`
- `client/src/features/history/historyFormat.ts`
- `client/src/App.tsx`

**Estimated scope:** Medium: 4 files

## Task 8: Verify complete audit and deletion flows

**Description:** Add the final cross-layer checks and concise usage documentation for task updates, deletion, and immutable history.

**Acceptance criteria:**
- [x] Tests prove title, description, and status updates all preserve earlier logs.
- [x] Tests prove a deleted task is absent from the active list yet its history remains available.
- [x] The README explains how to run the app and the intentional authentication/audit limitations.

**Verification:**
- [x] Tests pass: `npm run test`
- [x] Build succeeds: `npm run build`
- [x] Manual check: complete task creation, status update, and chronological history were verified in the browser.

**Dependencies:** Task 7

**Files likely touched:**
- `server/src/routes/tasks.test.ts`
- `client/src/App.test.tsx`
- `README.md`

**Estimated scope:** Medium: 3 files

## Checkpoint: Complete

- [x] All tests pass: `npm run test`
- [x] Lint passes: `npm run lint`
- [x] Build succeeds: `npm run build`
- [x] All [SPEC.md](../SPEC.md) success criteria are met.
