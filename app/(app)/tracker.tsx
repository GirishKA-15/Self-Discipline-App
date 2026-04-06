import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchRecentLogs, DailyLog } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';
import { Feather } from '@expo/vector-icons';

const HABITS = [
  { key: 'wakeup', label: 'Wake up 05:00' },
  { key: 'gym', label: 'Gym / Physical' },
  { key: 'deep_work_completed', label: 'Deep Work' },
  { key: 'no_distractions', label: 'No Social Media' },
  { key: 'skill_learning', label: 'Skill Learning' },
  { key: 'sleep_on_time', label: 'Sleep on time' },
];

const DayHeaderComponent = ({ day, dayOfWeek, colors }: { day: number, dayOfWeek: string, colors: any }) => (
  <View style={[styles.dayHeaderCell, { borderBottomColor: colors.border, borderRightColor: colors.border }]}>
    <Text style={[styles.dayOfWeekText, { color: colors.textMuted }]}>{dayOfWeek}</Text>
    <Text style={[styles.dayNumberText, { color: colors.text }]}>{day}</Text>
  </View>
);
const DayHeader = React.memo(DayHeaderComponent);
DayHeader.displayName = 'DayHeader';

const HabitCellComponent = ({ isDone, colors, isDark, borderRightColor, borderBottomColor }: { 
  isDone: boolean, 
  colors: any, 
  isDark: boolean, 
  borderRightColor: string,
  borderBottomColor: string
}) => (
  <View style={[
    styles.gridCell,
    {
      borderRightColor,
      borderBottomColor,
      backgroundColor: isDone ? (isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(52, 199, 89, 0.1)') : 'transparent'
    }
  ]}>
    {isDone ? (
      <Feather name="check-square" size={16} color={colors.primary} />
    ) : (
      <Feather name="square" size={16} color={colors.border} />
    )}
  </View>
);
const HabitCell = React.memo(HabitCellComponent);
HabitCell.displayName = 'HabitCell';

export default function TrackerScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = date.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    if (user) loadMonthData();
  }, [user]);

  const loadMonthData = async () => {
    try {
      const recent = await fetchRecentLogs((user as any).uid, 60); 
      setLogs(recent);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const logMap = React.useMemo(() => {
    const map: Record<string, DailyLog> = {};
    logs.forEach(log => { if (log.date) map[log.date] = log; });
    return map;
  }, [logs]);

  const generateDateString = (day: number) => new Date(year, month, day).toISOString().split('T')[0];
  const getDayOfWeek = (day: number) => new Date(year, month, day).toDateString().substring(0, 2);
  const daysArray = React.useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>TRACKER</Text>
        <Text style={[styles.quoteText, { color: colors.textMuted }]}>
          “ಸತ್ತ ಮೇಲೆ ಮಲಗೋದು ಇದ್ದೇ ಇದೆ ಎದ್ದಿದ್ದಾಗ ಏನಾದ್ರೂ ಸಾಧಿಸು”
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{monthName} {year} Overview</Text>

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Habits</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{HABITS.length}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Days</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{daysInMonth}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Logged</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {logs.filter(l => l.date && l.date.startsWith(`${year}-${(month+1).toString().padStart(2, '0')}`)).length}
          </Text>
        </View>
      </View>

      <View style={[styles.matrixWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={[styles.fixedColumn, { borderRightColor: colors.border }]}>
          <View style={[styles.headerCell, styles.cornerCell, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerText, { color: colors.text }]}>My Habits</Text>
          </View>
          {HABITS.map((habit, idx) => (
            <View key={habit.key} style={[styles.habitRowHeader, { borderBottomColor: idx === HABITS.length - 1 ? 'transparent' : colors.border }]}>
              <Text style={[styles.habitLabel, { color: colors.text }]} numberOfLines={1}>{habit.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollGrid}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              {daysArray.map((day) => (
                <DayHeader key={`header-${day}`} day={day} dayOfWeek={getDayOfWeek(day)} colors={colors} />
              ))}
            </View>
            {HABITS.map((habit, rIdx) => (
              <View key={`row-${habit.key}`} style={{ flexDirection: 'row' }}>
                {daysArray.map((day) => {
                  const isDone = logMap[generateDateString(day)] ? (logMap[generateDateString(day)] as any)[habit.key] : false;
                  return (
                    <HabitCell 
                      key={`cell-${day}-${habit.key}`}
                      isDone={isDone}
                      colors={colors}
                      isDark={isDark}
                      borderRightColor={colors.border}
                      borderBottomColor={rIdx === HABITS.length - 1 ? 'transparent' : colors.border}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 64,
    paddingBottom: 48,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  matrixWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fixedColumn: {
    width: 140,
    borderRightWidth: 1,
    zIndex: 10,  
  },
  scrollGrid: {
    flex: 1,
  },
  headerCell: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  cornerCell: {
    alignItems: 'flex-start',
    paddingLeft: 12,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  habitRowHeader: {
    height: 48,
    justifyContent: 'center',
    paddingLeft: 12,
    borderBottomWidth: 1,
  },
  habitLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayHeaderCell: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  dayOfWeekText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '900',
  },
  gridCell: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});
