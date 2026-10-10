import { FormEvent, useEffect, useState } from 'react';
import type { AuditEntry } from '../../shared/audit';
import { ACTORS, TASK_STATUSES, type Task, type TaskStatus } from '../../shared/task';
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
    .map((change) => {
      if (change.field === 'created') return 'task was created';
      if (change.field === 'deleted') return 'task was deleted';
      return `${change.field} changed from “${change.before ?? 'empty'}” to “${change.after ?? 'empty'}”`;
    })
    .join('; ');
}

export function App() {
  const [actor, setActor] = useSelectedActor();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailMode, setDetailMode] = useState<'edit' | null>(null);
  const [view, setView] = useState<'tasks' | 'history'>('tasks');
  const [showCreate, setShowCreate] = useState(false);
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
      await taskApi.create({ title, description }, actor);
      setTitle('');
      setDescription('');
      setShowCreate(false);
      await refresh();
      setView('tasks');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create task');
    }
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    const form = new FormData(event.currentTarget);
    const status = form.get('status') as TaskStatus;
    try {
      await taskApi.update(selectedTask.id, actor, {
        title: String(form.get('title')),
        description: String(form.get('description')),
        ...(status !== selectedTask.status ? { status } : {}),
      });
      await refresh();
      closeDetail();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update task');
    }
  }

  async function showAllHistory() {
    closeDetail();
    setShowCreate(false);
    setLoading(true);
    try {
      setHistory(await taskApi.allHistory());
      setView('history');
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load history');
    } finally {
      setLoading(false);
    }
  }

  function openEditor(task: Task) {
    setSelectedTask(task);
    setHistory([]);
    setDetailMode('edit');
  }

  function changeView(nextView: 'tasks') {
    closeDetail();
    setShowCreate(false);
    setView(nextView);
  }

  function closeDetail() {
    setSelectedTask(null);
    setDetailMode(null);
    setHistory([]);
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be restored from the app.`)) return;
    try {
      await taskApi.remove(task.id, actor);
      closeDetail();
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

      <nav className="view-tabs" aria-label="Task manager views">
        <button type="button" className={view === 'tasks' ? 'tab-active' : 'quiet-button'} onClick={() => changeView('tasks')}>Active tasks</button>
        <button type="button" className={view === 'history' ? 'tab-active' : 'quiet-button'} onClick={() => void showAllHistory()}>History</button>
      </nav>

      {view === 'tasks' && <>
      {error && <p role="alert" className="error">{error}</p>}
        <section aria-labelledby="tasks-heading">
          <div className="section-heading">
            <h2 id="tasks-heading">Active tasks</h2>
            <button type="button" className="quiet-button" onClick={() => { closeDetail(); setShowCreate((visible) => !visible); }}>
              {showCreate ? 'Cancel new task' : '+ New task'}
            </button>
          </div>
          {showCreate && <div className="create-panel">
            <form onSubmit={createTask} className="task-form">
              <label>Title<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
              <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <button type="submit">Add task</button>
            </form>
          </div>}
          {loading ? <p role="status">Loading tasks…</p> : tasks.length === 0 ? (
            <p className="empty">No active tasks yet. Use + New task to begin.</p>
          ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <div><strong>{task.title}</strong><span>{task.status.replace('_', ' ')}</span><p>{task.description || 'No description'}</p></div>
                <div className="task-actions">
                  <button type="button" onClick={() => openEditor(task)}>Edit</button>
                  <button type="button" className="danger" onClick={() => void deleteTask(task)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          )}
        </section>
      </>}

      {view === 'history' && <section className="history-page" aria-labelledby="history-heading">
        <h2 id="history-heading">All history</h2>
        <p className="empty">Includes records for active and deleted tasks.</p>
        {loading ? <p role="status">Loading history…</p> : history.length === 0 ? <p className="empty">No task updates have been recorded yet.</p> : <ol className="history-list">{history.map((entry) => <li key={entry.id}><strong>{entry.actor}</strong> changed <strong>{entry.taskTitle}</strong>: {auditMessage(entry)} <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time></li>)}</ol>}
      </section>}

      {selectedTask && detailMode && (
        <dialog className="task-dialog" open aria-labelledby="detail-heading" onCancel={(event) => { event.preventDefault(); closeDetail(); }}>
          <div className="dialog-heading">
            <div><p className="eyebrow">Edit task</p><h2 id="detail-heading">{selectedTask.title}</h2></div>
            <button type="button" className="quiet-button" onClick={closeDetail}>Close</button>
          </div>
          <form onSubmit={saveTask} className="task-form">
            <label>Title<input name="title" defaultValue={selectedTask.title} required /></label>
            <label>Description<textarea name="description" defaultValue={selectedTask.description ?? ''} /></label>
            <label>Status
              <select name="status" defaultValue={selectedTask.status}>
                {TASK_STATUSES.map((status) => <option key={status} value={status} disabled={status !== selectedTask.status && status !== nextStatus[selectedTask.status]}>
                  {status.replace('_', ' ')}{status === selectedTask.status ? ' (current)' : status === nextStatus[selectedTask.status] ? ' (next)' : ' (locked)'}
                </option>)}
              </select>
            </label>
            <div className="task-actions"><button type="submit">Save changes</button><button type="button" className="quiet-button" onClick={closeDetail}>Cancel</button></div>
          </form>
        </dialog>
      )}
    </main>
  );
}
