import { describe, expect, it } from 'vitest';
import { createTaskService } from './taskService';

describe('task service', () => {
  it('writes a readable audit entry for every changed field', () => {
    const service = createTaskService(':memory:');
    const task = service.create({ title: 'Prepare Invoice', description: 'Draft it' });

    service.update(task.id, 'john.doe', {
      title: 'Send Invoice',
      description: 'Send it today',
      status: 'pending',
    });

    expect(service.history(task.id)).toMatchObject([
      {
        actor: 'john.doe',
        taskTitle: 'Send Invoice',
        changes: [
          { field: 'title', before: 'Prepare Invoice', after: 'Send Invoice' },
          { field: 'description', before: 'Draft it', after: 'Send it today' },
          { field: 'status', before: 'to_do', after: 'pending' },
        ],
      },
    ]);
  });

  it('retains audit history after a task is deleted', () => {
    const service = createTaskService(':memory:');
    const task = service.create({ title: 'Prepare Invoice' });

    service.update(task.id, 'jane.smith', { status: 'pending' });
    service.remove(task.id, 'jane.smith');

    expect(service.list()).toEqual([]);
    expect(service.history(task.id)).toHaveLength(1);
  });
});
