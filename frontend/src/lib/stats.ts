import { firestoreTimestampToDate } from './firestore';

interface MoodLog {
  id: string;
  mood_level: number;
  notes?: string;
  created_at: any;
}

interface ExerciseEntry {
  id: string;
  exercise_id: string;
  duration_completed: number;
  completed_at: any;
}

export function computeMoodStats(logs: MoodLog[]) {
  if (!logs || logs.length === 0) {
    return { average_mood: 0, total_entries: 0, streak: 0, distribution: {} };
  }

  // Average
  const sum = logs.reduce((acc, l) => acc + l.mood_level, 0);
  const average_mood = parseFloat((sum / logs.length).toFixed(1));

  // Distribution
  const distribution: Record<number, number> = {};
  for (const l of logs) {
    distribution[l.mood_level] = (distribution[l.mood_level] || 0) + 1;
  }

  // Streak: count consecutive days (most recent first) that have at least one entry
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logDates = new Set(
    logs.map((l) => {
      const d = firestoreTimestampToDate(l.created_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(check.getDate() - i);
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
    if (logDates.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return { average_mood, total_entries: logs.length, streak, distribution };
}

export function computeExerciseStats(exercises: ExerciseEntry[]) {
  if (!exercises || exercises.length === 0) {
    return { total_minutes: 0, sessions_completed: 0, streak: 0 };
  }

  const total_seconds = exercises.reduce((acc, e) => acc + (e.duration_completed || 0), 0);
  const total_minutes = Math.round(total_seconds / 60);
  const sessions_completed = exercises.length;

  // Streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = new Set(
    exercises.map((e) => {
      const d = firestoreTimestampToDate(e.completed_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  for (let i = 0; i < 365; i++) {
    const check = new Date(today);
    check.setDate(check.getDate() - i);
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
    if (dates.has(key)) {
      streak++;
    } else {
      break;
    }
  }

  return { total_minutes, sessions_completed, streak };
}
