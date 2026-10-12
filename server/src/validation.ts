import { ACTORS, TASK_STATUSES, type Actor, type TaskStatus, type TaskUpdate } from '../../shared/task';

type TaskUpdateInput = {
  actor?: unknown;
  description?: unknown;
  status?: unknown;
  title?: unknown;
};

export function validateActor(value: unknown): Actor {
  if (typeof value !== 'string' || !ACTORS.includes(value as Actor)) {
    throw new Error('Actor must be one of the predefined users');
  }

  return value as Actor;
}

export function validateTaskUpdate(input: TaskUpdateInput): TaskUpdate {
  const update: TaskUpdate = {};

  if (input.actor !== undefined) {
    validateActor(input.actor);
  }

  if (input.title !== undefined) {
    if (typeof input.title !== 'string' || input.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    update.title = input.title.trim();
  }

  if (input.description !== undefined) {
    if (input.description !== null && typeof input.description !== 'string') {
      throw new Error('Description must be text or null');
    }

    update.description = input.description === null ? null : input.description.trim();
  }

  if (input.status !== undefined) {
    if (typeof input.status !== 'string' || !TASK_STATUSES.includes(input.status as TaskStatus)) {
      throw new Error('Status is invalid');
    }

    update.status = input.status as TaskStatus;
  }

  return update;
}
