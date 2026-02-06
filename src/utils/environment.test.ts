/**
 * Environment Utilities Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the environment module with different env values
describe('Environment Utilities', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  
  describe('getCollectionPath', () => {
    it('should return collection name without prefix for local', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'local',
            VITE_FIRESTORE_ROOT_PATH: '',
          },
        },
      });
      
      const { getCollectionPath } = await import('@/utils/environment');
      
      expect(getCollectionPath('users')).toBe('users');
      expect(getCollectionPath('families')).toBe('families');
      expect(getCollectionPath('expenses')).toBe('expenses');
    });
    
    it('should return prefixed path for preview', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'preview',
            VITE_FIRESTORE_ROOT_PATH: 'environments/preview',
          },
        },
      });
      
      const { getCollectionPath } = await import('@/utils/environment');
      
      expect(getCollectionPath('users')).toBe('environments/preview/users');
      expect(getCollectionPath('families')).toBe('environments/preview/families');
    });
    
    it('should return prefixed path for production', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'production',
            VITE_FIRESTORE_ROOT_PATH: 'environments/production',
          },
        },
      });
      
      const { getCollectionPath } = await import('@/utils/environment');
      
      expect(getCollectionPath('users')).toBe('environments/production/users');
      expect(getCollectionPath('expenses')).toBe('environments/production/expenses');
    });
  });
  
  describe('getDocumentPath', () => {
    it('should return full document path', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'production',
            VITE_FIRESTORE_ROOT_PATH: 'environments/production',
          },
        },
      });
      
      const { getDocumentPath } = await import('@/utils/environment');
      
      expect(getDocumentPath('users', 'user123')).toBe('environments/production/users/user123');
    });
  });
  
  describe('Environment Detection', () => {
    it('should detect local environment', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'local',
          },
        },
      });
      
      const { isLocalEnvironment, isPreviewEnvironment, isProductionEnvironment } = 
        await import('@/utils/environment');
      
      expect(isLocalEnvironment()).toBe(true);
      expect(isPreviewEnvironment()).toBe(false);
      expect(isProductionEnvironment()).toBe(false);
    });
    
    it('should detect preview environment', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'preview',
          },
        },
      });
      
      const { isLocalEnvironment, isPreviewEnvironment, isProductionEnvironment } = 
        await import('@/utils/environment');
      
      expect(isLocalEnvironment()).toBe(false);
      expect(isPreviewEnvironment()).toBe(true);
      expect(isProductionEnvironment()).toBe(false);
    });
    
    it('should detect production environment', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_APP_ENV: 'production',
          },
        },
      });
      
      const { isLocalEnvironment, isPreviewEnvironment, isProductionEnvironment } = 
        await import('@/utils/environment');
      
      expect(isLocalEnvironment()).toBe(false);
      expect(isPreviewEnvironment()).toBe(false);
      expect(isProductionEnvironment()).toBe(true);
    });
  });
  
  describe('useEmulators', () => {
    it('should return true when emulators are enabled', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_USE_EMULATORS: 'true',
          },
        },
      });
      
      const { useEmulators } = await import('@/utils/environment');
      
      expect(useEmulators()).toBe(true);
    });
    
    it('should return false when emulators are disabled', async () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_USE_EMULATORS: 'false',
          },
        },
      });
      
      const { useEmulators } = await import('@/utils/environment');
      
      expect(useEmulators()).toBe(false);
    });
  });
});
