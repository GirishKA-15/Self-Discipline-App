import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { fetchDailyLog, updateDailyHabit } from '../../services/db';

export default function ReflectionScreen() {
  const [wins, setWins] = useState('');
  const [fails, setFails] = useState('');
  const [fixes, setFixes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadExisting();
  }, [user]);

  const loadExisting = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const log = await fetchDailyLog((user as any).uid, today);
      if (log.reflection_wins) setWins(log.reflection_wins);
      if (log.reflection_fails) setFails(log.reflection_fails);
      if (log.reflection_fixes) setFixes(log.reflection_fixes);
    } catch (e) {
      console.error(e);
    }
  };

  const saveReflection = async () => {
    if (!wins.trim() || !fails.trim() || !fixes.trim()) {
      Alert.alert("Incomplete", "You must fill out all fields. Brutal honesty is required.");
      return;
    }
    
    setLoading(true);
    try {
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      await updateDailyHabit((user as any).uid, today, {
        reflection_wins: wins,
        reflection_fails: fails,
        reflection_fixes: fixes
      });
      Alert.alert("Logged", "Daily reflection saved.", [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save reflection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>END OF DAY</Text>
        <Text style={styles.subtitle}>Hold yourself accountable.</Text>

        <Text style={styles.label}>WHAT WENT RIGHT (WINS)</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. Completed 8 hours of deep work uninterrupted."
          placeholderTextColor="#444"
          multiline
          value={wins}
          onChangeText={setWins}
        />

        <Text style={[styles.label, styles.failColor]}>WHAT FAILED (EXCUSES)</Text>
        <TextInput
          style={[styles.input, styles.inputFail]}
          placeholder="E.g. Woke up 30 mins late. Watched YouTube."
          placeholderTextColor="#444"
          multiline
          value={fails}
          onChangeText={setFails}
        />

        <Text style={[styles.label, styles.fixColor]}>HOW WILL IT BE FIXED TOMORROW?</Text>
        <TextInput
          style={[styles.input, styles.inputFix]}
          placeholder="E.g. Phone in another room. Sleep by 10 PM strictly."
          placeholderTextColor="#444"
          multiline
          value={fixes}
          onChangeText={setFixes}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={saveReflection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'SAVING...' : 'SAVE & CLOSE'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 32,
    letterSpacing: 1,
  },
  label: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  failColor: {
    color: '#ff4444',
  },
  fixColor: {
    color: '#3b82f6',
  },
  input: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderWidth: 1,
    borderColor: '#4ade80',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 24,
  },
  inputFail: {
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
    borderColor: '#ff4444',
  },
  inputFix: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: '#3b82f6',
  },
  button: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 16,
  },
  backBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#666',
    fontSize: 16,
  },
});
