// screens/HomeScreen.tsx
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
import ProfileHeader from '../components/ProfileHeader';
import TodayScheduleCard from '../components/TodayScheduleCard';
import CurrentTime from '../components/currentTime';

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
      color: '#4CAF50',
      onPress: () => {
        // Navigate to schedule screen
        console.log('Navigate to schedule');
      }
    },
    {
      id: 'request',
      title: 'Ajukan Cuti',
      icon: 'calendar-remove',
      color: '#FF9800',
      onPress: () => {
        // Navigate to leave request screen
        console.log('Navigate to leave request');
      }
    },
    {
      id: 'swap',
      title: 'Tukar Shift',
      icon: 'swap-horizontal',
      color: '#2196F3',
      onPress: () => {
        // Navigate to shift swap screen
        console.log('Navigate to shift swap');
      }
    },
    {
      id: 'history',
      title: 'Riwayat',
      icon: 'history',
      color: '#9C27B0',
      onPress: () => {
        // Navigate to history screen
        console.log('Navigate to history');
      }
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProfile();
      // Add other refresh logic here
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowLogoutSnackbar(true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#00425A" 
        translucent={false}
      />
      
      <View style={styles.container}>
        {/* Animated Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Appbar.Header style={styles.appbar}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons name="home" size={24} color="#FFFFFF" />
                <Text style={styles.headerTitle}>Home</Text>
              </View>
              <View style={styles.headerRight}>
                <Appbar.Action 
                  icon="bell-outline" 
                  iconColor="#FFFFFF" 
                  size={24}
                  onPress={() => console.log('Notifications')}
                />
                <Appbar.Action 
                  icon="logout" 
                  iconColor="#FFFFFF" 
                  size={24}
                  onPress={handleLogout} 
                />
              </View>
            </View>
          </Appbar.Header>
        </Animated.View>

        {/* Scrollable Content */}
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#F9B233']}
              tintColor="#F9B233"
              progressBackgroundColor="#FFFFFF"
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Profile Section */}
          <ProfileHeader />

          {/* Main Content Container */}
          <View style={styles.contentContainer}>
            {/* Time Widget */}
            {/* <CurrentTime /> */}

            {/* Schedule Card */}
            <TodayScheduleCard />

            {/* Quick Actions Grid */}
            <View style={styles.quickActionsContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#00425A" />
                <Text style={styles.sectionTitle}>Aksi Cepat</Text>
              </View>
              
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action, index) => (
                  <Animated.View
                    key={action.id}
                    style={[
                      styles.quickActionCard,
                      {
                        transform: [{
                          scale: scrollY.interpolate({
                            inputRange: [0, 100],
                            outputRange: [1, 0.95],
                            extrapolate: 'clamp',
                          })
                        }]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.quickActionButton, { backgroundColor: action.color }]}
                      onPress={action.onPress}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons 
                        name={action.icon as any} 
                        size={28} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.quickActionText}>{action.title}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-line" size={20} color="#00425A" />
                <Text style={styles.sectionTitle}>Statistik Bulan Ini</Text>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="calendar-check" size={32} color="#4CAF50" />
                  <Text style={styles.statNumber}>22</Text>
                  <Text style={styles.statLabel}>Hari Kerja</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="calendar-remove" size={32} color="#FF5722" />
                  <Text style={styles.statNumber}>2</Text>
                  <Text style={styles.statLabel}>Hari Libur</Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="clock-check" size={32} color="#2196F3" />
                  <Text style={styles.statNumber}>176</Text>
                  <Text style={styles.statLabel}>Jam Kerja</Text>
                </View>
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.activityContainer}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="history" size={20} color="#00425A" />
                <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
              </View>
              
              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#4CAF50' }]}>
                    <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Shift Pagi Selesai</Text>
                    <Text style={styles.activityTime}>Kemarin, 17:00</Text>
                  </View>
                </View>
                
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#FF9800' }]}>
                    <MaterialCommunityIcons name="swap-horizontal" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Tukar Shift Disetujui</Text>
                    <Text style={styles.activityTime}>2 hari yang lalu</Text>
                  </View>
                </View>
                
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
                    <MaterialCommunityIcons name="calendar-plus" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Jadwal Baru Ditambahkan</Text>
                    <Text style={styles.activityTime}>3 hari yang lalu</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </View>
        </Animated.ScrollView>

        {/* Floating Action Button */}
        <Portal>
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'plus'}
            actions={[
              {
                icon: 'calendar-plus',
                label: 'Tambah Jadwal',
                onPress: () => console.log('Add Schedule'),
                color: '#4CAF50',
              },
              {
                icon: 'account-switch',
                label: 'Tukar Shift',
                onPress: () => console.log('Swap Shift'),
                color: '#2196F3',
              },
              {
                icon: 'calendar-remove',
                label: 'Ajukan Cuti',
                onPress: () => console.log('Request Leave'),
                color: '#FF9800',
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            fabStyle={styles.fab}
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
    </>
  );
};

const TouchableOpacity = require('react-native').TouchableOpacity;

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
    backgroundColor: '#00425A',
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
    color: '#00425A',
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
    backgroundColor: '#F8F9FA',
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
    color: '#00425A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
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
    backgroundColor: '#F8F9FA',
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
    color: '#00425A',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  bottomSpacing: {
    height: 32,
  },
  fab: {
    backgroundColor: '#F9B233',
  },
  snackbar: {
    backgroundColor: '#4CAF50',
    marginBottom: Platform.OS === 'ios' ? 90 : 60,
  },
  snackbarText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default HomeScreen;