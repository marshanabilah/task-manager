import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
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

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit task')).toBeInTheDocument();
  });
});
