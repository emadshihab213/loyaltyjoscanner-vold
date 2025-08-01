import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Award, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import { apiService } from '@/services/api';

export default function ProfileScreen() {
  const handleLogout = () => {
    apiService.clearToken();
    router.replace('/login');
  };

  const handleMenuPress = (item: string) => {
    Alert.alert('Feature', `${item} coming soon!`);
  };

  return (
    <LinearGradient
      colors={['#EBF8FF', '#F0FDF4']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <User size={48} color="#2563EB" strokeWidth={2} />
            </View>
            <Text style={styles.userName}>Loyalty Member</Text>
            <Text style={styles.userEmail}>member@loyalty.app</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Award size={24} color="#059669" strokeWidth={2} />
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Today's Scans</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Award size={24} color="#DC2626" strokeWidth={2} />
                <Text style={styles.statValue}>--</Text>
                <Text style={styles.statLabel}>Stamps Added</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('Settings')}
            >
              <View style={styles.menuItemLeft}>
                <Settings size={20} color="#64748B" strokeWidth={2} />
                <Text style={styles.menuItemText}>Settings</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuPress('Help & Support')}
            >
              <View style={styles.menuItemLeft}>
                <HelpCircle size={20} color="#64748B" strokeWidth={2} />
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <View style={styles.menuItemLeft}>
                <LogOut size={20} color="#DC2626" strokeWidth={2} />
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  Logout
                </Text>
              </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#DBEAFE',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 24,
  },
  menuSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#DC2626',
  },
});