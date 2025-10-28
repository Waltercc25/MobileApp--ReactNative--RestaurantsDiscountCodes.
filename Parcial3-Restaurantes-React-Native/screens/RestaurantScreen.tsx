import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Clipboard, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { useCodes } from '../hooks/useCodes';
import theme from '../lib/theme';
import { MainTabParamList, RootStackParamList } from '../types';

type RestaurantScreenProps = NativeStackScreenProps<RootStackParamList, 'Restaurant'>;
type RestaurantScreenNavigationProp = NativeStackNavigationProp<MainTabParamList>;

export default function RestaurantScreen({ route }: RestaurantScreenProps) {
  const navigation = useNavigation<RestaurantScreenNavigationProp>();
  const { restaurant } = route.params;
  const [people, setPeople] = useState('2');
  const [generated, setGenerated] = useState<any | null>(null);
  const { user } = useAuth();
  const { createCode } = useCodes();

  const onCreate = async () => {
    const p = Number(people) || 1;
    if (!restaurant) return Alert.alert('Error', 'Restaurante no válido');
    
    try {
      const code = await createCode(restaurant.id, restaurant.name, p, user?.id || 'guest');
      setGenerated(code);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el código. Inténtalo de nuevo.');
      console.error('Error al crear código:', error);
    }
  };

  const onCopy = async () => {
    if (!generated) return;
    const text = `${generated.code} - ${generated.discountPercent}% off para ${generated.people} personas`;
    try {
      // Prefer navigator.clipboard when available
      // @ts-ignore
      if (globalThis?.navigator?.clipboard?.writeText) {
        // @ts-ignore
        await globalThis.navigator.clipboard.writeText(text);
      } else {
        // @ts-ignore
        await Clipboard.setString(text);
      }
      Alert.alert('Copiado', 'Código copiado al portapapeles');
    } catch (e) {
      Alert.alert('Error', 'No se pudo copiar');
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{restaurant?.name}</Text>
        <Text style={styles.desc}>{restaurant?.description}</Text>

        <View style={{ marginTop: 16 }}>
          <Input label="¿Cuántas personas?" value={people} onChangeText={setPeople} keyboardType="numeric" />
          <Button title="Generar código" onPress={onCreate} />
        </View>

        {generated ? (
          <View style={styles.codeBox}>
            <Text style={styles.codeTitle}>Tu código</Text>
            <Text style={styles.code}>{generated.code}</Text>
            <Text style={styles.codeSub}>{generated.discountPercent}% de descuento para {generated.people} personas</Text>
            <View style={{ height: 12 }} />
            <Button title="Copiar código" onPress={onCopy} />
            <View style={{ height: 8 }} />
            <Button title="Ir a mis códigos" onPress={() => navigation.navigate('Main', { screen: 'Codes' })} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.COLORS.background },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: theme.COLORS.text },
  desc: { color: theme.COLORS.muted, marginTop: 6 },
  codeBox: { marginTop: 20, padding: 16, backgroundColor: theme.COLORS.surface, borderRadius: theme.SIZES.radius, borderWidth: 1, borderColor: theme.COLORS.outline },
  codeTitle: { fontSize: 14, color: theme.COLORS.muted },
  code: { marginTop: 6, fontSize: 28, fontWeight: '800', color: theme.COLORS.primary },
  codeSub: { marginTop: 6, color: theme.COLORS.text },
});