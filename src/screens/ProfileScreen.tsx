// src/screens/ProfileScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  Appbar,
  Text,
  FAB,
  Portal,
  Modal,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';
import { ProfileScreenProps, ProfileTab, QuickAction } from '../types/profile';
import {
  ProfileOverviewTab,
  ProfileActivityTab,
  ProfileSettingsTab,
  ProfileAchievementsTab,
} from '../components/profile';

const { width, height } = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  // Tab navigation state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Overview', icon: 'view-dashboard' },
    { key: 'activity', title: 'Activity', icon: 'timeline' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
    { key: 'achievements', title: 'Achievements', icon: 'trophy' },
  ]);

  // Animation values
  const headerHeight = useSharedValue(280);
  const scrollY = useSharedValue(0);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 2000);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'edit',
      title: 'Edit Profile',
      icon: 'account-edit',
      color: COLORS.primary,
      onPress: () => setEditMode(!editMode),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'cog',
      color: COLORS.secondary,
      onPress: () => setIndex(2), // Navigate to settings tab
    },
  ];

  // Profile Header Component
  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <LinearGradient
        colors={COLORS.gradient.accent}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.patternCircle, styles.circle1]} />
          <View style={[styles.patternCircle, styles.circle2]} />
          <View style={[styles.patternCircle, styles.circle3]} />
        </View>

        {/* Cover Photo Section */}
        <View style={styles.coverPhotoContainer}>
          <Pressable
            style={styles.coverPhotoButton}
            onPress={() => setShowImagePicker(true)}
          >
            <MaterialCommunityIcons
              name="camera-plus"
              size={24}
              color={COLORS.text.white}
            />
            <Text style={styles.coverPhotoText}>Change Cover</Text>
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          {/* Avatar */}
          <Pressable
            style={styles.avatarContainer}
            onPress={() => setShowImagePicker(true)}
          >
            <LinearGradient
              colors={COLORS.gradient.secondary}
              style={styles.avatarGradient}
            >
              {user?.profileImage?.original || user?.photoURL ? (
                <Image
                  source={{
                    uri: user?.profileImage?.original || user?.photoURL,
                  }}
                  style={styles.avatar}
                  defaultSource={require('../../assets/default_avatar.png')}
                />
              ) : (
                <Image
                  source={require('../../assets/default_avatar.png')}
                  style={styles.avatar}
                />
              )}
            </LinearGradient>
            <View style={styles.avatarEditBadge}>
              <MaterialCommunityIcons
                name="camera"
                size={16}
                color={COLORS.text.white}
              />
            </View>
          </Pressable>

          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <View style={styles.positionContainer}>
              <MaterialCommunityIcons
                name="briefcase"
                size={16}
                color={COLORS.text.white}
              />
              <Text style={styles.positionText}>
                {user?.position || 'Employee'}
              </Text>
            </View>
            <View style={styles.departmentContainer}>
              <MaterialCommunityIcons
                name="domain"
                size={14}
                color={COLORS.text.white}
              />
              <Text style={styles.departmentText}>
                {user?.department || 'Department'}
              </Text>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={COLORS.text.white}
                style={{ marginLeft: 12 }}
              />
              <Text style={styles.locationText}>
                {user?.location || 'Location'}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={[styles.quickActionButton, { backgroundColor: action.color }]}
                onPress={action.onPress}
              >
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={20}
                  color={COLORS.text.white}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // Tab Bar Component
  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor={COLORS.primary}
      inactiveColor={COLORS.text.secondary}
      renderIcon={({ route, focused, color }: { route: { key: string; title: string; icon: string }; focused: boolean; color: string }) => (
        <MaterialCommunityIcons
          name={route.icon as any}
          size={20}
          color={color}
        />
      )}
      renderLabel={({ route, focused, color }: { route: { key: string; title: string; icon: string }; focused: boolean; color: string }) => (
        <Text style={[styles.tabLabel, { color }]}>{route.title}</Text>
      )}
      scrollEnabled={false}
      tabStyle={styles.tab}
    />
  );

  // Scene Map
  const renderScene = SceneMap({
    overview: ProfileOverviewTab,
    activity: ProfileActivityTab,
    settings: ProfileSettingsTab,
    achievements: ProfileAchievementsTab,
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />

      {/* Header */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          iconColor={COLORS.text.white}
        />
        <Appbar.Content
          title="Profile"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="dots-vertical"
          onPress={() => {}}
          iconColor={COLORS.text.white}
        />
      </Appbar.Header>

      {/* Profile Header */}
      <ProfileHeader />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width }}
          style={styles.tabView}
        />
      </View>

      {/* Image Picker Modal */}
      <Portal>
        <Modal
          visible={showImagePicker}
          onDismiss={() => setShowImagePicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Picture</Text>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowImagePicker(false)}
                style={styles.modalButton}
              >
                Camera
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowImagePicker(false)}
                style={styles.modalButton}
              >
                Gallery
              </Button>
            </View>
            <Button
              mode="text"
              onPress={() => setShowImagePicker(false)}
              style={styles.modalCancelButton}
            >
              Cancel
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  profileHeader: {
    height: 280,
  },
  headerGradient: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 150,
    height: 150,
    top: -50,
    right: -30,
  },
  circle2: {
    width: 100,
    height: 100,
    bottom: 30,
    left: -30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle3: {
    width: 80,
    height: 80,
    top: '40%',
    right: '25%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  coverPhotoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  coverPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  coverPhotoText: {
    color: COLORS.text.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: 6,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.text.white,
  },
  basicInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  positionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.white,
    marginLeft: 6,
  },
  departmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.white,
    marginLeft: 4,
    opacity: 0.9,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.white,
    marginLeft: 4,
    opacity: 0.9,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 15
  },
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: COLORS.background.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    width: width / 4,
  },
  tabIndicator: {
    backgroundColor: COLORS.primary,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    margin: SPACING.lg,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  modalCancelButton: {
    marginTop: SPACING.sm,
  },
});

export default ProfileScreen;