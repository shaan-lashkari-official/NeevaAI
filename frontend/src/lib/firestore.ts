import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserDoc(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function createUserDoc(uid: string, data: { email: string; name: string }) {
  await setDoc(doc(db, 'users', uid), {
    email: data.email,
    name: data.name,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    onboarding_completed: false,
    onboarding_data: null,
    preferences: {},
    created_at: serverTimestamp(),
  });
}

export async function updateUserOnboarding(uid: string, onboardingData: any) {
  await updateDoc(doc(db, 'users', uid), {
    onboarding_completed: true,
    onboarding_data: onboardingData,
  });
}

// ─── Mood Logs ───────────────────────────────────────────────────────────────

export async function addMoodLog(uid: string, data: { mood_level: number; notes: string }) {
  return addDoc(collection(db, 'users', uid, 'mood_logs'), {
    mood_level: data.mood_level,
    notes: data.notes,
    created_at: serverTimestamp(),
  });
}

export async function getMoodLogs(uid: string, max?: number) {
  const q = max
    ? query(collection(db, 'users', uid, 'mood_logs'), orderBy('created_at', 'desc'), limit(max))
    : query(collection(db, 'users', uid, 'mood_logs'), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Exercises ───────────────────────────────────────────────────────────────

export async function addExerciseCompletion(uid: string, data: { exercise_id: string; duration_completed: number }) {
  return addDoc(collection(db, 'users', uid, 'exercises'), {
    exercise_id: data.exercise_id,
    duration_completed: data.duration_completed,
    completed_at: serverTimestamp(),
  });
}

export async function getExerciseHistory(uid: string) {
  const q = query(collection(db, 'users', uid, 'exercises'), orderBy('completed_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Chat Messages (read-only from frontend) ────────────────────────────────

export async function getChatMessages(uid: string, max = 50) {
  const q = query(
    collection(db, 'users', uid, 'chat_messages'),
    orderBy('created_at', 'desc'),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
}

// ─── Community Groups ────────────────────────────────────────────────────────

export async function getCommunityGroups() {
  const q = query(collection(db, 'community_groups'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Community Posts ─────────────────────────────────────────────────────────

export async function getCommunityPosts(groupId?: string) {
  let q;
  if (groupId) {
    q = query(
      collection(db, 'community_posts'),
      where('group_id', '==', groupId),
      orderBy('created_at', 'desc')
    );
  } else {
    q = query(collection(db, 'community_posts'), orderBy('created_at', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToPosts(groupId: string, callback: (posts: any[]) => void) {
  const q = query(
    collection(db, 'community_posts'),
    where('group_id', '==', groupId),
    orderBy('created_at', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(posts);
  });
}

export async function createCommunityPost(data: {
  user_id: string;
  user_name: string;
  group_id: string;
  content: string;
  is_anonymous: boolean;
}) {
  const postRef = await addDoc(collection(db, 'community_posts'), {
    user_id: data.user_id,
    user_name: data.is_anonymous ? 'Anonymous' : data.user_name,
    group_id: data.group_id,
    content: data.content,
    is_anonymous: data.is_anonymous,
    likes_count: 0,
    created_at: serverTimestamp(),
  });

  // Increment group post_count
  const groupRef = doc(db, 'community_groups', data.group_id);
  await updateDoc(groupRef, { post_count: increment(1) });

  return postRef.id;
}

// ─── Likes ───────────────────────────────────────────────────────────────────

export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const likeRef = doc(db, 'community_posts', postId, 'likes', userId);
  const snap = await getDoc(likeRef);
  return snap.exists();
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const likeRef = doc(db, 'community_posts', postId, 'likes', userId);
  const postRef = doc(db, 'community_posts', postId);

  return runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef);
    if (likeSnap.exists()) {
      transaction.delete(likeRef);
      transaction.update(postRef, { likes_count: increment(-1) });
      return false; // unliked
    } else {
      transaction.set(likeRef, { created_at: serverTimestamp() });
      transaction.update(postRef, { likes_count: increment(1) });
      return true; // liked
    }
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function firestoreTimestampToDate(ts: any): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
}
