import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { fetchRecentLogs } from '../../services/db';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@gemini_api_key';

export default function CoachScreen() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [inputKey, setInputKey] = useState("");
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setIsKeySaved(true);
      }
    } catch (e) {
      console.error("Failed to load API key", e);
    }
  };

  const saveApiKey = async () => {
    if (!inputKey.trim()) return;
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, inputKey.trim());
      setApiKey(inputKey.trim());
      setIsKeySaved(true);
    } catch (e) {
      console.error("Failed to save API key", e);
    }
  };

  const clearApiKey = async () => {
    try {
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
      setApiKey("");
      setInputKey("");
      setIsKeySaved(false);
      setFeedback(null);
    } catch (e) {
      console.error("Failed to clear API key", e);
    }
  };

  const generateFeedback = async () => {
    if (!user || !apiKey) return;
    setLoading(true);
    
    try {
      const logs = await fetchRecentLogs((user as any).uid, 7);
      
      const missingHabits = logs.reduce((acc, log) => acc + (6 - log.score), 0);
      const totalDeepWork = logs.reduce((acc, log) => acc + (log.focus_minutes || 0), 0);
      const daysTracked = logs.length;

      let summaryData = `User has tracked data for ${daysTracked} days this week.\n`;
      summaryData += `Total deep work minutes: ${totalDeepWork}.\n`;
      summaryData += `Total missed habits: ${missingHabits} out of a possible ${daysTracked * 6}.\n\n`;
      
      logs.forEach((log, index) => {
        summaryData += `Day ${index + 1}: Score ${log.score}/6, Deep Work: ${log.focus_minutes}m.\n`;
        if (log.reflection_fails || log.reflection_fixes) {
          summaryData += `  User's reflection fail: "${log.reflection_fails || 'None'}", Fix plan: "${log.reflection_fixes || 'None'}"\n`;
        }
      });

      const systemPrompt = `You are an elite, raw, and unfiltered accountability coach. Your tone is similar to David Goggins or a strict drill sergeant. You do not sugarcoat. You analyze the user's last 7 days of discipline data and give brutal, truthful feedback. 
Identify their excuses from their "reflection fail" notes. 
If they did well (e.g. lots of deep work, high scores), tell them not to get comfortable. 
If they did poorly, give them a harsh reality check.
Keep the response under 150 words. Be intense. DO NOT use markdown formatting like asterisks or bolding, just plain text.`;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemPrompt + "\n\nHere is the data:\n" + summaryData }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (data.error) {
         setFeedback("API Error: " + data.error.message);
      } else if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
         setFeedback(data.candidates[0].content.parts[0].text);
      } else {
         setFeedback("The coach remained silent. (Invalid response from API)");
      }

    } catch (e: any) {
      console.error(e);
      setFeedback("Failed to sync with the coach. Check your internet or API key validity.");
    } finally {
      setLoading(false);
    }
  };

  if (!isKeySaved) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AI SECURE UPLINK</Text>
        <Text style={styles.subtitle}>Provide your Gemini API Key to activate the Coach.</Text>
        
        <View style={styles.keyContainer}>
          <Text style={styles.keyInstructions}>This key is saved strictly on this device and never uploaded to any database. You can get a free key from Google AI Studio.</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste Gemini API Key here..."
            placeholderTextColor="#666"
            secureTextEntry
            value={inputKey}
            onChangeText={setInputKey}
          />
          <TouchableOpacity style={styles.button} onPress={saveApiKey}>
            <Text style={styles.buttonText}>ACTIVATE COACH</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>AI COACH</Text>
          <Text style={styles.subtitle}>Raw, unfiltered accountability.</Text>
        </View>
        <TouchableOpacity style={styles.resetKeyBtn} onPress={clearApiKey}>
          <Text style={styles.resetKeyText}>Reset Key</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#0A0A0B',
    padding: 24,
    paddingTop: 64,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  resetKeyBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
  },
  resetKeyText: {
    color: '#666',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  keyContainer: {
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  keyInstructions: {
    color: '#888',
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
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
    borderColor: 'red',
    borderRadius: 8,
    padding: 24,
    maxHeight: '80%',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 28,
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
