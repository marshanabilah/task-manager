import type { Actor, TaskStatus } from './task';

export type AuditChange = {
  field: 'title' | 'description' | 'status' | 'created' | 'deleted';
  before: string | null;
  after: string | null;
};

export type AuditEntry = {
  id: string;
  taskId: string;
  taskTitle: string;
  actor: Actor;
  changes: AuditChange[];
  createdAt: string;
};

export type StatusAuditChange = AuditChange & {
  field: 'status';
  before: TaskStatus;
  after: TaskStatus;
};
