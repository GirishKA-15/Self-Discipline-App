import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tickCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  icon: {
    marginTop: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.5,
  },
});

interface HabitToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const HabitToggleComponent = ({ label, value, onValueChange, disabled = false }: HabitToggleProps) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.container, 
        { backgroundColor: colors.card, borderColor: colors.border },
        value && { borderColor: colors.primary, backgroundColor: isDark ? 'rgba(74, 222, 128, 0.05)' : 'rgba(52, 199, 89, 0.08)' }
      ]}
      onPress={() => !disabled && onValueChange(!value)}
    >
      <View style={[styles.tickCircle, { borderColor: isDark ? '#444' : '#ccc' }, value && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        {value && <Feather name="check" size={18} color="#fff" style={styles.icon} />}
      </View>
      <Text style={[styles.label, { color: colors.text }, value && { color: colors.primary, textDecorationLine: 'line-through', opacity: 0.8 }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const HabitToggle = React.memo(HabitToggleComponent);
HabitToggle.displayName = 'HabitToggle';

export default HabitToggle;
