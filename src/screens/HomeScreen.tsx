// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  RefreshControl, 
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  Image
} from 'react-native';
import { 
  Appbar, 
  Text, 
  FAB,
  Snackbar,
  Portal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { ProfileHeader, TodayScheduleCard } from '../components/ui';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { formatTime, formatDate } from '../utils/dateTime';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

// Animated Activity Item Component
const AnimatedActivityItem: React.FC<{
  title: string;
  time: string;
  icon: string;
  iconColor: string;
  delay?: number;
}> = ({ title, time, icon, iconColor, delay = 0 }) => {
  const translateX = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const animatedStyle = {
    transform: [{ translateX }, { scale: scaleAnim }],
    opacity,
  };

  return (
    <Animated.View style={[styles.activityItem, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.05)', borderless: false }}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: SPACING.sm }}
      >
        <View style={[styles.activityIcon, { backgroundColor: iconColor }]}>
          <MaterialCommunityIcons 
            name={icon as any} 
            size={20} 
            color={COLORS.text.white}
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activityTime}>{formatDate(time)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Animated Stat Card Component
const AnimatedStatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
  delay?: number;
}> = ({ title, value, icon, color, delay = 0 }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const animatedStyle = {
    transform: [{ translateY }, { scale: scaleAnim }],
    opacity,
  };

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(0,0,0,0.1)', borderless: false }}
      >
        <View style={{ alignItems: 'center' }}>
          <MaterialCommunityIcons 
            name={icon as any} 
            size={28} 
            color={color} 
            style={{ marginBottom: SPACING.xs }}
          />
          <Text style={styles.statNumber}>{value}</Text>
          <Text style={styles.statLabel}>{title}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// Animated Quick Action Button Component
const AnimatedQuickActionButton: React.FC<{
  action: QuickAction;
  style?: any;
}> = ({ action, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        style={[styles.quickActionButton, { backgroundColor: action.color }, style]}
        onPress={action.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: false }}
      >
        <View style={styles.quickActionIconContainer}>
          <MaterialCommunityIcons 
            name={action.icon as any} 
            size={28} 
            color={COLORS.text.white}
          />
        </View>
        <Text style={styles.quickActionText}>{action.title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const HomeScreen: React.FC = () => {
  const { user, logout, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutSnackbar, setShowLogoutSnackbar] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  // Initialize FAB animations
  useEffect(() => {
    // Animate FAB entrance
    Animated.sequence([
      Animated.delay(1000),
      Animated.spring(fabScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    // Start FAB pulse animation
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };

    const pulseTimeout = setTimeout(startPulse, 2000);
    return () => clearTimeout(pulseTimeout);
  }, []);

  // Quick actions data
  const quickActions: QuickAction[] = [
    {
      id: 'qr-attendance',
      title: 'QR Attendance',
      icon: 'qrcode-scan',
      color: COLORS.status.success,
      onPress: () => {
        navigation.navigate('QRAttendance' as never);
      },
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: 'calendar-month',
      color: COLORS.primary,
      onPress: () => {
        navigation.navigate('Schedule' as never);
      },
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'account-edit',
      color: COLORS.secondary,
      onPress: () => {
        navigation.navigate('Profile' as never);
      },
    },
    {
      id: 'stats',
      title: 'Statistics',
      icon: 'chart-line',
      color: COLORS.status.teal,
      onPress: () => {
        console.log('Navigate to stats');
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'cog',
      color: COLORS.status.warning,
      onPress: () => {
        console.log('Navigate to settings');
      },
    },
    {
      id: 'attendance',
      title: 'Attendance Record',
      icon: 'calendar-check',
      color: COLORS.accent.blue,
      onPress: () => {
        navigation.navigate('Attendance' as never);
      },
    },
  ];

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutSnackbar(true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const TouchableOpacity = require('react-native').TouchableOpacity;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={COLORS.gradient.background}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top }]}>
        <Animated.View style={[styles.headerOverlay, { opacity: headerOpacity }]} />
        <Appbar style={styles.appbar}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="view-dashboard" size={24} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleLogout} style={{ padding: 8 }}>
                <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Appbar>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 56 } // Header height
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressViewOffset={insets.top + 56}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <ProfileHeader />

        {/* Today Schedule Card */}
        <TodayScheduleCard />

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <View key={action.id} style={styles.quickActionCard}>
                <AnimatedQuickActionButton action={action} />
              </View>
            ))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-box" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>This Month's Statistics</Text>
          </View>
          <View style={styles.statsGrid}>
            <AnimatedStatCard
              title="Work Days"
              value={String(user?.schedule?.length || 0)}
              icon="calendar-check"
              color={COLORS.primary}
              delay={0}
            />
            
            <AnimatedStatCard
              title="Hours/Day"
              value="8"
              icon="clock-outline"
              color={COLORS.secondary}
              delay={100}
            />
            
            <AnimatedStatCard
              title="Attendance"
              value="95%"
              icon="trophy"
              color={COLORS.status.warning}
              delay={200}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <View style={styles.activityList}>
            <AnimatedActivityItem
              title="Morning shift completed"
              time="2 hours ago"
              icon="check"
              iconColor={COLORS.status.success}
              delay={0}
            />
            
            <AnimatedActivityItem
              title="Profile updated"
              time="1 day ago"
              icon="update"
              iconColor={COLORS.status.info}
              delay={100}
            />
            
            <AnimatedActivityItem
              title="New schedule added"
              time="3 days ago"
              icon="calendar-plus"
              iconColor={COLORS.status.warning}
              delay={200}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <Portal>
        <Animated.View
          style={{
            transform: [{ scale: fabScale }, { scale: fabPulse }],
          }}
        >
          <View style={[styles.fabContainer, { bottom: insets.bottom + 16 }]}>
            <LinearGradient
              colors={COLORS.gradient.accent}
              style={styles.fab}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity 
                style={styles.fabButton}
                onPress={() => setFabOpen(!fabOpen)}
              >
                <MaterialCommunityIcons name="plus" size={28} color={COLORS.text.white} />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>
      </Portal>

      {/* Logout Snackbar */}
      <Snackbar
        visible={showLogoutSnackbar}
        onDismiss={() => setShowLogoutSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>Successfully logged out</Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: COLORS.primary,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.white,
    marginLeft: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Space for FAB
  },

  quickActionsContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  quickActionCard: {
    width: (width - (SPACING.md * 2) - SPACING.sm) / 2, // 2 columns with margins
  },
  quickActionButton: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.white,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
    textAlign: 'center',
  },
  activityContainer: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityList: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.secondary,
  },
  bottomSpacing: {
    height: SPACING['2xl'],
  },
  fabContainer: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snackbar: {
    backgroundColor: COLORS.status.success,
    marginBottom: Platform.OS === 'ios' ? 90 : 60,
  },
  snackbarText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.white,
  },
});

export default HomeScreen;