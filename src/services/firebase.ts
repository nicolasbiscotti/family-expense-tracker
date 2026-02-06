/**
 * Firebase Service
 * 
 * Initializes Firebase SDK with environment-aware configuration.
 * Supports:
 * - Local development with Firebase Emulators
 * - Preview deployments with isolated Firestore paths
 * - Production deployments
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  type Auth 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  collection,
  doc,
  type Firestore,
  type CollectionReference,
  type DocumentReference
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator,
  ref,
  type FirebaseStorage,
  type StorageReference
} from 'firebase/storage';

import { 
  getEnvironmentConfig, 
  getCollectionPath,
  logEnvironmentInfo,
  validateEnvironmentConfig 
} from '@/utils/environment';

// ============================================
// Firebase Instances (Singleton Pattern)
// ============================================

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let isInitialized = false;

// ============================================
// Initialization
// ============================================

/**
 * Initialize Firebase with environment-aware configuration
 */
export function initializeFirebase(): void {
  if (isInitialized) {
    console.warn('Firebase is already initialized');
    return;
  }
  
  try {
    // Validate environment configuration
    validateEnvironmentConfig();
    
    const config = getEnvironmentConfig();
    
    // Log environment info in development
    if (config.appEnv !== 'production') {
      logEnvironmentInfo();
    }
    
    // Initialize Firebase App
    firebaseApp = initializeApp({
      apiKey: config.firebase.apiKey,
      authDomain: config.firebase.authDomain,
      projectId: config.firebase.projectId,
      storageBucket: config.firebase.storageBucket,
      messagingSenderId: config.firebase.messagingSenderId,
      appId: config.firebase.appId,
    });
    
    // Initialize Services
    firebaseAuth = getAuth(firebaseApp);
    firebaseFirestore = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    
    // Connect to emulators if in local environment
    if (config.useEmulators && config.emulators) {
      connectToEmulators(config.emulators);
    }
    
    isInitialized = true;
    console.log('✅ Firebase initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Connect to Firebase Emulators for local development
 */
function connectToEmulators(emulators: {
  authPort: number;
  firestorePort: number;
  storagePort: number;
}): void {
  if (!firebaseAuth || !firebaseFirestore || !firebaseStorage) {
    throw new Error('Firebase services not initialized');
  }
  
  const host = 'localhost';
  
  console.group('🔧 Connecting to Firebase Emulators');
  
  // Connect Auth Emulator
  connectAuthEmulator(firebaseAuth, `http://${host}:${emulators.authPort}`, {
    disableWarnings: true
  });
  console.log(`Auth Emulator: http://${host}:${emulators.authPort}`);
  
  // Connect Firestore Emulator
  connectFirestoreEmulator(
    firebaseFirestore, 
    host, 
    emulators.firestorePort
  );
  console.log(`Firestore Emulator: http://${host}:${emulators.firestorePort}`);
  
  // Connect Storage Emulator
  connectStorageEmulator(
    firebaseStorage, 
    host, 
    emulators.storagePort
  );
  console.log(`Storage Emulator: http://${host}:${emulators.storagePort}`);
  
  console.groupEnd();
}

// ============================================
// Service Getters
// ============================================

/**
 * Get Firebase App instance
 */
export function getApp(): FirebaseApp {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

/**
 * Get Firebase Auth instance
 */
export function getAuthInstance(): Auth {
  if (!firebaseAuth) {
    throw new Error('Firebase Auth not initialized. Call initializeFirebase() first.');
  }
  return firebaseAuth;
}

/**
 * Get Firestore instance
 */
export function getFirestoreInstance(): Firestore {
  if (!firebaseFirestore) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return firebaseFirestore;
}

/**
 * Get Firebase Storage instance
 */
export function getStorageInstance(): FirebaseStorage {
  if (!firebaseStorage) {
    throw new Error('Firebase Storage not initialized. Call initializeFirebase() first.');
  }
  return firebaseStorage;
}

// ============================================
// Collection & Document Helpers (with environment paths)
// ============================================

/**
 * Get a Firestore collection reference with environment prefix
 * 
 * @param collectionName - The collection name (e.g., 'users', 'families', 'expenses')
 * @returns CollectionReference with environment-appropriate path
 * 
 * @example
 * // In production, this returns a reference to 'environments/production/users'
 * const usersRef = getCollectionRef('users');
 */
export function getCollectionRef(collectionName: string): CollectionReference {
  const db = getFirestoreInstance();
  const path = getCollectionPath(collectionName);
  return collection(db, path);
}

/**
 * Get a Firestore document reference with environment prefix
 * 
 * @param collectionName - The collection name
 * @param documentId - The document ID
 * @returns DocumentReference with environment-appropriate path
 * 
 * @example
 * const userRef = getDocRef('users', 'user123');
 */
export function getDocRef(collectionName: string, documentId: string): DocumentReference {
  const db = getFirestoreInstance();
  const path = getCollectionPath(collectionName);
  return doc(db, path, documentId);
}

/**
 * Get a Storage reference with environment prefix
 * 
 * @param path - The storage path (e.g., 'receipts/expense123.jpg')
 * @returns StorageReference with environment-appropriate path
 */
export function getStorageRef(path: string): StorageReference {
  const storage = getStorageInstance();
  const config = getEnvironmentConfig();
  
  // Prefix storage path with environment for isolation
  const fullPath = config.firestoreRootPath 
    ? `${config.firestoreRootPath}/${path}`
    : path;
    
  return ref(storage, fullPath);
}

// ============================================
// Utilities
// ============================================

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return isInitialized;
}

/**
 * Get current Firebase configuration (safe to log)
 */
export function getFirebaseConfig(): { projectId: string; environment: string } {
  const config = getEnvironmentConfig();
  return {
    projectId: config.firebase.projectId,
    environment: config.appEnv,
  };
}
