import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('offers the predefined users in an actor selector', () => {
    render(<App />);

    expect(screen.getByLabelText('Acting as')).toHaveValue('john.doe');
    expect(screen.getByRole('option', { name: 'jane.smith' })).toBeInTheDocument();
  });

  it('opens editing in a dialog instead of expanding the task list', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{
        id: 'task-1',
        title: 'Prepare Invoice',
        description: null,
        status: 'to_do',
        createdAt: '2026-10-10T00:00:00.000Z',
        updatedAt: '2026-10-10T00:00:00.000Z',
        deletedAt: null,
      }],
    });

    render(<App />);

    const editButton = await screen.findByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(screen.getByText('Edit task')).toBeInTheDocument();
  });

  it('opens a task-specific audit history in a modal', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{
          id: 'task-1',
          title: 'Prepare Invoice',
          description: null,
          status: 'pending',
          createdAt: '2026-10-10T00:00:00.000Z',
          updatedAt: '2026-10-10T00:01:00.000Z',
          deletedAt: null,
        }],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{
          id: 'audit-1',
          taskId: 'task-1',
          taskTitle: 'Prepare Invoice',
          actor: 'john.doe',
          changes: [{ field: 'status', before: 'to_do', after: 'pending' }],
          createdAt: '2026-10-10T00:01:00.000Z',
        }],
      });

    render(<App />);

    const taskRow = (await screen.findByText('Prepare Invoice')).closest('li');
    expect(taskRow).not.toBeNull();
    fireEvent.click(within(taskRow!).getByRole('button', { name: 'History' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('Prepare Invoice')).toBeInTheDocument();
    expect(within(dialog).getByText(/status changed from/)).toBeInTheDocument();
  });

  it('shows the new-task form from the active task view', async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'New' }));

    expect(screen.getByRole('dialog')).toHaveAttribute('open');
    expect(screen.getAllByRole('button', { name: 'New' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Cancel' })).toHaveLength(2);
  });
});
