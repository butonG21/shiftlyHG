// src/components/profile/ProfileSettingsTab.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  Divider,
  Button,
  Dialog,
  Portal,
  RadioButton,
  List,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { ProfileSettings } from '../../types/profile';

interface SettingItemProps {
  title: string;
  description?: string;
  icon: string;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  rightElement?: React.ReactNode;
  gradient?: readonly string[];
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  icon,
  type,
  value,
  onPress,
  onToggle,
  rightElement,
  gradient,
  danger = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const renderRightElement = () => {
    if (rightElement) return rightElement;
    
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={value}
            onValueChange={onToggle}
            color={COLORS.primary}
          />
        );
      case 'navigation':
        return (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={COLORS.text.secondary}
          />
        );
      default:
        return null;
    }
  };

  const content = (
    <Card style={styles.settingCard}>
      <Card.Content style={styles.settingContent}>
        <View style={styles.settingLeft}>
          <View style={[
            styles.settingIcon,
            gradient && { backgroundColor: 'transparent' }
          ]}>
            {gradient ? (
              <LinearGradient
                colors={[gradient[0] || COLORS.primary, gradient[1] || gradient[0] || COLORS.primary]}
                style={styles.settingIconGradient}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={24}
                  color={COLORS.text.white}
                />
              </LinearGradient>
            ) : (
              <MaterialCommunityIcons
                name={icon as any}
                size={24}
                color={danger ? COLORS.status.error : COLORS.primary}
              />
            )}
          </View>
          <View style={styles.settingInfo}>
            <Text style={[
              styles.settingTitle,
              danger && { color: COLORS.status.error }
            ]}>
              {title}
            </Text>
            {description && (
              <Text style={styles.settingDescription}>{description}</Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {renderRightElement()}
        </View>
      </Card.Content>
    </Card>
  );

  if (type === 'switch') {
    return (
      <Animated.View style={animatedStyle}>
        {content}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
};

const ProfileSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<ProfileSettings>({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      attendanceReminders: true,
      scheduleUpdates: true,
      achievementAlerts: true,
    },
    security: {
      biometricLogin: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      autoLock: true,
    },
    privacy: {
      profileVisibility: 'team_only',
      shareAttendanceStats: true,
      shareAchievements: true,
      allowDataExport: false,
    },
    preferences: {
      language: 'id',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      theme: 'auto',
    },
  });

  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showTimeFormatDialog, setShowTimeFormatDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const updateSetting = (category: keyof ProfileSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleExportData = () => {
    setShowExportDialog(false);
    Alert.alert(
      'Export Started',
      'Your data export has been initiated. You will receive an email with the download link within 24 hours.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.');
          },
        },
      ]
    );
  };

  const languageOptions = [
    { label: 'Bahasa Indonesia', value: 'id' },
    { label: 'English', value: 'en' },
  ];

  const themeOptions = [
    { label: 'Auto', value: 'auto' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  const timeFormatOptions = [
    { label: '24 Hour', value: '24h' },
    { label: '12 Hour', value: '12h' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingsGroup}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <SettingItem
              title="Push Notifications"
              description="Receive notifications on your device"
              icon="bell"
              type="switch"
              value={settings.notifications.pushNotifications}
              onToggle={(value) => updateSetting('notifications', 'pushNotifications', value)}
              gradient={COLORS.gradient.primary}
            />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(200)}>
            <SettingItem
              title="Email Notifications"
              description="Receive notifications via email"
              icon="email"
              type="switch"
              value={settings.notifications.emailNotifications}
              onToggle={(value) => updateSetting('notifications', 'emailNotifications', value)}
              gradient={COLORS.gradient.secondary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <SettingItem
              title="Attendance Reminders"
              description="Get reminded about clock in/out"
              icon="clock-alert"
              type="switch"
              value={settings.notifications.attendanceReminders}
              onToggle={(value) => updateSetting('notifications', 'attendanceReminders', value)}
              gradient={COLORS.gradient.accent}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <SettingItem
              title="Schedule Updates"
              description="Notifications for schedule changes"
              icon="calendar-clock"
              type="switch"
              value={settings.notifications.scheduleUpdates}
              onToggle={(value) => updateSetting('notifications', 'scheduleUpdates', value)}
              gradient={COLORS.gradient.warning}
            />
          </Animated.View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.settingsGroup}>
          <Animated.View entering={FadeInDown.delay(500)}>
            <SettingItem
              title="Biometric Login"
              description="Use fingerprint or face recognition"
              icon="fingerprint"
              type="switch"
              value={settings.security.biometricLogin}
              onToggle={(value) => updateSetting('security', 'biometricLogin', value)}
              gradient={COLORS.gradient.primary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)}>
            <SettingItem
              title="Two-Factor Authentication"
              description="Add an extra layer of security"
              icon="shield-check"
              type="switch"
              value={settings.security.twoFactorAuth}
              onToggle={(value) => updateSetting('security', 'twoFactorAuth', value)}
              gradient={COLORS.gradient.secondary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700)}>
            <SettingItem
              title="Change Password"
              description="Update your account password"
              icon="lock-reset"
              type="navigation"
              onPress={() => {}}
              gradient={COLORS.gradient.accent}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800)}>
            <SettingItem
              title="Auto Lock"
              description="Lock app when inactive"
              icon="lock-clock"
              type="switch"
              value={settings.security.autoLock}
              onToggle={(value) => updateSetting('security', 'autoLock', value)}
              gradient={COLORS.gradient.warning}
            />
          </Animated.View>
        </View>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingsGroup}>
          <Animated.View entering={FadeInDown.delay(900)}>
            <SettingItem
              title="Profile Visibility"
              description="Who can see your profile"
              icon="account-eye"
              type="navigation"
              onPress={() => {}}
              rightElement={
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>Team</Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.text.secondary}
                  />
                </View>
              }
              gradient={COLORS.gradient.primary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1000)}>
            <SettingItem
              title="Share Attendance Stats"
              description="Allow sharing attendance statistics"
              icon="chart-line"
              type="switch"
              value={settings.privacy.shareAttendanceStats}
              onToggle={(value) => updateSetting('privacy', 'shareAttendanceStats', value)}
              gradient={COLORS.gradient.secondary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1100)}>
            <SettingItem
              title="Share Achievements"
              description="Show your achievements to team"
              icon="trophy"
              type="switch"
              value={settings.privacy.shareAchievements}
              onToggle={(value) => updateSetting('privacy', 'shareAchievements', value)}
              gradient={COLORS.gradient.accent}
            />
          </Animated.View>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsGroup}>
          <Animated.View entering={FadeInDown.delay(1200)}>
            <SettingItem
              title="Language"
              description="Choose your preferred language"
              icon="translate"
              type="navigation"
              onPress={() => setShowLanguageDialog(true)}
              rightElement={
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {languageOptions.find(opt => opt.value === settings.preferences.language)?.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.text.secondary}
                  />
                </View>
              }
              gradient={COLORS.gradient.primary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1300)}>
            <SettingItem
              title="Theme"
              description="Choose app appearance"
              icon="palette"
              type="navigation"
              onPress={() => setShowThemeDialog(true)}
              rightElement={
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {themeOptions.find(opt => opt.value === settings.preferences.theme)?.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.text.secondary}
                  />
                </View>
              }
              gradient={COLORS.gradient.secondary}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1350)}>
            <SettingItem
              title="Time Format"
              description="Choose time display format"
              icon="clock"
              type="navigation"
              onPress={() => setShowTimeFormatDialog(true)}
              rightElement={
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {timeFormatOptions.find(opt => opt.value === settings.preferences.timeFormat)?.label}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={COLORS.text.secondary}
                  />
                </View>
              }
              gradient={COLORS.gradient.accent}
            />
          </Animated.View>
        </View>
      </View>

      {/* Data & Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        <View style={styles.settingsGroup}>
          <Animated.View entering={FadeInDown.delay(1400)}>
            <SettingItem
              title="Export Data"
              description="Download your personal data"
              icon="download"
              type="navigation"
              onPress={() => setShowExportDialog(true)}
              gradient={COLORS.gradient.accent}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(1500)}>
            <SettingItem
              title="Clear Cache"
              description="Free up storage space"
              icon="broom"
              type="navigation"
              onPress={() => {
                Alert.alert('Cache Cleared', 'App cache has been cleared successfully.');
              }}
              gradient={COLORS.gradient.warning}
            />
          </Animated.View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.status.error }]}>
          Danger Zone
        </Text>
        <View style={styles.settingsGroup}>
          <Animated.View entering={FadeInDown.delay(1600)}>
            <SettingItem
              title="Delete Account"
              description="Permanently delete your account"
              icon="delete-forever"
              type="navigation"
              onPress={handleDeleteAccount}
              danger
            />
          </Animated.View>
        </View>
      </View>

      {/* Language Dialog */}
      <Portal>
        <Dialog
          visible={showLanguageDialog}
          onDismiss={() => setShowLanguageDialog(false)}
        >
          <Dialog.Title>Choose Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => updateSetting('preferences', 'language', value)}
              value={settings.preferences.language}
            >
              {languageOptions.map((option) => (
                <RadioButton.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Theme Dialog */}
      <Portal>
        <Dialog
          visible={showThemeDialog}
          onDismiss={() => setShowThemeDialog(false)}
        >
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => updateSetting('preferences', 'theme', value)}
              value={settings.preferences.theme}
            >
              {themeOptions.map((option) => (
                <RadioButton.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowThemeDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Time Format Dialog */}
      <Portal>
        <Dialog
          visible={showTimeFormatDialog}
          onDismiss={() => setShowTimeFormatDialog(false)}
        >
          <Dialog.Title>Choose Time Format</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => updateSetting('preferences', 'timeFormat', value)}
              value={settings.preferences.timeFormat}
            >
              {timeFormatOptions.map((option) => (
                <RadioButton.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTimeFormatDialog(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Export Dialog */}
      <Portal>
        <Dialog
          visible={showExportDialog}
          onDismiss={() => setShowExportDialog(false)}
        >
          <Dialog.Title>Export Personal Data</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              This will create a copy of your personal data including:
            </Text>
            <View style={styles.exportList}>
              <Text style={styles.exportItem}>• Profile information</Text>
              <Text style={styles.exportItem}>• Attendance records</Text>
              <Text style={styles.exportItem}>• Leave requests</Text>
              <Text style={styles.exportItem}>• Activity logs</Text>
            </View>
            <Text style={styles.dialogText}>
              You will receive an email with the download link within 24 hours.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowExportDialog(false)}>Cancel</Button>
            <Button onPress={handleExportData} mode="contained">
              Export
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  settingsGroup: {
    gap: SPACING.md,
  },
  settingCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  settingRight: {
    marginLeft: SPACING.md,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  valueText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  dialogText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  exportList: {
    marginVertical: SPACING.md,
    paddingLeft: SPACING.md,
  },
  exportItem: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProfileSettingsTab;