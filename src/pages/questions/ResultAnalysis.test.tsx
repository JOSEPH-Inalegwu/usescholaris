import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResultAnalysis from './ResultAnalysis';

describe('ResultAnalysis Page', () => {
  it('renders correctly with state', () => {
    const state = {
      score: 30,
      total: 40,
      courseSlug: 'csc201',
      note: 'Elite level!',
      incorrect: 5,
      skipped: 5,
      duration: 1200000,
      categoryBreakdown: { 'Networking': { correct: 15, total: 20 }, 'Security': { correct: 15, total: 20 } }
    };

    const { getByText } = render(
      <MemoryRouter initialEntries={[{ pathname: '/results', state }]}>
        <ResultAnalysis />
      </MemoryRouter>
    );

    expect(getByText('30')).toBeDefined();
    expect(getByText('Elite level!')).toBeDefined();
    expect(getByText('75%')).toBeDefined();
  });
});
