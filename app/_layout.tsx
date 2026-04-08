import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider as AppThemeProvider } from '../context/ThemeContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, Platform } from 'react-native';

// App Version: 1.0.3 - COMPLETE LOGO & SPEED FIX (Busting All Caches)
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { user, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Only hide splash screen after auth is fully loaded or on web where there's no native splash
    if (Platform.OS === 'web') {
      SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [user, authLoading, segments]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
      <StatusBar style="auto" />
    </AppThemeProvider>
  );
}
