// src/types/user.ts
import { ScheduleItem } from './schedule';

export interface User {
  _id?: string;
  uid: string;
  name: string;
  username?: string; // Sama dengan employeeId
  position?: string;
  role?: string; // Opsional, bisa "admin", "staff", dll.
  email?: string | null;
  location?: string;
  photoURL?: string; // Legacy field, use profileImage instead
  department?: string;
  phoneNumber?: string;
  joinDate?: string;
  schedule?: ScheduleItem[];
  profileImage?: ProfileImage;
  metadata?: UserMetadata;
}

export interface ProfileImage {
  original: string;
  thumbnail: string;
  small: string;
  medium: string;
}

export interface UserMetadata {
  totalScheduledDays?: number;
  lastLoginAt?: string;
  accountCreatedAt?: string;
  profileUpdatedAt?: string;
}