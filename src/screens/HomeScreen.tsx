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
  Platform
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
import { useAuth } from '../contexts/AuthContext';
import { ProfileHeader, TodayScheduleCard } from '../components/ui';
import { COLORS } from '../constants/colors';
import { formatTime } from '../utils/dateTime';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const HomeScreen: React.FC = () => {
  const { logout, user, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutSnackbar, setShowLogoutSnackbar] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Quick actions data
  const quickActions: QuickAction[] = [
    {
      id: 'schedule',
      title: 'Lihat Jadwal',
      icon: 'calendar-month',
      color: COLORS.primary,
      onPress: () => {
        console.log('Navigate to schedule');
      },
    },
    {
      id: 'profile',
      title: 'Edit Profil',
      icon: 'account-edit',
      color: COLORS.secondary,
      onPress: () => {
        console.log('Navigate to profile edit');
      },
    },
    {
      id: 'stats',
      title: 'Statistik',
      icon: 'chart-line',
      color: '#E91E63',
      onPress: () => {
        console.log('Navigate to stats');
      },
    },
    {
      id: 'settings',
      title: 'Pengaturan',
      icon: 'cog',
      color: '#9C27B0',
      onPress: () => {
        console.log('Navigate to settings');
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
        <View style={{ paddingHorizontal: 16 }}>
          <ProfileHeader />
        </View>

        {/* Today's Schedule Card */}
        <View style={{ paddingHorizontal: 16 }}>
          <TodayScheduleCard />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Aksi Cepat</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <View key={action.id} style={styles.quickActionCard}>
                <TouchableOpacity
                  style={[styles.quickActionButton, { backgroundColor: action.color }]}
                  onPress={action.onPress}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons 
                    name={action.icon as any} 
                    size={32} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chart-box" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Statistik Bulan Ini</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-check" size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{user?.schedule?.length || 0}</Text>
              <Text style={styles.statLabel}>Hari Kerja</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.secondary} />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Jam/Hari</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="trophy" size={24} color="#F9B233" />
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Kehadiran</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
          </View>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: COLORS.status.success }]}>
                <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Shift pagi selesai</Text>
                <Text style={styles.activityTime}>2 jam yang lalu</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: COLORS.status.info }]}>
                <MaterialCommunityIcons name="update" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Profil diperbarui</Text>
                <Text style={styles.activityTime}>1 hari yang lalu</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: COLORS.status.warning }]}>
                <MaterialCommunityIcons name="calendar-plus" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Jadwal baru ditambahkan</Text>
                <Text style={styles.activityTime}>3 hari yang lalu</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <Portal>
        <FAB
          style={[styles.fab, { bottom: insets.bottom + 16 }]}
          icon="plus"
          onPress={() => setFabOpen(!fabOpen)}
          color="#FFFFFF"
        />
      </Portal>

      {/* Logout Snackbar */}
      <Snackbar
        visible={showLogoutSnackbar}
        onDismiss={() => setShowLogoutSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>Berhasil logout</Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
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
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 44) / 2, // 2 columns with margins
  },
  quickActionButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 100,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activityContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  bottomSpacing: {
    height: 32,
  },
  fab: {
    backgroundColor: '#F9B233',
  },
  snackbar: {
    backgroundColor: COLORS.status.success,
    marginBottom: Platform.OS === 'ios' ? 90 : 60,
  },
  snackbarText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default HomeScreen;