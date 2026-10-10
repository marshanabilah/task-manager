# Task Manager

A small React and Express task manager with a local SQLite database and an immutable creation, update, and deletion history.

## Run it

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173` (or the next port Vite reports). The API runs on port `3001`.

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
