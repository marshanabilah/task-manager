import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';

describe('task API', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(':memory:');
  });

  it('creates, updates, lists, and returns newest-first history', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Prepare Invoice', actor: 'john.doe' }).expect(201);
    const taskId = created.body.id as string;

    await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ actor: 'john.doe', status: 'pending' })
      .expect(200);

    await request(app).get('/api/tasks').expect(200).expect(({ body }) => {
      expect(body).toHaveLength(1);
      expect(body[0].status).toBe('pending');
    });

    await request(app).get(`/api/tasks/${taskId}/history`).expect(200).expect(({ body }) => {
      expect(body).toHaveLength(2);
      expect(body[0].changes[0]).toMatchObject({ field: 'status', before: 'to_do', after: 'pending' });
      expect(body[1]).toMatchObject({ actor: 'john.doe', changes: [{ field: 'created', before: null, after: 'created' }] });
    });
  });

  it('rejects task updates without a valid actor', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Prepare Invoice', actor: 'john.doe' }).expect(201);

    await request(app)
      .patch(`/api/tasks/${created.body.id as string}`)
      .send({ status: 'pending' })
      .expect(400);
  });

  it('lists audit history after its task is deleted', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Prepare Invoice', actor: 'john.doe' }).expect(201);
    const taskId = created.body.id as string;

    await request(app).delete(`/api/tasks/${taskId}`).send({ actor: 'alex.lee' }).expect(204);

    await request(app).get('/api/history').expect(200).expect(({ body }) => {
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({ taskTitle: 'Prepare Invoice', actor: 'alex.lee' });
      expect(body[0].changes).toEqual([{ field: 'deleted', before: null, after: 'deleted' }]);
      expect(body[1]).toMatchObject({ taskTitle: 'Prepare Invoice', actor: 'john.doe' });
      expect(body[1].changes).toEqual([{ field: 'created', before: null, after: 'created' }]);
    });
  });
});
