import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
  SelectField,
  TextAreaField,
  TextField,
} from '../../src/components/Field';

describe('TextField', () => {
  afterEach(cleanup);

  it('links the label to the control, so clicking the label focuses it', () => {
    render(<TextField label="Name / Titel" />);
    expect(screen.getByLabelText('Name / Titel')).toBeDefined();
  });

  it('gives two fields on one page distinct ids', () => {
    render(
      <>
        <TextField label="Erstes" />
        <TextField label="Zweites" />
      </>,
    );
    expect(screen.getByLabelText('Erstes').id).not.toBe(
      screen.getByLabelText('Zweites').id,
    );
  });

  it('honours an explicit id', () => {
    render(<TextField label="Suche" id="search-q" />);
    expect(screen.getByLabelText('Suche').id).toBe('search-q');
  });

  it('announces a hint through aria-describedby', () => {
    render(<TextField label="Content-Locale" hint="Beliebiges Sprachkürzel" />);
    const control = screen.getByLabelText('Content-Locale');
    const describedBy = control.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      'Beliebiges Sprachkürzel',
    );
  });

  it('sets no aria-describedby when there is no hint to point at', () => {
    render(<TextField label="Suche" />);
    expect(
      screen.getByLabelText('Suche').getAttribute('aria-describedby'),
    ).toBeNull();
  });
});

describe('TextAreaField', () => {
  afterEach(cleanup);

  it('links its label like the text field does', () => {
    render(<TextAreaField label="Kurzbio" />);
    expect(screen.getByLabelText('Kurzbio').tagName).toBe('TEXTAREA');
  });
});

describe('SelectField', () => {
  afterEach(cleanup);

  it('links its label and renders its options', () => {
    render(
      <SelectField label="Entitätstyp" defaultValue="saint">
        <option value="saint">Heiliger</option>
        <option value="miracle">Wunder</option>
      </SelectField>,
    );
    const select = screen.getByLabelText('Entitätstyp') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
    expect(select.options.length).toBe(2);
  });
});
