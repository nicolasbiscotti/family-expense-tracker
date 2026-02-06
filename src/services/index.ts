/**
 * Services Index
 * 
 * Re-exports all services for convenient importing
 */

// Firebase Core
export {
  initializeFirebase,
  getApp,
  getAuthInstance,
  getFirestoreInstance,
  getStorageInstance,
  getCollectionRef,
  getDocRef,
  getStorageRef,
  isFirebaseInitialized,
  getFirebaseConfig,
} from './firebase';

// Authentication
export {
  signUp,
  login,
  logout,
  sendPasswordReset,
  getCurrentAuthUser,
  getCurrentUser,
  getUserById,
  updateUserProfile,
  addFamilyToUser,
  onAuthStateChange,
} from './auth-service';

// Family Management
export {
  createFamily,
  getFamilyById,
  getFamilyWithMembers,
  getUserFamilies,
  updateFamilyName,
  createFamilyInvite,
  getInvite,
  acceptFamilyInvite,
  generateInviteUrl,
  removeFamilyMember,
  leaveFamily,
} from './family-service';
