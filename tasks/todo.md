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
- [ ] Tasks persist title, description, status, timestamps, and soft-deletion state.
- [ ] Updates insert one audit record containing actor, field changes, and timestamp in the same transaction.
- [ ] History returns oldest-first and survives task deletion; no service method edits or deletes audit entries.

**Verification:**
- [ ] Tests pass: `npm run test -- server/src/services`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: inspect a local database after an update and deletion.

**Dependencies:** Task 2

**Files likely touched:**
- `server/src/db/schema.ts`
- `server/src/db/connection.ts`
- `server/src/services/taskService.ts`
- `server/src/services/taskService.test.ts`
- `server/src/services/auditFormatter.ts`

**Estimated scope:** Medium: 5 files

## Checkpoint: After Tasks 1-3

- [ ] All focused tests pass.
- [ ] `npm run build` succeeds.
- [ ] Review the schema, transaction, and immutable-audit guarantees.

## Task 4: Add validated Express task and history endpoints

**Description:** Expose the task operations and read-only audit-history endpoint through the agreed JSON API.

**Acceptance criteria:**
- [ ] The list, create, update, delete, and history routes return documented JSON responses.
- [ ] Update routes validate the selected actor and status workflow and return useful 4xx errors.
- [ ] The API has no audit mutation endpoint.

**Verification:**
- [ ] Tests pass: `npm run test -- server/src/routes`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: create, update, delete, and retrieve task history with an HTTP client.

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
- [ ] A dropdown offers exactly the three specified actors.
- [ ] The selected actor is remembered on refresh and included on every mutation request.
- [ ] API failures are rendered as a clear, non-destructive message.

**Verification:**
- [ ] Tests pass: `npm run test -- client/src`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: refresh after selecting an actor and confirm the selection remains.

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
- [ ] Users can create and view active tasks.
- [ ] Users can edit title, description, and only a valid next status.
- [ ] Users can confirm deletion; deleted tasks disappear from the active list.

**Verification:**
- [ ] Tests pass: `npm run test -- client/src/features/tasks`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: complete the CRUD flow for each predefined actor.

**Dependencies:** Task 5

**Files likely touched:**
- `client/src/features/tasks/TaskForm.tsx`
- `client/src/features/tasks/TaskList.tsx`
- `client/src/features/tasks/TaskEditor.tsx`
- `client/src/features/tasks/taskComponents.test.tsx`
- `client/src/App.tsx`

**Estimated scope:** Medium: 5 files

## Checkpoint: After Tasks 4-6

- [ ] API and UI tests pass.
- [ ] `npm run build` succeeds.
- [ ] The complete task-management flow works for all predefined actors.

## Task 7: Deliver chronological, readable task history UI

**Description:** Add the per-task history view that communicates immutable audit entries in plain language and chronological order.

**Acceptance criteria:**
- [ ] A task can open its audit history from the UI.
- [ ] Entries display actor, task title, date/time, and before/after field values oldest first.
- [ ] The empty-history and load-error states are understandable.

**Verification:**
- [ ] Tests pass: `npm run test -- client/src/features/history`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: verify the rendered status example matches the approved wording.

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
- [ ] Tests prove title, description, and status updates all preserve earlier logs.
- [ ] Tests prove a deleted task is absent from the active list yet its history remains available.
- [ ] The README explains how to run the app and the intentional authentication/audit limitations.

**Verification:**
- [ ] Tests pass: `npm run test`
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: complete the full acceptance flow in the browser.

**Dependencies:** Task 7

**Files likely touched:**
- `server/src/routes/tasks.test.ts`
- `client/src/App.test.tsx`
- `README.md`

**Estimated scope:** Medium: 3 files

## Checkpoint: Complete

- [ ] All tests pass: `npm run test`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] All [SPEC.md](../SPEC.md) success criteria are met.
