import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button } from '../../src/components/Button';

describe('Button', () => {
  afterEach(cleanup);

  it('renders its label', () => {
    render(<Button>Suchen</Button>);
    expect(screen.getByRole('button').textContent).toBe('Suchen');
  });

  it('defaults to type button so it cannot submit a form by accident', () => {
    render(<Button>Suchen</Button>);
    expect(screen.getByRole('button')).toHaveProperty('type', 'button');
  });

  it('honours an explicit submit type', () => {
    render(<Button type="submit">Einreichen</Button>);
    expect(screen.getByRole('button')).toHaveProperty('type', 'submit');
  });

  it('is disabled while busy, so a slow request cannot be sent twice', () => {
    const onClick = vi.fn();
    render(
      <Button busy onClick={onClick}>
        Einreichen
      </Button>,
    );
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('announces the busy state to assistive technology', () => {
    render(<Button busy>Einreichen</Button>);
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });

  it('stays clickable when it is not busy', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Suchen</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
