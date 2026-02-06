/**
 * Family Service
 * 
 * Handles family-related operations:
 * - Create family
 * - Invite members
 * - Join family
 * - List families
 * - Get family details
 */

import {
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';

import { getCollectionRef, getDocRef, getFirestoreInstance } from './firebase';
import { getCurrentAuthUser, addFamilyToUser, getUserById } from './auth-service';
import type { 
  Family, 
  FamilyMember, 
  FamilyInvite, 
  FirestoreFamily, 
  User 
} from '@/types';
import { generateId } from '@/utils/helpers';

// ============================================
// Family Data Conversion
// ============================================

/**
 * Convert Firestore family document to Family type
 */
function convertFirestoreFamily(id: string, data: FirestoreFamily): Family {
  return {
    id,
    name: data.name,
    createdBy: data.createdBy,
    members: data.members || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    monthlyAnomalies: data.monthlyAnomalies?.map(a => ({
      ...a,
      detectedAt: a.detectedAt?.toDate() || new Date(),
    })),
  };
}

// ============================================
// Family CRUD Operations
// ============================================

/**
 * Create a new family
 */
export async function createFamily(name: string): Promise<Family> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    throw new Error('You must be logged in to create a family');
  }
  
  const familyId = generateId();
  const familyRef = getDocRef('families', familyId);
  
  const familyData = {
    name,
    createdBy: authUser.uid,
    members: [authUser.uid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  try {
    await setDoc(familyRef, familyData);
    
    // Add family to user's families array
    await addFamilyToUser(authUser.uid, familyId);
    
    return {
      id: familyId,
      name,
      createdBy: authUser.uid,
      members: [authUser.uid],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
  } catch (error) {
    console.error('Error creating family:', error);
    throw new Error('Failed to create family');
  }
}

/**
 * Get family by ID
 */
export async function getFamilyById(familyId: string): Promise<Family | null> {
  try {
    const familyRef = getDocRef('families', familyId);
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      return null;
    }
    
    return convertFirestoreFamily(familySnap.id, familySnap.data() as FirestoreFamily);
    
  } catch (error) {
    console.error('Error fetching family:', error);
    throw new Error('Failed to fetch family');
  }
}

/**
 * Get family with member details populated
 */
export async function getFamilyWithMembers(familyId: string): Promise<Family | null> {
  const family = await getFamilyById(familyId);
  
  if (!family) {
    return null;
  }
  
  // Fetch member details
  const memberDetails: FamilyMember[] = await Promise.all(
    family.members.map(async (memberId) => {
      const user = await getUserById(memberId);
      return {
        id: memberId,
        displayName: user?.displayName || 'Unknown',
        email: user?.email || '',
        photoUrl: user?.photoUrl,
        role: memberId === family.createdBy ? 'admin' as const : 'member' as const,
      };
    })
  );
  
  return {
    ...family,
    memberDetails,
  };
}

/**
 * Get all families for the current user
 */
export async function getUserFamilies(): Promise<Family[]> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    return [];
  }
  
  try {
    const familiesRef = getCollectionRef('families');
    const q = query(familiesRef, where('members', 'array-contains', authUser.uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => 
      convertFirestoreFamily(doc.id, doc.data() as FirestoreFamily)
    );
    
  } catch (error) {
    console.error('Error fetching user families:', error);
    throw new Error('Failed to fetch families');
  }
}

/**
 * Update family name
 */
export async function updateFamilyName(familyId: string, newName: string): Promise<void> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    throw new Error('You must be logged in');
  }
  
  const family = await getFamilyById(familyId);
  
  if (!family) {
    throw new Error('Family not found');
  }
  
  if (family.createdBy !== authUser.uid) {
    throw new Error('Only the family admin can rename the family');
  }
  
  try {
    const familyRef = getDocRef('families', familyId);
    await updateDoc(familyRef, {
      name: newName,
      updatedAt: serverTimestamp(),
    });
    
  } catch (error) {
    console.error('Error updating family name:', error);
    throw new Error('Failed to update family name');
  }
}

// ============================================
// Family Invite Operations
// ============================================

/**
 * Create a family invite link
 */
