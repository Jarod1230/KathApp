import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { THEME_STORAGE_KEY } from '../../src/lib/theme';
import '../../src/i18n';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(cleanup);

  it('starts on the system setting when nothing was chosen', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button').getAttribute('data-preference')).toBe(
      'system',
    );
  });

  it('applies a stored choice on mount', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('cycles system to light to dark and back', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(button.getAttribute('data-preference')).toBe('light');
    fireEvent.click(button);
    expect(button.getAttribute('data-preference')).toBe('dark');
    fireEvent.click(button);
    expect(button.getAttribute('data-preference')).toBe('system');
  });

  it('persists an explicit choice', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('stamps the document as the choice changes', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    fireEvent.click(button);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(button);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('carries an accessible name so the control is not a bare label', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button').getAttribute('aria-label')).toBeTruthy();
  });
});
