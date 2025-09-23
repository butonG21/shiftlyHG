import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { AttendanceRecord } from '../types/attendance';
import { useAttendanceStatus } from '../hooks';

type RootStackParamList = {
  AttendanceDetail: {
    attendance: AttendanceRecord;
  };
};

type AttendanceDetailScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceDetail'>;
type AttendanceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AttendanceDetail'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AttendanceDetailScreen: React.FC = () => {
  const navigation = useNavigation<AttendanceDetailScreenNavigationProp>();
  const route = useRoute<AttendanceDetailScreenRouteProp>();
  const { attendance } = route.params;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const openImageModal = (imageUri: string) => {
    setSelectedImage(imageUri);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === '--:--:--') return 'Belum tercatat';
    return timeString;
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Alamat tidak tersedia';
    return address;
  };

  const AttendanceDetailItem = ({ 
    icon, 
    title, 
    time, 
    address, 
    image, 
    type 
  }: {
    icon: string;
    title: string;
    time: string;
    address: string;
    image: string;
    type: string;
  }) => {
    const statusInfo = useAttendanceStatus(type);
    const hasValidTime = time && time !== '--:--:--';
    
    if (!hasValidTime) return null;

    return (
      <View style={styles.detailItem}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailIconContainer, { backgroundColor: statusInfo.bgColor }]}>
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={statusInfo.color}
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={styles.detailTitle}>{title}</Text>
            <Text style={styles.detailTime}>{formatTime(time)}</Text>
          </View>
        </View>
        
        <View style={styles.detailContent}>
          <View style={styles.addressContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS.text.secondary}
            />
            <Text style={styles.addressText}>{formatAddress(address)}</Text>
          </View>
          
          {image && (
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => openImageModal(image)}
            >
              <Image
                source={{ uri: image }}
                style={styles.detailImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <MaterialCommunityIcons
                  name="magnify-plus"
                  size={24}
                  color="white"
                />
                <Text style={styles.imageOverlayText}>Lihat Gambar</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Attendance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date and Employee Info */}
        <View style={styles.infoCard}>
          <Text style={styles.employeeName}>{attendance.name}</Text>
          <Text style={styles.dateText}>{formatDate(attendance.date)}</Text>
        </View>

        {/* Attendance Details */}
        <View style={styles.detailsContainer}>
          <AttendanceDetailItem
            icon="login"
            title="Check In"
            time={attendance.start_time}
            address={attendance.start_address}
            image={attendance.start_image}
            type="check in"
          />

          <AttendanceDetailItem
            icon="coffee"
            title="Break Start"
            time={attendance.break_out_time}
            address={attendance.break_out_address}
            image={attendance.break_out_image}
            type="break start"
          />

          <AttendanceDetailItem
            icon="coffee-off"
            title="Break End"
            time={attendance.break_in_time}
            address={attendance.break_in_address}
            image={attendance.break_in_image}
            type="break end"
          />

          <AttendanceDetailItem
            icon="logout"
            title="Check Out"
            time={attendance.end_time}
            address={attendance.end_address}
            image={attendance.end_image}
            type="check out"
          />
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={closeImageModal}
          >
            <MaterialCommunityIcons
              name="close"
              size={30}
              color="white"
            />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  detailsContainer: {
    gap: SPACING.lg,
  },
  detailItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  detailTime: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  detailContent: {
    gap: SPACING.md,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.background.accent,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
});

export default AttendanceDetailScreen;