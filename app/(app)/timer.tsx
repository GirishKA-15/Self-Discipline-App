import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { fetchDailyLog, updateDailyHabit } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';

export default function TimerScreen() {
  const [seconds, setSeconds] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Regain Strict Mode: Monitor if user leaves the app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        // User left the app!
        if (isActive) {
          setIsActive(false);
          setFailed(true);
          Alert.alert("STRICT MODE FAILED", "You left the app! Deep focus requires zero distractions. Your session has been destroyed.");
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (targetSeconds > 0 && s + 1 >= targetSeconds) {
             finishSession(Math.floor((s + 1) / 60));
             return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, targetSeconds]);

  const startPreset = (minutes: number) => {
    setTargetSeconds(minutes * 60);
    setSeconds(0);
    setFailed(false);
    setIsActive(true);
    Alert.alert("Strict Mode Active", "If you leave this app to check social media, your timer will instantly fail.");
  };

  const finishSession = async (minutesFocused: number) => {
    setIsActive(false);
    if (!user) return;
    
    if (minutesFocused === 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const currentUser: any = user;
      const log = await fetchDailyLog(currentUser.uid, today);
      const newTotal = (log.focus_minutes || 0) + minutesFocused;
      await updateDailyHabit(currentUser.uid, today, { focus_minutes: newTotal });
      
      Alert.alert("Session Logged", `Logged ${minutesFocused} minutes of pure deep work.`, [
        { text: 'OK', onPress: () => router.back() } 
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to log session");
    }
  };

  const formatTime = (totalSeconds: number) => {
    // If target is set, show countdown. Otherwise show countup.
    const displaySeconds = targetSeconds > 0 ? Math.max(0, targetSeconds - totalSeconds) : totalSeconds;
    const h = Math.floor(displaySeconds / 3600);
    const m = Math.floor((displaySeconds % 3600) / 60);
    const s = displaySeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: failed ? colors.danger : colors.primary }]}>
        {failed ? "SESSION FAILED" : "DEEP WORK"}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {failed ? "You gave in to distraction." : "Strict Mode: Never leave this screen."}
      </Text>

      <View style={[styles.timerContainer, { borderColor: failed ? colors.danger : colors.border }]}>
        <Text style={[styles.timer, { color: failed ? colors.danger : colors.text }]}>{formatTime(seconds)}</Text>
      </View>

      {!isActive && !failed && seconds === 0 && (
        <View style={styles.presets}>
          <Text style={[styles.presetTitle, { color: colors.text }]}>REGAIN FOCUS PRESETS</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity style={[styles.presetBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startPreset(30)}>
              <Text style={[styles.presetText, { color: colors.text }]}>30 Min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.presetBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startPreset(60)}>
               <Text style={[styles.presetText, { color: colors.text }]}>1 Hour</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.presetBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => startPreset(120)}>
               <Text style={[styles.presetText, { color: colors.text }]}>2 Hours</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isActive && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger }]} onPress={() => { setIsActive(false); setFailed(true); }}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>GIVE UP</Text>
        </TouchableOpacity>
      )}

      {failed && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.card }]} onPress={() => { setFailed(false); setSeconds(0); }}>
          <Text style={[styles.buttonText, { color: colors.text }]}>RESTART</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: colors.textMuted }]}>Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 4, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 48, letterSpacing: 1, textAlign: 'center' },
  timerContainer: { width: 250, height: 250, borderRadius: 125, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 48 },
  timer: { fontSize: 48, fontWeight: '300' },
  presets: { width: '100%', alignItems: 'center', marginBottom: 24 },
  presetTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 16 },
  presetRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  presetBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
  presetText: { fontSize: 16, fontWeight: 'bold' },
  button: { width: '80%', padding: 20, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  backBtn: { marginTop: 24 },
  backText: { fontSize: 16 },
});
