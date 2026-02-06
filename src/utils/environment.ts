/**
 * Environment Configuration Utility
 * 
 * Handles multi-environment setup:
 * - Local: Uses Firebase Emulators (Auth: 9099, Firestore: 8080)
 * - Preview: Vercel Preview deployments → /environments/preview/ in Firestore
 * - Production: Vercel Production → /environments/production/ in Firestore
 */

import type { AppEnvironment, EnvironmentConfig } from '@/types';

/**
 * Get the current application environment
 */
export function getAppEnvironment(): AppEnvironment {
  const env = import.meta.env.VITE_APP_ENV as string;
  
  if (env === 'production') return 'production';
  if (env === 'preview') return 'preview';
  return 'local';
}

/**
 * Check if we're running in local development with emulators
 */
export function isLocalEnvironment(): boolean {
  return getAppEnvironment() === 'local';
}

/**
 * Check if we're running in a preview environment
 */
export function isPreviewEnvironment(): boolean {
  return getAppEnvironment() === 'preview';
}

/**
 * Check if we're running in production
 */
export function isProductionEnvironment(): boolean {
  return getAppEnvironment() === 'production';
}

/**
 * Check if Firebase emulators should be used
 */
export function useEmulators(): boolean {
  return import.meta.env.VITE_USE_EMULATORS === 'true';
}

/**
 * Get the Firestore root path for the current environment
 * This is used to prefix all collection paths for data isolation
 */
export function getFirestoreRootPath(): string {
  const rootPath = import.meta.env.VITE_FIRESTORE_ROOT_PATH as string;
  return rootPath || '';
}

/**
 * Get a collection path with the environment prefix
 * 
 * @param collectionName - The base collection name (e.g., 'users', 'families', 'expenses')
 * @returns The full collection path with environment prefix
 * 
 * @example
 * // In local environment (emulators)
 * getCollectionPath('users') // Returns: 'users'
 * 
 * // In preview environment
 * getCollectionPath('users') // Returns: 'environments/preview/users'
 * 
 * // In production environment
 * getCollectionPath('users') // Returns: 'environments/production/users'
 */
export function getCollectionPath(collectionName: string): string {
  const rootPath = getFirestoreRootPath();
  
  if (!rootPath) {
    // Local environment uses emulators, no prefix needed
    return collectionName;
  }
  
  // For preview/production, prefix with root path
  return `${rootPath}/${collectionName}`;
}

/**
 * Get a document path with the environment prefix
 * 
 * @param collectionName - The collection name
 * @param documentId - The document ID
 * @returns The full document path
 * 
 * @example
 * getDocumentPath('users', 'user123')
 * // Returns: 'environments/production/users/user123' (in production)
 */
export function getDocumentPath(collectionName: string, documentId: string): string {
  return `${getCollectionPath(collectionName)}/${documentId}`;
}

/**
 * Get the full environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const appEnv = getAppEnvironment();
  const shouldUseEmulators = useEmulators();
  
  const config: EnvironmentConfig = {
    appEnv,
    useEmulators: shouldUseEmulators,
    firestoreRootPath: getFirestoreRootPath(),
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    },
  };
  
  if (shouldUseEmulators) {
    config.emulators = {
      authPort: parseInt(import.meta.env.VITE_EMULATOR_AUTH_PORT || '9099'),
      firestorePort: parseInt(import.meta.env.VITE_EMULATOR_FIRESTORE_PORT || '8080'),
      storagePort: parseInt(import.meta.env.VITE_EMULATOR_STORAGE_PORT || '9199'),
      functionsPort: parseInt(import.meta.env.VITE_EMULATOR_FUNCTIONS_PORT || '5001'),
    };
  }
  
  return config;
}

/**
 * Log environment information (for debugging)
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  
  console.group('🌍 Environment Configuration');
  console.log('Environment:', config.appEnv);
  console.log('Use Emulators:', config.useEmulators);
  console.log('Firestore Root Path:', config.firestoreRootPath || '(none - root level)');
  console.log('Firebase Project:', config.firebase.projectId);
  
  if (config.emulators) {
    console.group('Emulator Ports');
    console.log('Auth:', config.emulators.authPort);
    console.log('Firestore:', config.emulators.firestorePort);
    console.log('Storage:', config.emulators.storagePort);
    console.log('Functions:', config.emulators.functionsPort);
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Validate environment configuration
 * @throws Error if required configuration is missing
 */
export function validateEnvironmentConfig(): void {
  const config = getEnvironmentConfig();
  const errors: string[] = [];
  
  if (!config.firebase.apiKey && !config.useEmulators) {
    errors.push('VITE_FIREBASE_API_KEY is required');
  }
  
  if (!config.firebase.projectId) {
    errors.push('VITE_FIREBASE_PROJECT_ID is required');
  }
  
  if (config.appEnv !== 'local' && !config.firestoreRootPath) {
    console.warn(
      '⚠️ Warning: VITE_FIRESTORE_ROOT_PATH is not set. ' +
      'Data will be stored at the root level of Firestore.'
    );
  }
  
  if (errors.length > 0) {
    throw new Error(
      `Environment configuration errors:\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}
