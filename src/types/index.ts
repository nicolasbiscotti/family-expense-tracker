/**
 * Type definitions for Family Expense Tracker
 */

// ============================================
// Environment Types
// ============================================

export type AppEnvironment = 'local' | 'preview' | 'production';

export interface EnvironmentConfig {
  appEnv: AppEnvironment;
  useEmulators: boolean;
  firestoreRootPath: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  emulators?: {
    authPort: number;
    firestorePort: number;
    storagePort: number;
    functionsPort: number;
  };
}

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  families: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================
// Family Types
// ============================================

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
  memberDetails?: FamilyMember[];
  createdAt: Date;
  updatedAt: Date;
  monthlyAnomalies?: Anomaly[];
}

export interface FamilyMember {
  id: string;
  displayName: string;
  email: string;
  photoUrl?: string;
  role: 'admin' | 'member';
}

export interface FamilyInvite {
  id: string;
  familyId: string;
  familyName: string;
  invitedBy: string;
  invitedEmail?: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  parent: string;
  child: string;
  icon?: string;
  color?: string;
}

export interface CategoryHierarchy {
  [parent: string]: string[];
}

// ============================================
// Expense Types
// ============================================

export interface Expense {
  id: string;
  familyId: string;
  description: string;
  amount: number; // Stored in cents
  date: Date;
  category: {
    parent: string;
    child: string;
  };
  tags: string[];
  paidBy: string;
  paidByName?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  date: Date;
  category: {
    parent: string;
    child: string;
  };
  tags: string[];
  paidBy: string;
  receiptFile?: File;
}

export interface ExpenseFilter {
  month?: number;
  year?: number;
  categoryParent?: string;
  categoryChild?: string;
  paidBy?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

// ============================================
// Analytics Types
// ============================================

export interface MonthlySummary {
  month: number;
  year: number;
  totalAmount: number;
  expenseCount: number;
  categoryBreakdown: CategoryBreakdown[];
  previousMonthTotal?: number;
  percentChange?: number;
}

export interface CategoryBreakdown {
  parent: string;
  child?: string;
  amount: number;
  percentage: number;
  expenseCount: number;
}

export interface Anomaly {
  category: string;
  currentAmount: number;
  previousAmount: number;
  percentChange: number;
  detectedAt: Date;
}

// ============================================
// UI State Types
// ============================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ============================================
// Firestore Document Types (for converters)
// ============================================

export interface FirestoreUser {
  email: string;
  displayName: string;
  photoUrl?: string;
  families: string[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface FirestoreFamily {
  name: string;
  createdBy: string;
  members: string[];
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  monthlyAnomalies?: FirestoreAnomaly[];
}

export interface FirestoreExpense {
  familyId: string;
  description: string;
  amount: number;
  date: FirestoreTimestamp;
  category: {
    parent: string;
    child: string;
  };
  tags: string[];
  paidBy: string;
  receiptUrl?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface FirestoreAnomaly {
  category: string;
  currentAmount: number;
  previousAmount: number;
  percentChange: number;
  detectedAt: FirestoreTimestamp;
}

export interface FirestoreTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

// ============================================
// Route Types
// ============================================

export type AppRoute = 
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'expenses'
  | 'add-expense'
  | 'family'
  | 'settings'
  | 'invite';

export interface RouteConfig {
  path: string;
  component: string;
  requiresAuth: boolean;
  title: string;
}
