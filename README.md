# Task Manager

A small React and Express task manager with a local SQLite database and an immutable creation, update, and deletion history.

## Run it

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173` (or the next port Vite reports). The API runs on port `3001`.

## Architecture

```text
Browser
  React + TypeScript
  - active tasks, history, and task modals
  - selected fixed actor
          |
          | HTTP /api
          v
Node.js + Express + TypeScript
  - validates tasks, actors, and status progression
  - creates immutable audit entries with each mutation
          |
          v
SQLite
  - tasks (soft-deleted when removed)
  - audit_entries (append-only)
```

`shared/` contains the task, status, actor, and audit TypeScript contracts used by both the client and server. Creating, updating, or deleting a task is handled in one database transaction with its audit entry, so the task state and history remain consistent.

## Verification

```sh
npm run test
npm run lint
npm run build
```

## Scope

- Choose one of the fixed users: `john.doe`, `jane.smith`, or `alex.lee`.
- Create, edit, list, and delete tasks.
- Move status forward only: `to_do` to `pending` to `in_progress` to `done`.
- Every task update records the selected user, changed values, and timestamp. Audit entries are read-only and stay available after deletion.

This version intentionally has no real authentication, accounts, or restoration of deleted tasks.
