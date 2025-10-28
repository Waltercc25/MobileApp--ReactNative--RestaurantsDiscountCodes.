import React from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../lib/theme';

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  style?: object;
  disabled?: boolean;
};

export default function Button({ title, onPress, style, disabled = false }: Props) {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled && styles.disabledButton, 
        style
      ]} 
      onPress={disabled ? undefined : onPress} 
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Text style={[styles.title, disabled && styles.disabledTitle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: theme.SIZES.inputHeight,
    backgroundColor: theme.COLORS.primary,
    borderRadius: theme.SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: theme.COLORS.surfaceVariant,
    opacity: 0.6,
  },
  title: {
    color: theme.COLORS.onPrimary,
    fontSize: theme.FONT.medium,
    fontWeight: '600',
  },
  disabledTitle: {
    color: theme.COLORS.muted,
  },
});