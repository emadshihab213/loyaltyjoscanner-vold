import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Scan, X, LogOut, User, Phone, Award, Plus, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { apiService } from '@/services/api';
import { Customer } from '@/types/api';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && isScanning) {
      requestPermission();
    }
  }, [isScanning, permission]);

  const handleScanPress = async () => {
    if (!permission) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan QR codes.',
          [{ text: 'OK' }]
        );
        return;
      }
    } else if (!permission.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to scan QR codes.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    setIsScanning(true);
  };

  const handleBarcodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setIsScanning(false);
    setIsProcessing(true);

    try {
      const response = await apiService.scanCustomer(data);
      if (response.success) {
        setCustomer(response.customer);
      } else {
        Alert.alert('Scan Failed', response.message || 'Customer not found');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to scan customer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    router.replace('/login');
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
  };

  const handleAddStamp = async () => {
    if (!customer) return;
    
    setIsProcessing(true);
    try {
      const response = await apiService.addStamp(customer.id);
      if (response.success) {
        setCustomer(response.customer);
        Alert.alert('Success', response.message);
      } else {
        Alert.alert('Error', response.message || 'Failed to add stamp');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add stamp');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedeemReward = async () => {
    if (!customer) return;
    
    Alert.alert(
      'Redeem Reward',
      'Are you sure you want to redeem this customer\'s reward?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const response = await apiService.redeemReward(customer.id);
              if (response.success) {
                setCustomer(response.customer);
                Alert.alert('Success', response.message);
              } else {
                Alert.alert('Error', response.message || 'Failed to redeem reward');
              }
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to redeem reward');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handleNewScan = () => {
    setCustomer(null);
  };
  if (isScanning) {
    return (
      <SafeAreaView style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseScanner}
              >
                <X size={24} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.scannerContent}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.scanInstructions}>
                Position QR code within the frame
              </Text>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  if (customer) {
    const progressPercentage = (customer.currentStamps / customer.maxStamps) * 100;
    
    return (
      <LinearGradient
        colors={['#EBF8FF', '#F0FDF4']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Customer Details</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#64748B" strokeWidth={2} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerIcon}>
                  <User size={32} color="#2563EB" strokeWidth={2} />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <View style={styles.customerPhone}>
                    <Phone size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.customerPhoneText}>{customer.phone}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.stampsSection}>
                <Text style={styles.stampsTitle}>Loyalty Progress</Text>
                <View style={styles.stampsProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${progressPercentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.stampsText}>
                    {customer.currentStamps} / {customer.maxStamps} stamps
                  </Text>
                </View>
                
                <View style={styles.stampsGrid}>
                  {Array.from({ length: customer.maxStamps }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.stampCircle,
                        index < customer.currentStamps && styles.stampFilled
                      ]}
                    >
                      {index < customer.currentStamps && (
                        <Award size={16} color="#FFFFFF" strokeWidth={2} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.actionsSection}>
              <TouchableOpacity
                style={[styles.actionButton, styles.addStampButton]}
                onPress={handleAddStamp}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isProcessing ? ['#94A3B8', '#64748B'] : ['#059669', '#047857']}
                  style={styles.actionButtonGradient}
                >
                  <Plus size={24} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.actionButtonText}>
                    {isProcessing ? 'Adding...' : 'Add Stamp'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {customer.canRedeem && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.redeemButton]}
                  onPress={handleRedeemReward}
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isProcessing ? ['#94A3B8', '#64748B'] : ['#DC2626', '#B91C1C']}
                    style={styles.actionButtonGradient}
                  >
                    <Gift size={24} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>
                      {isProcessing ? 'Redeeming...' : 'Redeem Reward'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.newScanButton}
                onPress={handleNewScan}
                activeOpacity={0.8}
              >
                <Text style={styles.newScanButtonText}>Scan Another Customer</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
  return (
    <LinearGradient
      colors={['#EBF8FF', '#F0FDF4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Loyalty Scanner</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#64748B" strokeWidth={2} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Scan size={48} color="#2563EB" strokeWidth={2} />
            </View>
            <Text style={styles.heroTitle}>Staff Scanner</Text>
            <Text style={styles.heroSubtitle}>
              Scan customer QR codes to manage loyalty stamps
            </Text>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPress}
              disabled={isProcessing}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isProcessing ? ['#94A3B8', '#64748B'] : ['#2563EB', '#1D4ED8']}
                style={styles.scanButtonGradient}
              >
                <Scan size={32} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.scanButtonText}>
                  {isProcessing ? 'Processing...' : 'Scan Customer'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#DBEAFE',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  scanButton: {
    width: width * 0.8,
    maxWidth: 300,
    borderRadius: 16,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  scanButtonText: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lastScanContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lastScanLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  lastScanData: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  customerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  customerIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#DBEAFE',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  customerPhone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerPhoneText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#64748B',
  },
  stampsSection: {
    marginTop: 8,
  },
  stampsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  stampsProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  stampsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  stampsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  stampCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampFilled: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  actionsSection: {
    gap: 16,
    paddingBottom: 20,
  },
  actionButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addStampButton: {
    shadowColor: '#059669',
  },
  redeemButton: {
    shadowColor: '#DC2626',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newScanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newScanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanInstructions: {
    marginTop: 40,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
});