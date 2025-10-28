import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 120, showText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <View style={styles.circle}>
          <View style={styles.fork}>
            {/* Tenedor - parte superior (dientes) */}
            <View style={styles.forkTop}>
              <View style={styles.forkTine} />
              <View style={styles.forkTine} />
              <View style={styles.forkTine} />
            </View>
            {/* Tenedor - parte media */}
            <View style={styles.forkMiddle} />
            {/* Tenedor - mango */}
            <View style={styles.forkHandle} />
          </View>
        </View>
      </View>
      {showText && (
        <Text style={styles.logoText}>Eat-Easy</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: '#FF6B35', // Naranja
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fork: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  forkTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  forkTine: {
    width: 2,
    height: 8,
    backgroundColor: 'white',
    marginHorizontal: 1,
    borderRadius: 1,
  },
  forkMiddle: {
    width: 2,
    height: 4,
    backgroundColor: 'white',
    marginBottom: 2,
  },
  forkHandle: {
    width: 2,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  logoText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
