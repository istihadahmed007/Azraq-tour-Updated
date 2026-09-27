import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HotelsView } from '../components/HotelsView';
import { AuthProvider } from '../context/AuthContext';

describe('HotelsView render check', () => {
  it('renders HotelsView without throwing', () => {
    const html = renderToString(
      <AuthProvider>
        <HotelsView />
      </AuthProvider>
    );
    expect(html).toContain('Hotels &amp; Resorts');
    expect(html).toContain('Explore activities with Klook');
  });
});
