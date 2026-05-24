import { describe, it, expect } from 'vitest';
import { ROLE_PERMISSIONS, UserRole } from '../constants/enums.js';

describe('ROLE_PERMISSIONS', () => {
  it('Owner has all permissions', () => {
    expect(ROLE_PERMISSIONS['Owner'].length).toBeGreaterThan(30);
  });
  it('Admin lacks users:manage', () => {
    expect(ROLE_PERMISSIONS['Admin']).not.toContain('users:manage');
  });
  it('Viewer has only read permissions', () => {
    for (const p of ROLE_PERMISSIONS['Viewer']) {
      expect(p.endsWith(':read')).toBe(true);
    }
  });
});
