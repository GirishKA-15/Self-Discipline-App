import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchRecentLogs } from '../services/db';
import { useTheme } from '../context/ThemeContext';

interface StreakProps {
  userId: string;
}

export default function StreakWidget({ userId }: StreakProps) {
  const { colors, isDark } = useTheme();
  const [streak, setStreak] = useState(0);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    loadStreak();
  }, [userId]);

  const loadStreak = async () => {
    try {
      const logs = await fetchRecentLogs(userId, 14);
      let count = 0;
      let broken = false;

      logs.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      const today = new Date().toISOString().split('T')[0];
      
      let validLogs = logs;
      if (logs.length > 0 && logs[0].date === today && logs[0].score < 6) {
         validLogs = logs.slice(1);
      }

      for (let i = 0; i < validLogs.length; i++) {
        if (validLogs[i].score === 6) {
          count++;
        } else {
          broken = true;
          break;
        }
      }

      setStreak(count);
      setIsBroken(broken && count === 0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[
      styles.container, 
      { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(74, 222, 128, 0.05)' : 'rgba(52, 199, 89, 0.08)' },
      isBroken && { borderColor: colors.danger, backgroundColor: isDark ? 'rgba(255, 68, 68, 0.05)' : 'rgba(255, 59, 48, 0.08)' }
    ]}>
      <Text style={[styles.title, { color: colors.textMuted }]}>CURRENT STREAK</Text>
      <View style={styles.metric}>
        <Text style={[styles.number, { color: isBroken ? colors.danger : colors.primary }]}>
          {streak}
        </Text>
        <Text style={[styles.days, { color: colors.textMuted }]}>DAYS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  number: {
    fontSize: 32,
    fontWeight: '900',
    marginRight: 8,
  },
  days: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
