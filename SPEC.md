# Spec: Auditable Mini Task Manager

## Objective

Build a deliberately small web-based task manager where a user can create, list, edit, and delete tasks. The application must make task-status changes traceable: users can see who changed a task's status, when it happened, and the previous and new status.

The primary user is a small team sharing one task list. Success means a user can complete ordinary task management without confusion and can inspect a task's history to answer “who changed this, when, and what changed?”

### User stories

- As a user, I can select one of the predefined users before managing tasks so audit records identify the actor.
- As a user, I can add a task with a title and optional description from the active-task view.
- As a user, I can view all active tasks.
- As a user, I can update a task's title, description, or status and see a clear record of what changed.
- As a user, I can delete a task and retain its historical record.
- As a user, I can open a task's history and understand the sequence of changes without reading raw data.

## Tech Stack

- Frontend: React with TypeScript, built with Vite.
- Backend: Node.js, Express, and TypeScript.
- Data: SQLite through a TypeScript-compatible data-access layer.
- Actor: a selected predefined v1 user; real sign-in is explicitly out of scope.
- API: JSON over HTTP, served locally during development.

## Commands

The initial repository will provide these root scripts:

```sh
npm install
npm run dev
npm run build
npm run test
npm run lint
```

`npm run dev` starts the frontend and API together. `npm run build`, `npm run test`, and `npm run lint` must succeed before a change is considered complete.

## Project Structure

```text
client/                 React application
client/src/components/  Reusable UI components
client/src/features/    Task-list and task-history UI
server/                 Express application
server/src/routes/      HTTP endpoints
server/src/services/    Task and audit business rules
server/src/db/          Schema and data access
shared/                 Types shared by client and server
tests/                  API and UI-focused tests
```

## Functional Requirements

### Tasks

- A task has an id, title, optional description, status, created timestamp, updated timestamp, and deleted timestamp when applicable.
- Valid statuses are `to_do`, `pending`, `in_progress`, and `done`.
- A task may move between any of the four statuses: `to_do`, `pending`, `in_progress`, and `done`.
- A title is required, trimmed, and must not be empty.
- The active-task list excludes deleted tasks and displays each task's title, description when present, and latest update time.
- Users can create tasks and update their title, description, or status through clear controls with inline validation.
- Deleting a task requires confirmation and removes it from the active list.

### Audit trail

- The v1 actor is selected through a dropdown of predefined users: `john.doe`, `jane.smith`, and `alex.lee`. The selected user persists locally in the browser for later actions.
- No sign-in, user creation, role management, or editable display name is included.
- Every task creation, update, and deletion appends an immutable audit record containing: id, task id, task title at the time of change, actor, timestamp, and the fields that changed with their previous and new values.
- For a status update, the record specifically includes the prior and new status. For example: `User "john.doe" changed Task "Prepare Invoice" status from "pending" to "in_progress" at 2025-01-01 10:00`.
- For title or description changes, the record uses the same readable before/after format. For example: `User "jane.smith" changed Task title from "Prepare Invoice" to "Send Invoice" at 2025-01-01 10:00`.
- The server creates the audit record in the same database operation as the task mutation. A creation, update, or deletion must not succeed without its audit record.
- Audit records cannot be edited or deleted through the API or UI. Updating or deleting a task must never remove its earlier audit records.
- A dedicated history view presents records newest first with a plain-language summary and local date/time, including records for deleted tasks. An active task also exposes its own audit history in a modal. For example: `User "john.doe" changed Task "Prepare Invoice" status from "pending" to "in_progress" at 2025-01-01 10:00`.
- A deleted task's history remains retrievable by its id even though it is absent from the active list.

### API

- `GET /api/tasks` lists active tasks.
- `POST /api/tasks` creates a task and audit entry. It requires the selected actor.
- `PATCH /api/tasks/:id` updates a task. Every successful update creates its immutable audit entry.
- `DELETE /api/tasks/:id` soft-deletes a task and audit entry.
- `GET /api/tasks/:id/history` returns the task's audit entries.
- Mutating requests identify the selected predefined actor. The server validates that it is in the allowed user list and produces audit records; the client must not be trusted to create or modify audit entries itself.

## Code Style

- TypeScript strict mode is enabled; avoid `any`.
- Use `camelCase` for variables/functions, `PascalCase` for React components and types, and descriptive names over abbreviations.
- Keep route handlers thin and place state-changing logic in services.
- Validate request input at the API boundary and return predictable JSON errors.

```ts
function describeStatusChange(
  task: Task,
  nextStatus: TaskStatus,
  actor: PredefinedUser,
): string {
  return `User "${actor}" changed Task "${task.title}" status from ` +
    `"${task.status}" to "${nextStatus}"`;
}
```

## Testing Strategy

- Unit-test validation and audit-summary generation in `server/src/**/*.test.ts`.
- Integration-test task creation, title, description, and status updates, including their audit records and newest-first history response.
- Component-test forms, the active task list, and readable history states.
- Include tests proving deleted tasks are excluded from the list but retain history, and that audit entries cannot be changed or deleted.
- Cover the key task and audit flows; exact coverage thresholds will be set with the initial test tooling.

## Boundaries

- Always: validate all API input, generate audit entries for every task creation, update, and deletion on the server, use accessible form controls, run lint/build/tests before completion, and keep the interface focused on task management and history.
- Ask first: add authentication or authorization, add third-party services, change the approved SQLite database/schema, add dependencies beyond the selected stack, or add features such as task assignment, due dates, notifications, filtering, or collaboration presence.
- Never: store credentials or secrets in the repository, allow the client to write or modify audit entries directly, permanently erase audit records through normal task deletion, or remove failing tests merely to make a build pass.

## Success Criteria

- A user can create, list, edit, and delete tasks from the browser.
- Every task update records the selected predefined actor, task title, timestamp, each changed field, and its prior/new value.
- History appears chronologically in the UI with the specified plain-language explanation; status entries include their prior and new statuses.
- The task history remains readable after its task is deleted.
- An active task can display only its own audit entries in a modal.
- The API rejects empty titles and invalid statuses.
- The API offers no endpoint that can modify or delete an audit record.
- The project builds, lints, and passes its task/audit test suite.

## Open Questions

None. The initial scope is fully defined.

## Approved Decisions

- The v1 actor is selected from `john.doe`, `jane.smith`, and `alex.lee`; real authentication is out of scope.
- SQLite is the v1 database.
- Title, description, and status are editable.
- Statuses are `to_do`, `pending`, `in_progress`, and `done`; tasks can move between them without a fixed sequence.
- Deletion is not restorable from the UI; its audit history remains available.
