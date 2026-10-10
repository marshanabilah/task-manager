# Implementation Plan: Auditable Mini Task Manager

## Overview

Build a compact React/TypeScript task manager backed by Express/TypeScript and SQLite. Users select a predefined actor, manage tasks, and view a chronological immutable history for each task update. The build will proceed in thin vertical slices so persistence and API behaviour are proven before the UI depends on them.

## Architecture Decisions

- Use a single repository with `client/`, `server/`, and `shared/` directories so the browser and API share task and audit types without duplicating contracts.
- Store tasks and audit entries in SQLite. Deletion is a task soft-delete; audit entries are append-only and never cascade-delete.
- Keep the actor list fixed in server code: `john.doe`, `jane.smith`, and `alex.lee`. The browser remembers the current selection, but the server validates it on each write.
- Use an explicit `TaskStatus` union and reject changes that skip or reverse `to_do` → `pending` → `in_progress` → `done`.
- Implement each task update and its audit insert in one database transaction. This keeps the task's current state and its history consistent.
- Return audit history oldest first, with the server generating presentation-ready change details from stored before/after values.

## Dependency Graph

```text
Tooling and shared contracts
             │
             ├── SQLite schema and task/audit service
             │             │
             │             └── Express task and history API
             │                            │
             └────────────────────────────┼── React API client and actor selection
                                          │              │
                                          │              ├── Task list, create, and edit UI
                                          │              │              │
                                          └──────────────┴── Task history UI and end-to-end verification
```

## Task List

The detailed, executable checklist lives in [todo.md](todo.md).

### Phase 1: Foundation

- [ ] Task 1: Establish TypeScript workspace tooling
- [ ] Task 2: Define shared task, actor, status, and audit contracts
- [ ] Task 3: Implement SQLite persistence and append-only audit service

### Checkpoint: Foundation

- [ ] Focused service tests pass and the workspace builds.
- [ ] Review the schema and transaction behaviour before exposing it through HTTP.

### Phase 2: Task management

- [ ] Task 4: Add validated Express task and history endpoints
- [ ] Task 5: Add the React API client and selected-user control
- [ ] Task 6: Deliver create, list, edit, and delete task UI

### Checkpoint: Core flow

- [ ] API tests and UI tests pass.
- [ ] A user can manage a task under each predefined actor.

### Phase 3: Audit history

- [ ] Task 7: Deliver chronological, readable task history UI
- [ ] Task 8: Verify the complete audit and deletion flows

### Checkpoint: Complete

- [ ] All spec success criteria pass.
- [ ] Production build, lint, and test commands succeed.
- [ ] Ready for human review.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Task updates and log inserts diverge | High | Use one SQLite transaction and integration tests for every editable field. |
| Browser-selected actor is spoofed | Medium | Treat the selection as input; validate it against the server allow-list. |
| Status flow is unclear in the UI | Medium | Disable unavailable transitions and show the next valid status. |
| Soft-deleted tasks leak into the active list | Medium | Put the active-record filter in the repository query and test it. |
| Native SQLite package setup differs by machine | Low | Pin the selected library and verify install/build before feature work continues. |

## Open Questions

- Before implementation, approve the initial dependencies: Vite/React, Express, Vitest, and a SQLite driver such as `better-sqlite3`. No dependencies will be installed until then.
