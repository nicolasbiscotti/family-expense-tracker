/**
 * Authentication Service
 * 
 * Handles user authentication operations:
 * - Sign up with email/password
 * - Login/logout
 * - Session persistence
 * - Password reset
 * - User profile management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  type Unsubscribe
} from 'firebase/auth';
import { 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

import { getAuthInstance, getDocRef } from './firebase';
import type { User, SignUpData, LoginData, FirestoreUser } from '@/types';

// ============================================
// User Data Conversion
// ============================================

/**
 * Convert Firestore user document to User type
 */
function convertFirestoreUser(id: string, data: FirestoreUser): User {
  return {
    id,
    email: data.email,
    displayName: data.displayName,
    photoUrl: data.photoUrl,
    families: data.families || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Convert Firebase Auth user to minimal User object
 */
function firebaseUserToUser(firebaseUser: FirebaseUser): Partial<User> {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoUrl: firebaseUser.photoURL || undefined,
  };
}

// ============================================
// Authentication Operations
// ============================================

/**
 * Sign up a new user with email and password
 * Creates both Firebase Auth user and Firestore user document
 */
export async function signUp(data: SignUpData): Promise<User> {
  const auth = getAuthInstance();
  
  try {
    // Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    
    const firebaseUser = credential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(firebaseUser, {
      displayName: data.displayName,
    });
    
    // Create user document in Firestore
    const userRef = getDocRef('users', firebaseUser.uid);
    const userData: Omit<FirestoreUser, 'createdAt' | 'updatedAt'> & { 
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      email: data.email,
      displayName: data.displayName,
      families: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(userRef, userData);
    
    // Return user object
    return {
      id: firebaseUser.uid,
      email: data.email,
      displayName: data.displayName,
      families: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Sign up error:', firebaseError);
    throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'));
  }
}

/**
 * Log in an existing user with email and password
 */
export async function login(data: LoginData): Promise<User> {
  const auth = getAuthInstance();
  
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    
    const firebaseUser = credential.user;
    
    // Fetch user data from Firestore
    const user = await getUserById(firebaseUser.uid);
    
    if (!user) {
      throw new Error('User profile not found');
    }
    
    return user;
    
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Login error:', firebaseError);
    throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'));
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to log out');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getAuthInstance();
  
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    console.error('Password reset error:', firebaseError);
    throw new Error(getAuthErrorMessage(firebaseError.code || 'unknown'));
  }
}

// ============================================
// User Data Operations
// ============================================

/**
 * Get current authenticated user from Firebase Auth
 */
export function getCurrentAuthUser(): FirebaseUser | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}

/**
 * Get user by ID from Firestore
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = getDocRef('users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return convertFirestoreUser(userSnap.id, userSnap.data() as FirestoreUser);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user data');
  }
}

/**
 * Get current user's full profile from Firestore
 */
export async function getCurrentUser(): Promise<User | null> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    return null;
  }
  
  return getUserById(authUser.uid);
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Pick<User, 'displayName' | 'photoUrl'>>
): Promise<void> {
  try {
    const userRef = getDocRef('users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Also update Firebase Auth profile
    const authUser = getCurrentAuthUser();
    if (authUser && authUser.uid === userId) {
      await updateProfile(authUser, {
        displayName: updates.displayName,
        photoURL: updates.photoUrl,
      });
    }
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
}

/**
 * Add a family to user's families array
 */
export async function addFamilyToUser(userId: string, familyId: string): Promise<void> {
  try {
    const userRef = getDocRef('users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data() as FirestoreUser;
    const families = userData.families || [];
    
    if (!families.includes(familyId)) {
      await updateDoc(userRef, {
        families: [...families, familyId],
        updatedAt: serverTimestamp(),
      });
    }
    
  } catch (error) {
    console.error('Error adding family to user:', error);
    throw new Error('Failed to add family');
  }
}

// ============================================
// Auth State Listener
// ============================================

/**
 * Subscribe to authentication state changes
 * Returns unsubscribe function
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): Unsubscribe {
  const auth = getAuthInstance();
  
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await getUserById(firebaseUser.uid);
        callback(user);
      } catch (error) {
        console.error('Error fetching user on auth change:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

// ============================================
// Error Handling
// ============================================

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please log in or use a different email.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Email/password sign up is not enabled.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
