import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { fetchRecentLogs } from '../../services/db';

export default function CoachScreen() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const generateFeedback = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const logs = await fetchRecentLogs((user as any).uid, 7);
      
      const missingHabits = logs.reduce((acc, log) => acc + (6 - log.score), 0);
      const totalDeepWork = logs.reduce((acc, log) => acc + (log.focus_minutes || 0), 0);
      const daysTracked = logs.length;

      // In a real app, you would hit the Gemini API here.
      // E.g., const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + API_KEY, ...)
      
      // Simulating AI strict feedback based on performance:
      await new Promise(resolve => setTimeout(resolve, 2000));

      let aiResponse = '';
      if (daysTracked === 0) {
        aiResponse = "You haven't tracked anything yet. Stop making excuses and start executing immediately.";
      } else if (missingHabits === 0) {
        aiResponse = `You execute like a machine. ${daysTracked} days perfect. ${totalDeepWork} minutes of deep work. Do not get comfortable. Maintain the standard.`;
      } else if (missingHabits < 5 && totalDeepWork > 120) {
        aiResponse = `You missed ${missingHabits} habits this week. You put in ${totalDeepWork} minutes of deep work. It's average. We don't do average. Fix your weak spots tomorrow.`;
      } else {
        aiResponse = `Pathetic. You missed ${missingHabits} required habits out of ${daysTracked * 6} in the last ${daysTracked} days. Only ${totalDeepWork} minutes of deep work. Read your own reflections and stop lying to yourself. Execute.`;
      }

      setFeedback(aiResponse);

    } catch (e) {
      console.error(e);
      setFeedback("Failed to sync with the coach.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI COACH</Text>
      <Text style={styles.subtitle}>Raw, unfiltered accountability.</Text>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#ff4444" />
            <Text style={styles.analyzingText}>Analyzing your week...</Text>
          </View>
        ) : feedback ? (
          <ScrollView style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </ScrollView>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Ready to face the truth? 
              The coach will analyze your last 7 days of habits, focus time, and daily reflections to give you a ruthless reality check.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && styles.disabled]} 
        onPress={generateFeedback}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{feedback ? 'RECALCULATE' : 'ANALYZE MY PERFORMANCE'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    paddingTop: 64,
  },
  title: {
    color: '#ff4444',
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loader: {
    alignItems: 'center',
  },
  analyzingText: {
    color: '#ff4444',
    marginTop: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  feedbackBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    padding: 24,
    maxHeight: '80%',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 32,
    textTransform: 'uppercase',
  },
  placeholder: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  backBtn: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    color: '#666',
    fontSize: 16,
  },
});
