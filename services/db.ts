import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface DailyLog {
  date?: string;
  wakeup: boolean;
  no_distractions: boolean;
  deep_work_completed: boolean;
  skill_learning: boolean;
  gym: boolean;
  sleep_on_time: boolean;
  score: number;
  focus_minutes: number;
  reflection_wins: string;
  reflection_fails: string;
  reflection_fixes: string;
}

const defaultLog: DailyLog = {
  wakeup: false,
  no_distractions: false,
  deep_work_completed: false,
  skill_learning: false,
  gym: false,
  sleep_on_time: false,
  score: 0,
  focus_minutes: 0,
  reflection_wins: '',
  reflection_fails: '',
  reflection_fixes: '',
};

export const fetchDailyLog = async (uid: string, date: string): Promise<DailyLog> => {
  try {
    const docRef = doc(db, `users/${uid}/daily_logs/${date}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultLog, ...docSnap.data() } as DailyLog;
    } else {
      // Create empty log for today
      await setDoc(docRef, { ...defaultLog, date });
      return { ...defaultLog, date };
    }
  } catch (error) {
    console.error("Error fetching daily log:", error);
    return { ...defaultLog, date };
  }
};

export const updateDailyHabit = async (uid: string, date: string, data: Partial<DailyLog>): Promise<void> => {
  try {
    const docRef = doc(db, `users/${uid}/daily_logs/${date}`);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating daily habit:", error);
    throw error;
  }
};

export const fetchRecentLogs = async (uid: string, days: number = 7): Promise<DailyLog[]> => {
  try {
    const logsRef = collection(db, `users/${uid}/daily_logs`);
    const q = query(logsRef, orderBy('date', 'desc'), limit(days));
    const querySnapshot = await getDocs(q);
    
    const logs: DailyLog[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push(docSnap.data() as DailyLog);
    });
    
    return logs;
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    return [];
  }
};
