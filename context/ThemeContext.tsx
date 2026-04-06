import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface Colors {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  danger: string;
}

const darkColors: Colors = {
  background: '#0A0A0B',
  card: '#151518',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  border: '#1E1E22',
  primary: '#22D3EE',
  danger: '#F43F5E',
};

const lightColors: Colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#4F46E5',
  danger: '#E11D48',
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: Colors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: darkColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_theme');
      if (saved !== null) {
        setIsDark(saved === 'dark');
      } else {
        setIsDark(systemTheme === 'dark');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('app_theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  if (!isLoaded) return null; // Avoid flashing wrong theme

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
