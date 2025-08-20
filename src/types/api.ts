// src/types/api.ts
import { User } from './user';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string | object;
  timestamp: string;
}

export interface LoginData {
  token: string;
  user: User;
  expiresIn: string;
}

export interface ProfileImageUploadData {
  user: {
    uid: string;
    name: string;
    profileImage: string;
    profileImageThumbnail: string;
  };
  imageVariants: {
    original: string;
    thumbnail: string;
    small: string;
    medium: string;
  };
  uploadInfo: {
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    fileId: string;
  };
}

export type StorageKey = 'TOKEN' | 'LOGIN_TIME' | 'USER_PROFILE';