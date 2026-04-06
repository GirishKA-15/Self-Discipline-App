import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ScoreBarProps {
  score: number;
  total: number;
}

export default function ScoreBar({ score, total }: ScoreBarProps) {
  const { colors } = useTheme();
  const percentage = total === 0 ? 0 : (score / total) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textMuted }]}>DAILY DISCIPLINE SCORE</Text>
        <Text style={[styles.scoreText, { color: colors.text }]}>{score} / {total}</Text>
      </View>
      <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
