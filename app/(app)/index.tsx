import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { fetchDailyLog, updateDailyHabit, DailyLog } from '../../services/db';
import HabitToggle from '../../components/HabitToggle';
import ScoreBar from '../../components/ScoreBar';
import StreakWidget from '../../components/StreakWidget';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [log, setLog] = useState<DailyLog>({
    wakeup: false, no_distractions: false, deep_work_completed: false,
    skill_learning: false, gym: false, sleep_on_time: false,
    score: 0, focus_minutes: 0, reflection_wins: '', reflection_fails: '', reflection_fixes: ''
  });

  const getTodayString = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      const task = InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
        loadData();
      });
      return () => task.cancel();
    } else {
      InteractionManager.runAfterInteractions(() => setIsReady(true));
    }
  }, [user]);

  const loadData = async () => {
    try {
      const today = getTodayString();
      const currentUser: any = user;
      const data = await fetchDailyLog(currentUser.uid, today);
      setLog(data);
    } catch (error) {
      console.error("Error loading daily log:", error);
    }
  };

  const handleToggle = async (key: keyof DailyLog, value: boolean) => {
    if (!log || !user) return;

    const updatedLog = { ...log, [key]: value };
    const scoreFields: (keyof DailyLog)[] = [
      'wakeup', 'no_distractions', 'deep_work_completed', 'skill_learning', 'gym', 'sleep_on_time'
    ];
    let newScore = 0;
    scoreFields.forEach(f => {
      if (updatedLog[f]) newScore++;
    });
    updatedLog.score = newScore;
    setLog(updatedLog);

    try {
      const currentUser: any = user;
      await updateDailyHabit(currentUser.uid, getTodayString(), { [key]: value, score: newScore });
    } catch (e) {
      console.error("Failed to update habit", e);
    }
  };

  if (!isReady) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.date, { color: colors.textMuted }]}>{new Date().toDateString().toUpperCase()}</Text>
          <View style={styles.titleRow}>
            <Text style={[{ color: colors.primary, fontWeight: 'bold', fontSize: 18, marginBottom: 4 }]}>
              Hello {((user as any)?.displayName || (user as any)?.email?.split('@')[0] || 'User')}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Be Discipline</Text>
            <Text style={[styles.quoteText, { color: colors.textMuted }]}>
              “ಸತ್ತ ಮೇಲೆ ಮಲಗೋದು ಇದ್ದೇ ಇದೆ ಎದ್ದಿದ್ದಾಗ ಏನಾದ್ರೂ ಸಾಧಿಸು”
            </Text>
          </View>
        </View>
      </View>

      <ScoreBar score={log.score} total={6} />
      
      {user && <StreakWidget userId={(user as any).uid} />}

      <View style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>DEEP WORK</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>{log.focus_minutes} MIN</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => router.push('/timer')}>
          <Text style={styles.actionBtnText}>ENTER ZONE</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>END OF DAY</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>LOG</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? '#fff' : '#000' }]} onPress={() => router.push('/reflection')}>
          <Text style={[styles.actionBtnText, { color: isDark ? '#000' : '#fff' }]}>REFLECT</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>ACCOUNTABILITY</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>COACH</Text>
        </View>
        <TouchableOpacity style={[styles.coachBtn, { borderColor: colors.danger }]} onPress={() => router.push('/coach')}>
          <Text style={[styles.actionBtnText, { color: colors.danger }]}>FACE TRUTH</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.habitsList}>
        <HabitToggle label="Wake up before set time" value={log.wakeup} onValueChange={(v) => handleToggle('wakeup', v)} />
        <HabitToggle label="No distractions / No SM" value={log.no_distractions} onValueChange={(v) => handleToggle('no_distractions', v)} />
        <HabitToggle label="8 hours deep work" value={log.deep_work_completed} onValueChange={(v) => handleToggle('deep_work_completed', v)} />
        <HabitToggle label="Skill learning (1-2 hours)" value={log.skill_learning} onValueChange={(v) => handleToggle('skill_learning', v)} />
        <HabitToggle label="Gym / Physical Activity" value={log.gym} onValueChange={(v) => handleToggle('gym', v)} />
        <HabitToggle label="Sleep on time" value={log.sleep_on_time} onValueChange={(v) => handleToggle('sleep_on_time', v)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 130,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'column',
    marginTop: 4,
  },
  date: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 48,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 18,
  },
  habitsList: {
    marginTop: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  statBox: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  coachBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
