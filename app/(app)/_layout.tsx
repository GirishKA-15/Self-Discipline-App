import React, { useEffect, memo } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BlurView } from 'expo-blur';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
} from 'react-native-reanimated';

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 150,
  mass: 0.6,
};

const TabSVGIcon = ({ name, color, size = 22 }: { name: string, color: string, size?: number }) => {
  if (name === 'home') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M9 21V12H15V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    );
  }
  if (name === 'grid') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
        <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
        <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
        <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2" />
      </Svg>
    );
  }
  if (name === 'user') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
      </Svg>
    );
  }
  return null;
};

const TabIcon = memo(({ name, focused, colors, label }: { name: any, focused: boolean, colors: any, label: string }) => {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const translateY = useSharedValue(focused ? -5 : 0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, SPRING_CONFIG);
    translateY.value = withSpring(focused ? -5 : 0, SPRING_CONFIG);
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <TabSVGIcon name={name} color={focused ? colors.primary : colors.textMuted} size={24} />
      <Text style={[
        styles.label, 
        { 
          color: focused ? colors.primary : colors.textMuted, 
          fontWeight: focused ? '900' : '700',
          marginTop: 6
        }
      ]}>
        {label}
      </Text>
    </Animated.View>
  );
});

function CustomTabBar({ state, descriptors, navigation, colors, isDark }: any) {
  const { width } = useWindowDimensions();
  const TAB_BAR_MARGIN = 48;
  const TAB_WIDTH = (width - TAB_BAR_MARGIN) / 3;
  const scrollX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    scrollX.value = withSpring(state.index * TAB_WIDTH, SPRING_CONFIG);
  }, [state.index, TAB_WIDTH]);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: scrollX.value }],
    width: TAB_WIDTH,
  }));

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: isDark ? 'rgba(10,10,11,0.85)' : 'rgba(252,253,255,0.85)' }]}>
      <BlurView intensity={isDark ? 40 : 60} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
      <Animated.View style={[styles.slider, sliderStyle]}>
        <View style={[styles.innerPill, { backgroundColor: colors.primary }]} />
      </Animated.View>

      {state.routes.map((route: any, index: number) => {
        if (['timer', 'reflection', 'coach'].includes(route.name)) return null;
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => !isFocused && navigation.navigate(route.name)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <TabIcon 
              name={route.name === 'index' ? 'home' : route.name === 'tracker' ? 'grid' : 'user'} 
              focused={isFocused} 
              colors={colors} 
              label={route.name === 'index' ? 'Home' : route.name === 'tracker' ? 'Tracker' : 'Profile'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} colors={colors} isDark={isDark} />}
      screenOptions={{ headerShown: false, freezeOnBlur: true }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tracker" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="timer" options={{ href: null }} />
      <Tabs.Screen name="reflection" options={{ href: null }} />
      <Tabs.Screen name="coach" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 75,
    borderRadius: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 1000,
  },
  slider: {
    position: 'absolute',
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  innerPill: {
    width: '85%',
    height: '100%',
    borderRadius: 29,
    opacity: 0.12,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
