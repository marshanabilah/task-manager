import { describe, expect, it } from 'vitest';
import { validateTaskUpdate } from './validation';

describe('validateTaskUpdate', () => {
  it('accepts the next status in the workflow', () => {
    expect(validateTaskUpdate({ status: 'pending' }, 'to_do')).toEqual({
      status: 'pending',
    });
  });

  it('rejects skipped status transitions', () => {
    expect(() => validateTaskUpdate({ status: 'done' }, 'to_do')).toThrow(
      'Status must move to the next workflow stage',
    );
  });

  it('rejects an unknown actor', () => {
    expect(() =>
      validateTaskUpdate({ title: 'Prepare invoice', actor: 'unknown.user' }, 'to_do'),
    ).toThrow('Actor must be one of the predefined users');
  });

  it('trims a title before returning it', () => {
    expect(validateTaskUpdate({ title: '  Prepare invoice  ' }, 'to_do')).toEqual({
      title: 'Prepare invoice',
    });
  });

  it('rejects a blank title', () => {
    expect(() => validateTaskUpdate({ title: '   ' }, 'to_do')).toThrow(
      'Title is required',
    );
  });
});
