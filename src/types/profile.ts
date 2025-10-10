// src/types/profile.ts
export interface ProfileStatistics {
  totalAttendance: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  overtimeHours: number;
  punctualityRate: number;
  attendanceRate: number;
  averageWorkHours: number;
  thisMonthAttendance: number;
  lastMonthAttendance: number;
  leaveBalance: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  emoji: string;
  category: 'attendance' | 'punctuality' | 'performance' | 'milestone';
  earnedDate: string;
  isEarned: boolean;
  progress?: number;
  maxProgress?: number;
  badgeColor: string;
}

export interface ActivityLog {
  id: string;
  type: 'check_in' | 'check_out' | 'break' | 'overtime' | 'leave' | 'meeting' | 'task' | 'announcement' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  iconColor?: string;
  location?: string;
  status?: 'success' | 'info' | 'warning' | 'error';
}

export interface ProfileSettings {
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    attendanceReminders: boolean;
    scheduleUpdates: boolean;
    achievementAlerts: boolean;
  };
  security: {
    biometricLogin: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    autoLock: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'team_only';
    shareAttendanceStats: boolean;
    shareAchievements: boolean;
    allowDataExport: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ProfileTabData {
  overview: {
    statistics: ProfileStatistics;
    personalInfo: any;
    recentAchievements: Achievement[];
  };
  activity: {
    recentActivities: ActivityLog[];
    weeklyStats: any;
  };
  settings: ProfileSettings;
  achievements: {
    earned: Achievement[];
    available: Achievement[];
    categories: string[];
  };
}

export interface ProfileHeaderData {
  coverPhoto?: string;
  avatar: string;
  name: string;
  position: string;
  department: string;
  location: string;
  joinDate: string;
  employeeId: string;
  status: 'active' | 'inactive' | 'on_leave';
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export type ProfileTab = 'overview' | 'activity' | 'settings' | 'achievements';

export interface ProfileScreenProps {
  navigation: any;
  route: any;
}