import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AttendanceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  type: string;
  time: string;
  address: string;
  image: string;
  date?: string;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  visible,
  onClose,
  type,
  time,
  address,
  image,
  date,
}) => {


  const insets = useSafeAreaInsets();

  const getTypeInfo = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    switch (normalizedType) {
      case 'clock in':
        return {
          icon: 'login',
          color: COLORS.status.success,
          gradientColors: ['#10b981', '#059669', '#047857'],
          title: 'Clock In',
          description: 'Waktu masuk kerja',
        };
      case 'clock out':
        return {
          icon: 'logout',
          color: COLORS.status.error,
          gradientColors: ['#ef4444', '#dc2626', '#b91c1c'],
          title: 'Clock Out',
          description: 'Waktu pulang kerja',
        };
      case 'break out':
        return {
          icon: 'pause-circle',
          color: COLORS.status.warning,
          gradientColors: ['#f59e0b', '#d97706', '#b45309'],
          title: 'Break Out',
          description: 'Mulai istirahat',
        };
      case 'break in':
        return {
          icon: 'play-circle',
          color: COLORS.status.info,
          gradientColors: ['#3b82f6', '#2563eb', '#1d4ed8'],
          title: 'Break In',
          description: 'Selesai istirahat',
        };
      // Legacy support for old types
      case 'check in':
        return {
          icon: 'login',
          color: COLORS.status.success,
          gradientColors: ['#10b981', '#059669', '#047857'],
          title: 'Clock In',
          description: 'Waktu masuk kerja',
        };
      case 'check out':
        return {
          icon: 'logout',
          color: COLORS.status.error,
          gradientColors: ['#ef4444', '#dc2626', '#b91c1c'],
          title: 'Clock Out',
          description: 'Waktu pulang kerja',
        };
      case 'break start':
        return {
          icon: 'pause-circle',
          color: COLORS.status.warning,
          gradientColors: ['#f59e0b', '#d97706', '#b45309'],
          title: 'Break Start',
          description: 'Mulai istirahat',
        };
      case 'break end':
        return {
          icon: 'play-circle',
          color: COLORS.status.info,
          gradientColors: ['#3b82f6', '#2563eb', '#1d4ed8'],
          title: 'Break End',
          description: 'Selesai istirahat',
        };
      default:
        return {
          icon: 'clock',
          color: COLORS.primary,
          gradientColors: ['#3b82f6', '#2563eb', '#1d4ed8'],
          title: type,
          description: 'Aktivitas absensi',
        };
    }
  };

  const typeInfo = getTypeInfo(type);

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === '00:00:00') {
      return 'Belum tercatat';
    }
    return timeString;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString.trim() === '' || dateString === 'Tanggal tidak tersedia') {
      return 'Tanggal tidak tersedia';
    }
    
    try {
      let date;
      
      // Handle YYYY-MM-DD format to avoid timezone issues
      if (dateString.includes('-') && dateString.length === 10) {
        const [yearStr, monthStr, dayStr] = dateString.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        
        // Validate date components
        if (isNaN(year) || isNaN(month) || isNaN(day) || 
            year < 1900 || year > 2100 || 
            month < 1 || month > 12 || 
            day < 1 || day > 31) {
          return 'Tanggal tidak tersedia';
        }
        
        date = new Date(year, month - 1, day); // month is 0-indexed
        
        // Double check if the date is valid after construction
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
          return 'Tanggal tidak tersedia';
        }
      } else if (dateString.includes('/')) {
        // Handle DD/MM/YYYY or MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format (Indonesian standard)
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
              year >= 1900 && year <= 2100 && 
              month >= 1 && month <= 12 && 
              day >= 1 && day <= 31) {
            date = new Date(year, month - 1, day);
          } else {
            return 'Tanggal tidak tersedia';
          }
        } else {
          return 'Tanggal tidak tersedia';
        }
      } else {
        // Check if it's already in "DD Month YYYY" format (Indonesian or English month names)
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December',
                           'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        const hasMonthName = monthNames.some(month => dateString.includes(month));
        
        if (hasMonthName) {
          // If it's already in a readable format with month names, return as is
          return dateString;
        }
        
        // Try to parse as a general date string
        date = new Date(dateString);
      }
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak tersedia';
      }
      
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      
      return formattedDate;
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Tanggal tidak tersedia';
    }
  };

  const formatDateTime = (dateString?: string, timeString?: string) => {
    if (!timeString || timeString === '00:00:00') {
      return 'Belum tercatat';
    }
    
    if (!dateString || dateString.trim() === '' || dateString === 'Tanggal tidak tersedia') {
      return `Tanggal tidak tersedia • ${timeString}`;
    }
    
    try {
      let date;
      let formattedDate;
      
      // Handle YYYY-MM-DD format to avoid timezone issues
      if (dateString.includes('-') && dateString.length === 10) {
        const [yearStr, monthStr, dayStr] = dateString.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        
        // Validate date components
        if (isNaN(year) || isNaN(month) || isNaN(day) || 
            year < 1900 || year > 2100 || 
            month < 1 || month > 12 || 
            day < 1 || day > 31) {
          return `Tanggal tidak tersedia • ${timeString}`;
        }
        
        date = new Date(year, month - 1, day); // month is 0-indexed
        
        // Double check if the date is valid after construction
        if (date.getFullYear() !== year || 
            date.getMonth() !== month - 1 || 
            date.getDate() !== day) {
          return `Tanggal tidak tersedia • ${timeString}`;
        }
        
        formattedDate = date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (dateString.includes('/')) {
        // Handle DD/MM/YYYY or MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format (Indonesian standard)
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          
          if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
              year >= 1900 && year <= 2100 && 
              month >= 1 && month <= 12 && 
              day >= 1 && day <= 31) {
            date = new Date(year, month - 1, day);
            formattedDate = date.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          } else {
              return `Tanggal tidak tersedia • ${timeString}`;
            }
          } else {
          return `Tanggal tidak tersedia • ${timeString}`;
        }
      } else {
          // Handle formatted date strings like "26 September 2025" from API
          const monthNames = [
            'januari', 'februari', 'maret', 'april', 'mei', 'juni',
            'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
          ];
          const englishMonthNames = [
            'january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'
          ];
          
          const lowerCaseDate = dateString.toLowerCase();
          const hasIndonesianMonth = monthNames.some(month => lowerCaseDate.includes(month));
          const hasEnglishMonth = englishMonthNames.some(month => lowerCaseDate.includes(month));
          
          if (hasIndonesianMonth || hasEnglishMonth) {
          // If it contains month names, it's likely already formatted correctly
          // Use the original string directly without parsing
          formattedDate = dateString;
        } else {
            // Try to parse as a general date string
            date = new Date(dateString);
            if (isNaN(date.getTime())) {
            return `Tanggal tidak tersedia • ${timeString}`;
          }
          formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      }
      
      return `${formattedDate} • ${timeString}`;
    } catch (error) {
      console.warn('Error formatting datetime:', dateString, timeString, error);
      return `Tanggal tidak tersedia • ${timeString}`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={typeInfo.gradientColors as unknown as readonly [string, string, ...string[]]}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.typeIconLarge}>
              <MaterialCommunityIcons
                name={typeInfo.icon as any}
                size={32}
                color="white"
              />
            </View>
            <Text style={styles.headerTitle}>{typeInfo.title}</Text>
            <Text style={styles.headerSubtitle}>{typeInfo.description}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Info Card */}
        <View style={styles.quickInfoCard}>
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={typeInfo.color} />
              <Text style={styles.quickInfoLabel}>Waktu</Text>
              <Text style={styles.quickInfoValue}>{formatTime(time)}</Text>
            </View>
            <View style={styles.quickInfoDivider} />
            <View style={styles.quickInfoItem}>
              <MaterialCommunityIcons name="calendar-outline" size={24} color={typeInfo.color} />
              <Text style={styles.quickInfoLabel}>Tanggal</Text>
              <Text style={styles.quickInfoValue}>
                {formatDate(date)}
              </Text>
            </View>
          </View>
        </View>

        {/* Photo Section */}
        {image && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="camera" size={20} color={typeInfo.color} />
              <Text style={styles.sectionTitle}>Foto Absensi</Text>
            </View>
            <View style={styles.photoCard}>
              <Image source={{ uri: image }} style={styles.attendancePhoto} />
              <View style={styles.photoOverlay}>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.photoGradient}
                >
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoLabel}>Foto {typeInfo.title}</Text>
                    <Text style={styles.photoTimestamp}>
                      {formatDateTime(date, time)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </View>
        )}

        {/* Detail Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={20} color={typeInfo.color} />
            <Text style={styles.sectionTitle}>Detail Informasi</Text>
          </View>
          
          <View style={styles.detailCard}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: `${typeInfo.color}15` }]}>
                <MaterialCommunityIcons name="clock" size={18} color={typeInfo.color} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Waktu Absensi</Text>
                <Text style={styles.detailValue}>{formatTime(time)}</Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />
            
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: `${typeInfo.color}15` }]}>
                <MaterialCommunityIcons name="calendar" size={18} color={typeInfo.color} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Tanggal</Text>
                <Text style={styles.detailValue}>
                  {formatDate(date)}
                </Text>
              </View>
            </View>
            
            {address && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <View style={[styles.detailIcon, { backgroundColor: `${typeInfo.color}15` }]}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={typeInfo.color} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Lokasi</Text>
                    <Text style={styles.detailValue}>{address}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Status Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="check-circle" size={20} color={typeInfo.color} />
            <Text style={styles.sectionTitle}>Status</Text>
          </View>
          
          <View style={[styles.statusCard, { borderLeftColor: typeInfo.color }]}>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {time && time !== '00:00:00' ? 'Berhasil Tercatat' : 'Belum Tercatat'}
              </Text>
              <Text style={styles.statusDescription}>
                {time && time !== '00:00:00' 
                  ? `${typeInfo.title} telah berhasil dicatat pada ${formatDateTime(date, time)}`
                  : `${typeInfo.title} belum tercatat dalam sistem`
                }
              </Text>
            </View>
            <MaterialCommunityIcons 
              name={time && time !== '00:00:00' ? "check-circle" : "clock-outline"} 
              size={24} 
              color={time && time !== '00:00:00' ? typeInfo.color : COLORS.text.secondary} 
            />
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    minHeight: 120,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 44,
  },
  typeIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  quickInfoCard: {
    backgroundColor: 'white',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  photoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  attendancePhoto: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.background.secondary,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  photoGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  photoInfo: {
    padding: SPACING.lg,
  },
  photoLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  photoTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
    lineHeight: 20,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
    marginLeft: 52,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: SPACING.xl * 2,
  },
});

export default AttendanceDetailModal;