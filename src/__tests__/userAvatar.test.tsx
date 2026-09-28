import { describe, it, expect } from 'vitest';
import { getInitials } from '../components/UserAvatar';

describe('UserAvatar & getInitials unit tests', () => {
  it('extracts two initials from first and last name', () => {
    expect(getInitials('Tanvir Ahmed', 'tanvir@gmail.com')).toBe('TA');
    expect(getInitials('Istihad Ahmed', 'istihad@azraqtrips.com')).toBe('IA');
    expect(getInitials('John Doe', null)).toBe('JD');
  });

  it('extracts first two letters if single word name', () => {
    expect(getInitials('Tonmoy', null)).toBe('TO');
    expect(getInitials('Alex', 'alex@example.com')).toBe('AL');
  });

  it('falls back to email handle letters if name is empty', () => {
    expect(getInitials('', 'traveler@gmail.com')).toBe('TR');
    expect(getInitials(null, 'rahim@gmail.com')).toBe('RA');
  });

  it('returns TR if both name and email are missing', () => {
    expect(getInitials(null, null)).toBe('TR');
    expect(getInitials('', '')).toBe('TR');
  });
});
