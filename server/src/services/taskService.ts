import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import type { AuditChange, AuditEntry } from '../../../shared/audit';
import type { Actor, Task, TaskStatus, TaskUpdate } from '../../../shared/task';
import { validateTaskUpdate } from '../validation';

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type AuditRow = {
  id: string;
  task_id: string;
  task_title: string;
  actor: Actor;
  changes: string;
  created_at: string;
};

function asTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function asAuditEntry(row: AuditRow): AuditEntry {
  return {
    id: row.id,
    taskId: row.task_id,
    taskTitle: row.task_title,
    actor: row.actor,
    changes: JSON.parse(row.changes) as AuditChange[],
    createdAt: row.created_at,
  };
}

export function createTaskService(databasePath = 'task-manager.sqlite') {
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_entries (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      task_title TEXT NOT NULL,
      actor TEXT NOT NULL,
      changes TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );
  `);

  function getTask(id: string): Task {
    const row = database
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(id) as TaskRow | undefined;

    if (!row) {
      throw new Error('Task not found');
    }

    return asTask(row);
  }

  const create = database.transaction((input: { title: string; description?: string | null }, actor: Actor): Task => {
    const title = input.title.trim();
    if (!title) {
      throw new Error('Title is required');
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title,
      description: input.description?.trim() || null,
      status: 'to_do',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    database
      .prepare(
        'INSERT INTO tasks (id, title, description, status, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .run(task.id, task.title, task.description, task.status, now, now, null);
    database
      .prepare(
        'INSERT INTO audit_entries (id, task_id, task_title, actor, changes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(randomUUID(), task.id, task.title, actor, JSON.stringify([{ field: 'created', before: null, after: 'created' }]), now);

    return task;
  });

  const update = database.transaction((id: string, actor: Actor, input: TaskUpdate) => {
    const before = getTask(id);
    if (before.deletedAt) {
      throw new Error('Task not found');
    }

    const change = validateTaskUpdate(input);
    const after = { ...before, ...change };
    const changes = (Object.keys(change) as Array<keyof TaskUpdate>)
      .filter((field) => before[field] !== after[field])
      .map((field) => ({
        field,
        before: before[field] ?? null,
        after: after[field] ?? null,
      })) as AuditChange[];

    if (changes.length === 0) {
      return before;
    }

    const now = new Date().toISOString();
    database
      .prepare('UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = ? WHERE id = ?')
      .run(after.title, after.description, after.status, now, id);
    database
      .prepare(
        'INSERT INTO audit_entries (id, task_id, task_title, actor, changes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(randomUUID(), id, after.title, actor, JSON.stringify(changes), now);

    return { ...after, updatedAt: now };
  });

  return {
    create,
    get: getTask,
    list(): Task[] {
      return (database
        .prepare('SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY created_at DESC')
        .all() as TaskRow[]).map(asTask);
    },
    update,
    remove: database.transaction((id: string, actor: Actor): void => {
      const task = getTask(id);
      if (task.deletedAt) {
        throw new Error('Task not found');
      }
      const now = new Date().toISOString();
      database.prepare('UPDATE tasks SET deleted_at = ? WHERE id = ?').run(now, id);
      database
        .prepare(
          'INSERT INTO audit_entries (id, task_id, task_title, actor, changes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .run(randomUUID(), id, task.title, actor, JSON.stringify([{ field: 'deleted', before: null, after: 'deleted' }]), now);
    }),
    history(id: string): AuditEntry[] {
      getTask(id);
      return (database
        .prepare('SELECT * FROM audit_entries WHERE task_id = ? ORDER BY created_at DESC, rowid DESC')
        .all(id) as AuditRow[]).map(asAuditEntry);
    },
    allHistory(): AuditEntry[] {
      return (database
        .prepare('SELECT * FROM audit_entries ORDER BY created_at DESC, rowid DESC')
        .all() as AuditRow[]).map(asAuditEntry);
    },
  };
}
