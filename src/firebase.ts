import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ChatMessage, LearnedInsight, PersonalityMode } from './types';

// 1. Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Validate Connection to Firestore on Boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// 3. Error Handling conforming strictly to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Authentication helpers
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In error:', error);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out error:', error);
  }
}

// 5. User Profile management
export interface AppUserProfile {
  userId: string;
  displayName: string;
  email?: string;
  preferredMode: PersonalityMode;
  preferredLanguage?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function syncUserProfile(user: FirebaseUser, preferredMode: PersonalityMode): Promise<AppUserProfile | null> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newProfile: AppUserProfile = {
        userId: user.uid,
        displayName: user.displayName || 'Friend',
        email: user.email || undefined,
        preferredMode,
        preferredLanguage: 'English',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    } else {
      const data = snap.data() as AppUserProfile;
      if (data.preferredMode !== preferredMode) {
        await updateDoc(userRef, {
          preferredMode,
          updatedAt: serverTimestamp(),
        });
      }
      return data;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Persistent Chat Messages
export async function saveChatMessageToFirestore(userId: string, msg: ChatMessage): Promise<void> {
  const cleanId = (msg.id || `msg_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${userId}/messages/${cleanId}`;
  const msgDoc = doc(db, 'users', userId, 'messages', cleanId);
  try {
    await setDoc(msgDoc, {
      id: cleanId,
      userId,
      role: msg.role === 'user' ? 'user' : 'sophia',
      content: msg.content.slice(0, 8000),
      spokenText: (msg.spokenText || msg.content).slice(0, 8000),
      sentiment: msg.sentiment || 'calm',
      voiceEngine: msg.voiceProvider || 'gemini',
      timestamp: new Date(msg.timestamp).toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToChatMessages(
  userId: string,
  onMessages: (msgs: ChatMessage[]) => void
): () => void {
  const path = `users/${userId}/messages`;
  try {
    const msgsQuery = query(
      collection(db, 'users', userId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    return onSnapshot(
      msgsQuery,
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: d.id,
            role: d.role === 'user' ? 'user' : 'assistant',
            content: d.content,
            spokenText: d.spokenText,
            mode: 'girlfriend',
            timestamp: d.timestamp ? new Date(d.timestamp).getTime() : Date.now(),
            voiceProvider: d.voiceEngine,
            sentiment: d.sentiment,
          });
        });
        if (list.length > 0) {
          onMessages(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 7. Persistent Learned Insights (Fast Learner Memory)
export async function saveLearnedInsightToFirestore(userId: string, insight: LearnedInsight): Promise<void> {
  const cleanId = (insight.id || `ins_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${userId}/insights/${cleanId}`;
  const insightDoc = doc(db, 'users', userId, 'insights', cleanId);
  try {
    await setDoc(insightDoc, {
      id: cleanId,
      userId,
      category: insight.category || 'preference',
      fact: (insight.detail || insight.title).slice(0, 2000),
      confidence: Math.max(0, Math.min(1, insight.confidence || 0.95)),
      learnedAt: new Date(insight.learnedAt).toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToLearnedInsights(
  userId: string,
  onInsights: (insights: LearnedInsight[]) => void
): () => void {
  const path = `users/${userId}/insights`;
  try {
    const q = query(
      collection(db, 'users', userId, 'insights'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list: LearnedInsight[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: data.id,
            category: (data.category as any) || 'preference',
            title: data.category.toUpperCase(),
            detail: data.fact,
            learnedAt: data.learnedAt ? new Date(data.learnedAt).getTime() : Date.now(),
            confidence: data.confidence || 0.9,
          });
        });
        if (list.length > 0) {
          onInsights(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 8. Persistent Multimodal AI Studio Creations
export interface StudioCreation {
  id: string;
  userId: string;
  type: 'music' | 'image' | 'video' | 'transcription' | 'grounding';
  title: string;
  prompt: string;
  mediaUrl?: string;
  createdAt?: any;
}

export async function saveCreationToFirestore(userId: string, creation: StudioCreation): Promise<void> {
  const cleanId = (creation.id || `cre_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${userId}/creations/${cleanId}`;
  const creationDoc = doc(db, 'users', userId, 'creations', cleanId);
  try {
    await setDoc(creationDoc, {
      id: cleanId,
      userId,
      type: creation.type,
      title: creation.title.slice(0, 200),
      prompt: creation.prompt.slice(0, 4000),
      mediaUrl: creation.mediaUrl ? creation.mediaUrl.slice(0, 100000) : '',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
