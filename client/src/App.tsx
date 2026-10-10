import { FormEvent, useEffect, useState } from 'react';
import type { AuditEntry } from '../../shared/audit';
import { ACTORS, type Task, type TaskStatus } from '../../shared/task';
import { taskApi } from './api/tasks';
import { useSelectedActor } from './hooks/useSelectedActor';
import './styles.css';

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  to_do: 'pending',
  pending: 'in_progress',
  in_progress: 'done',
  done: null,
};

function auditMessage(entry: AuditEntry) {
  return entry.changes
    .map((change) => `${change.field} changed from “${change.before ?? 'empty'}” to “${change.after ?? 'empty'}”`)
    .join('; ');
}

export function App() {
  const [actor, setActor] = useSelectedActor();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setTasks(await taskApi.list());
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await taskApi.create({ title, description });
      setTitle('');
      setDescription('');
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create task');
    }
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    const form = new FormData(event.currentTarget);
    const status = form.get('status') as TaskStatus | '';
    try {
      await taskApi.update(selectedTask.id, actor, {
        title: String(form.get('title')),
        description: String(form.get('description')),
        ...(status ? { status } : {}),
      });
      await refresh();
      setSelectedTask(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update task');
    }
  }

  async function showHistory(task: Task) {
    try {
      setHistory(await taskApi.history(task.id));
      setSelectedTask(task);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load history');
    }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be restored from the app.`)) return;
    try {
      await taskApi.remove(task.id);
      setSelectedTask(null);
      setHistory([]);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete task');
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Shared workspace</p>
          <h1>Task Manager</h1>
        </div>
        <label className="actor-select">
          Acting as
          <select value={actor} onChange={(event) => setActor(event.target.value as typeof actor)}>
            {ACTORS.map((user) => <option key={user} value={user}>{user}</option>)}
          </select>
        </label>
      </header>

      <section className="create-panel" aria-labelledby="create-heading">
        <h2 id="create-heading">New task</h2>
        <form onSubmit={createTask} className="task-form">
          <label>Title<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <button type="submit">Add task</button>
        </form>
      </section>

      {error && <p role="alert" className="error">{error}</p>}
      {loading ? <p role="status">Loading tasks…</p> : tasks.length === 0 ? (
        <p className="empty">No active tasks yet. Add one above to begin.</p>
      ) : (
        <section aria-labelledby="tasks-heading">
          <h2 id="tasks-heading">Active tasks</h2>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <div><strong>{task.title}</strong><span>{task.status.replace('_', ' ')}</span><p>{task.description || 'No description'}</p></div>
                <div className="task-actions">
                  <button type="button" onClick={() => { setSelectedTask(task); setHistory([]); }}>Edit</button>
                  <button type="button" onClick={() => void showHistory(task)}>History</button>
                  <button type="button" className="danger" onClick={() => void deleteTask(task)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selectedTask && (
        <section className="detail-panel" aria-labelledby="detail-heading">
          <h2 id="detail-heading">{selectedTask.title}</h2>
          <form onSubmit={saveTask} className="task-form">
            <label>Title<input name="title" defaultValue={selectedTask.title} required /></label>
            <label>Description<textarea name="description" defaultValue={selectedTask.description ?? ''} /></label>
            <label>Status
              <select name="status" defaultValue="">
                <option value="">Keep {selectedTask.status.replace('_', ' ')}</option>
                {nextStatus[selectedTask.status] && <option value={nextStatus[selectedTask.status]!}>Move to {nextStatus[selectedTask.status]!.replace('_', ' ')}</option>}
              </select>
            </label>
            <div className="task-actions"><button type="submit">Save changes</button><button type="button" onClick={() => setSelectedTask(null)}>Close</button></div>
          </form>
          <h3>History</h3>
          {history.length === 0 ? <p className="empty">No recorded updates yet.</p> : <ol className="history-list">{history.map((entry) => <li key={entry.id}><strong>{entry.actor}</strong> {auditMessage(entry)} <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time></li>)}</ol>}
        </section>
      )}
    </main>
  );
}
