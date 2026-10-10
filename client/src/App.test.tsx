import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('offers the predefined users in an actor selector', () => {
    render(<App />);

    expect(screen.getByLabelText('Acting as')).toHaveValue('john.doe');
    expect(screen.getByRole('option', { name: 'jane.smith' })).toBeInTheDocument();
  });
});