export async function createFamilyInvite(familyId: string): Promise<FamilyInvite> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    throw new Error('You must be logged in');
  }
  
  const family = await getFamilyById(familyId);
  
  if (!family) {
    throw new Error('Family not found');
  }
  
  if (!family.members.includes(authUser.uid)) {
    throw new Error('You are not a member of this family');
  }
  
  const inviteId = generateId();
  const inviteRef = getDocRef('invites', inviteId);
  
  // Invite expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  const inviteData = {
    familyId,
    familyName: family.name,
    invitedBy: authUser.uid,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    status: 'pending',
  };
  
  try {
    await setDoc(inviteRef, inviteData);
    
    return {
      id: inviteId,
      familyId,
      familyName: family.name,
      invitedBy: authUser.uid,
      createdAt: new Date(),
      expiresAt,
      status: 'pending',
    };
    
  } catch (error) {
    console.error('Error creating invite:', error);
    throw new Error('Failed to create invite');
  }
}

/**
 * Get invite details
 */
export async function getInvite(inviteId: string): Promise<FamilyInvite | null> {
  try {
    const inviteRef = getDocRef('invites', inviteId);
    const inviteSnap = await getDoc(inviteRef);
    
    if (!inviteSnap.exists()) {
      return null;
    }
    
    const data = inviteSnap.data();
    
    return {
      id: inviteSnap.id,
      familyId: data.familyId,
      familyName: data.familyName,
      invitedBy: data.invitedBy,
      invitedEmail: data.invitedEmail,
      createdAt: data.createdAt?.toDate() || new Date(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
      status: data.status,
    };
    
  } catch (error) {
    console.error('Error fetching invite:', error);
    throw new Error('Failed to fetch invite');
  }
}

/**
 * Accept a family invite
 */
export async function acceptFamilyInvite(inviteId: string): Promise<Family> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    throw new Error('You must be logged in to accept an invite');
  }
  
  const invite = await getInvite(inviteId);
  
  if (!invite) {
    throw new Error('Invite not found');
  }
  
  if (invite.status !== 'pending') {
    throw new Error('This invite has already been used or expired');
  }
  
  if (new Date() > invite.expiresAt) {
    throw new Error('This invite has expired');
  }
  
  const family = await getFamilyById(invite.familyId);
  
  if (!family) {
    throw new Error('Family not found');
  }
  
  if (family.members.includes(authUser.uid)) {
    throw new Error('You are already a member of this family');
  }
  
  try {
    // Add user to family
    const familyRef = getDocRef('families', invite.familyId);
    await updateDoc(familyRef, {
      members: arrayUnion(authUser.uid),
      updatedAt: serverTimestamp(),
    });
    
    // Add family to user
    await addFamilyToUser(authUser.uid, invite.familyId);
    
    // Mark invite as accepted
    const inviteRef = getDocRef('invites', inviteId);
    await updateDoc(inviteRef, {
      status: 'accepted',
    });
    
    return {
      ...family,
      members: [...family.members, authUser.uid],
    };
    
  } catch (error) {
    console.error('Error accepting invite:', error);
    throw new Error('Failed to join family');
  }
}

/**
 * Generate shareable invite URL
 */
export function generateInviteUrl(inviteId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite/${inviteId}`;
}

// ============================================
// Member Operations
// ============================================

/**
 * Remove a member from family (admin only)
 */
export async function removeFamilyMember(
  familyId: string, 
  memberId: string
): Promise<void> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    throw new Error('You must be logged in');
  }
  
  const family = await getFamilyById(familyId);
  
  if (!family) {
    throw new Error('Family not found');
  }
  
  if (family.createdBy !== authUser.uid) {
    throw new Error('Only the family admin can remove members');
  }
  
  if (memberId === family.createdBy) {
    throw new Error('Cannot remove the family admin');
  }
  
  try {
    const familyRef = getDocRef('families', familyId);
    const updatedMembers = family.members.filter(m => m !== memberId);
    
    await updateDoc(familyRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });
    
    // Note: We're not removing the family from the user's families array
    // This could be added if needed
    
  } catch (error) {
    console.error('Error removing family member:', error);
    throw new Error('Failed to remove member');
  }
}

/**
 * Leave a family (for non-admin members)
 */
export async function leaveFamily(familyId: string): Promise<void> {
  const authUser = getCurrentAuthUser();
  
  if (!authUser) {
    throw new Error('You must be logged in');
  }
  
  const family = await getFamilyById(familyId);
  
  if (!family) {
    throw new Error('Family not found');
  }
  
  if (family.createdBy === authUser.uid) {
    throw new Error('Family admin cannot leave. Transfer ownership or delete the family.');
  }
  
  try {
    const familyRef = getDocRef('families', familyId);
    const updatedMembers = family.members.filter(m => m !== authUser.uid);
    
    await updateDoc(familyRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });
    
  } catch (error) {
    console.error('Error leaving family:', error);
    throw new Error('Failed to leave family');
  }
}
