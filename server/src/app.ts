import express from 'express';
import { createTaskService } from './services/taskService';
import { validateActor } from './validation';

export function createApp(databasePath?: string) {
  const app = express();
  const tasks = createTaskService(databasePath);

  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/tasks', (_request, response) => {
    response.json(tasks.list());
  });

  app.get('/api/history', (_request, response) => {
    response.json(tasks.allHistory());
  });

  app.post('/api/tasks', (request, response) => {
    const body = request.body as { title?: unknown; description?: unknown };
    if (typeof body.title !== 'string' || !body.title.trim()) {
      response.status(400).json({ error: 'Title is required' });
      return;
    }
    if (body.description !== undefined && typeof body.description !== 'string' && body.description !== null) {
      response.status(400).json({ error: 'Description must be text or null' });
      return;
    }

    response.status(201).json(tasks.create({ title: body.title, description: body.description }));
  });

  app.patch('/api/tasks/:id', (request, response) => {
    try {
      const body = request.body as Record<string, unknown>;
      const actor = validateActor(body.actor);
      delete body.actor;
      response.json(tasks.update(request.params.id, actor, body));
    } catch (error) {
      response.status(error instanceof Error && error.message === 'Task not found' ? 404 : 400).json({
        error: error instanceof Error ? error.message : 'Task update failed',
      });
    }
  });

  app.delete('/api/tasks/:id', (request, response) => {
    try {
      const body = request.body as { actor?: unknown };
      tasks.remove(request.params.id, validateActor(body.actor));
      response.status(204).send();
    } catch (error) {
      response.status(error instanceof Error && error.message === 'Task not found' ? 404 : 400).json({
        error: error instanceof Error ? error.message : 'Task deletion failed',
      });
    }
  });

  app.get('/api/tasks/:id/history', (request, response) => {
    try {
      response.json(tasks.history(request.params.id));
    } catch {
      response.status(404).json({ error: 'Task not found' });
    }
  });

  return app;
}
