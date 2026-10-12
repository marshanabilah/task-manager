import { describe, expect, it } from 'vitest';
import { validateTaskUpdate } from './validation';

describe('validateTaskUpdate', () => {
  it('accepts any defined status', () => {
    expect(validateTaskUpdate({ status: 'pending' })).toEqual({
      status: 'pending',
    });
    expect(validateTaskUpdate({ status: 'done' })).toEqual({
      status: 'done',
    });
    expect(validateTaskUpdate({ status: 'to_do' })).toEqual({
      status: 'to_do',
    });
  });

  it('rejects an unknown actor', () => {
    expect(() =>
      validateTaskUpdate({ title: 'Prepare invoice', actor: 'unknown.user' }),
    ).toThrow('Actor must be one of the predefined users');
  });

  it('trims a title before returning it', () => {
    expect(validateTaskUpdate({ title: '  Prepare invoice  ' })).toEqual({
      title: 'Prepare invoice',
    });
  });

  it('rejects a blank title', () => {
    expect(() => validateTaskUpdate({ title: '   ' })).toThrow(
      'Title is required',
    );
  });
});
