export const TASK_STATUSES = ['to_do', 'pending', 'in_progress', 'done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const ACTORS = ['john.doe', 'jane.smith', 'alex.lee'] as const;

export type Actor = (typeof ACTORS)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TaskUpdate = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
};
