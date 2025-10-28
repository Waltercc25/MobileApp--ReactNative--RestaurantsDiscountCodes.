import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import theme from '../lib/theme';

type Props = TextInputProps & {
  label?: string;
};

export default function Input({ label, style, ...rest }: Props) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.COLORS.muted}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: theme.COLORS.text,
    marginBottom: 6,
  },
  input: {
    height: theme.SIZES.inputHeight,
    backgroundColor: theme.COLORS.surface,
    borderRadius: theme.SIZES.radius,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.COLORS.outline,
    color: theme.COLORS.text,
  },
});