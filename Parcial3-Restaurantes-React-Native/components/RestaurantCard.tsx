import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../lib/theme';
import { Restaurant } from '../types';

type Props = {
  restaurant: Restaurant;
  onPress?: () => void;
};

export default function RestaurantCard({ restaurant, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        {typeof restaurant.distanceKm === 'number' ? (
          <Text style={styles.distance}>{restaurant.distanceKm.toFixed(1)} km</Text>
        ) : null}
      </View>
      {restaurant.description ? <Text style={styles.description}>{restaurant.description}</Text> : null}
      <View style={styles.tagsRow}>
        {(restaurant.tags || []).map((t) => (
          <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.SIZES.radius,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.text,
  },
  distance: {
    fontSize: 12,
    color: theme.COLORS.muted,
  },
  description: {
    color: theme.COLORS.muted,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.COLORS.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: theme.COLORS.muted,
    fontSize: 12,
  },
});