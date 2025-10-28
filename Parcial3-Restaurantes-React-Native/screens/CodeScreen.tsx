import React from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { useCodes } from '../hooks/useCodes';
import theme from '../lib/theme';

export default function CodesScreen() {
  const { codes, redeemCode, deleteCode, loading, refreshCodes } = useCodes();

  const onRedeem = (id: string, restaurantName: string) => {
    Alert.alert('Confirmar', `Marcar código como canjeado en ${restaurantName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Confirmar', 
        onPress: async () => {
          try {
            await redeemCode(id);
            Alert.alert('Éxito', 'Código marcado como canjeado');
          } catch (error) {
            Alert.alert('Error', 'No se pudo marcar el código como canjeado');
            console.error('Error al canjear código:', error);
          }
        }
      },
    ]);
  };

  const onDelete = (id: string, restaurantName: string) => {
    Alert.alert('Eliminar código', `¿Estás seguro de que quieres eliminar el código de ${restaurantName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCode(id);
            Alert.alert('Éxito', 'Código eliminado correctamente');
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el código');
            console.error('Error al eliminar código:', error);
          }
        }
      },
    ]);
  };


  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis códigos</Text>
        {loading && <ActivityIndicator size="small" color={theme.COLORS.primary} />}
      </View>
      <FlatList
        data={codes}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshCodes}
            colors={[theme.COLORS.primary]}
            tintColor={theme.COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No tienes códigos aún. Genera uno desde un restaurante.</Text>
            <Button 
              title="Actualizar" 
              onPress={refreshCodes} 
              style={{ marginTop: 16, backgroundColor: theme.COLORS.surfaceVariant }}
            />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.name}>{item.restaurantName}</Text>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <Text style={styles.details}>{item.discountPercent}% · {item.people} personas</Text>
            <Text style={styles.date}>Generado: {new Date(item.createdAt).toLocaleString()}</Text>
            {item.redeemed ? (
              <Text style={styles.redeemed}>Canjeado: {new Date(item.redeemedAt || '').toLocaleString()}</Text>
            ) : (
              <Button title="Marcar como canjeado" onPress={() => onRedeem(item.id, item.restaurantName)} style={{ marginTop: 8 }} />
            )}
            <View style={styles.actionButtons}>
              <Button 
                title="Eliminar" 
                onPress={() => onDelete(item.id, item.restaurantName)} 
                style={{ 
                  marginTop: 8, 
                  backgroundColor: theme.COLORS.error || '#ff4444',
                  flex: 1,
                  marginRight: 4
                }} 
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.background },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: theme.COLORS.text },
  emptyContainer: { padding: 16, alignItems: 'center' },
  empty: { color: theme.COLORS.muted, textAlign: 'center' },
  card: { backgroundColor: theme.COLORS.surface, padding: 12, borderRadius: theme.SIZES.radius, borderWidth: 1, borderColor: theme.COLORS.outline, marginBottom: 12 },
  name: { fontWeight: '700', color: theme.COLORS.text },
  codeText: { fontWeight: '700', color: theme.COLORS.primary },
  details: { color: theme.COLORS.muted, marginTop: 6 },
  date: { color: theme.COLORS.muted, marginTop: 6, fontSize: 12 },
  redeemed: { marginTop: 8, color: theme.COLORS.success, fontWeight: '600' },
  actionButtons: { 
    flexDirection: 'row', 
    marginTop: 8,
    gap: 8
  },
});