import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationIcon from '../components/NotificationIcon';
import RestaurantCard from '../components/RestaurantCard';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { SAMPLE_RESTAURANTS } from '../lib/sampleData';
import theme from '../lib/theme';
import { RootStackParamList } from '../types';


type ExploreScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function ExploreScreen() {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const { logout, loading } = useAuth();
  const { notifications, markAsRead, clearAll } = useNotifications();


  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar sesión', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // La navegación se manejará automáticamente por el AuthProvider
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Restaurantes cerca de ti</Text>
            <Text style={styles.subtitle}>Elige si vas en pareja o en familia y genera tu código de descuento</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} disabled={loading}>
              <Text style={styles.logoutText}>{loading ? 'Cerrando...' : 'Cerrar sesión'}</Text>
            </TouchableOpacity>
            <NotificationIcon 
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
            />
          </View>
        </View>
      </View>
      <FlatList
        data={SAMPLE_RESTAURANTS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.background },
  header: { padding: 16 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: theme.COLORS.text },
  subtitle: { color: theme.COLORS.muted, marginTop: 6 },
  logoutButton: {
    backgroundColor: theme.COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});