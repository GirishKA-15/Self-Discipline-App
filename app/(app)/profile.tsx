import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Switch } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchRecentLogs, DailyLog } from '../../services/db';
import ScoreBar from '../../components/ScoreBar';
import { useTheme } from '../../context/ThemeContext';
import { Calendar } from 'react-native-calendars';

const HistoryRowComponent = ({ date, score, colors }: { date: string, score: number, colors: any }) => (
  <View style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <Text style={[styles.historyDate, { color: colors.text }]}>{date}</Text>
    <View style={styles.historyScore}>
      <ScoreBar score={score} total={6} />
    </View>
  </View>
);
const HistoryRow = React.memo(HistoryRowComponent);
HistoryRow.displayName = 'HistoryRow';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const recent = await fetchRecentLogs((user as any).uid, 60); 
      setLogs(recent);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = () => {
    const last14 = logs.slice(0, 14);
    if (last14.length === 0) return 0;
    const total = last14.reduce((sum, log) => sum + (log.score || 0), 0);
    return (total / last14.length).toFixed(1);
  };
  
  const markedDates = React.useMemo(() => {
    const marked: any = {};
    logs.forEach(log => {
      if (log.date && log.score > 0) {
        marked[log.date] = { marked: true, dotColor: colors.primary };
      }
    });
    return marked;
  }, [logs, colors.primary]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>PROFILE</Text>
          <Text style={[styles.quoteText, { color: colors.textMuted }]}>
            “ಸತ್ತ ಮೇಲೆ ಮಲಗೋದು ಇದ್ದೇ ಇದೆ ಎದ್ದಿದ್ದಾಗ ಏನಾದ್ರೂ ಸಾಧಿಸು”
          </Text>
        </View>
        <View style={styles.themeToggle}>
          <Text style={[styles.themeLabel, { color: colors.textMuted }]}>{isDark ? 'DARK' : 'LIGHT'}</Text>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#e5e5ea', true: colors.primary }} />
        </View>
      </View>
      
      <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.email, { color: colors.text }]}>{(user as any)?.email}</Text>
        <Text style={[styles.uid, { color: colors.textMuted }]}>ID: {(user as any)?.uid?.substring(0, 8)}...</Text>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CALENDAR HISTORY</Text>
      <View style={[styles.calendarWrapper, { borderColor: colors.border }]}>
        <Calendar
          theme={{
            calendarBackground: colors.card,
            textSectionTitleColor: colors.textMuted,
            dayTextColor: colors.text,
            todayTextColor: colors.primary,
            monthTextColor: colors.text,
            arrowColor: colors.primary,
            dotColor: colors.primary,
          }}
          markedDates={markedDates}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>LAST 14 DAYS</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{logs.slice(0, 14).length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>DAYS TRACKED</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{calculateAverageScore()}/6</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>AVG SCORE</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>RECENT PERFORMANCES</Text>
      {logs.slice(0, 5).map((log, i) => (
        <HistoryRow key={i} date={log.date || ''} score={log.score} colors={colors} />
      ))}

      <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.danger, backgroundColor: isDark ? 'rgba(255, 68, 68, 0.1)' : 'transparent' }]} onPress={logout}>
        <Text style={[styles.logoutBtnText, { color: colors.danger }]}>LOGOUT</Text>
      </TouchableOpacity>
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
    paddingBottom: 48,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  quoteText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 14,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  themeLabel: {
    marginRight: 8,
    fontSize: 10,
    fontWeight: 'bold',
  },
  identityCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uid: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 16,
  },
  calendarWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  historyDate: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyScore: {
    width: 150,
  },
  logoutBtn: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 48,
  },
  logoutBtnText: {
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
