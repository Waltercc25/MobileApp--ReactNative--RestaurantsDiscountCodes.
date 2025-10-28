import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import theme from '../lib/theme';
import { formatExpiryTime, otpService, validateOTPCode } from '../services/otpService';
import Button from './Button';

interface OTPVerificationProps {
  email: string;
  otpId: string;
  expiresAt: string;
  type: 'login' | 'registration';
  onVerificationSuccess: () => void;
  onResendOTP: () => void;
  onCancel: () => void;
}

export default function OTPVerification({
  email,
  otpId,
  expiresAt,
  type,
  onVerificationSuccess,
  onResendOTP,
  onCancel
}: OTPVerificationProps) {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const inputRefs = useRef<TextInput[]>([]);

  // Timer para mostrar tiempo restante
  useEffect(() => {
    const updateTimer = () => {
      const timeLeftStr = formatExpiryTime(expiresAt);
      setTimeLeft(timeLeftStr);
      
      if (timeLeftStr === 'Expirado') {
        setCanResend(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Animación de shake para errores
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Manejar cambio de código OTP
  const handleOTPChange = (text: string) => {
    // Solo permitir números y máximo 6 dígitos
    const cleanText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(cleanText);
  };

  // Verificar código OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    if (!validateOTPCode(otpCode)) {
      Alert.alert('Error', 'El código debe contener solo números');
      return;
    }

    setLoading(true);
    try {
      const result = await otpService.verifyOTP(email, otpCode, otpId);
      
      if (result.success) {
        Alert.alert('Éxito', 'Código verificado correctamente');
        onVerificationSuccess();
      } else {
        setAttempts(prev => prev + 1);
        shake();
        
        if (result.remainingAttempts !== undefined) {
          Alert.alert(
            'Código incorrecto', 
            `Te quedan ${result.remainingAttempts} intentos`
          );
        } else {
          Alert.alert('Error', result.error || 'Código incorrecto');
        }
        
        if (attempts + 1 >= maxAttempts) {
          Alert.alert(
            'Demasiados intentos', 
            'Has excedido el número máximo de intentos. Solicita un nuevo código.'
          );
          setCanResend(true);
        }
      }
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const result = await otpService.sendOTP(email, type);
      
      if (result.success) {
        Alert.alert('Éxito', 'Nuevo código enviado a tu email');
        setOtpCode('');
        setAttempts(0);
        setCanResend(false);
        onResendOTP(); // Notificar al componente padre
      } else {
        Alert.alert('Error', result.error || 'No se pudo reenviar el código');
      }
    } catch (error) {
      console.error('Error al reenviar OTP:', error);
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = timeLeft === 'Expirado';
  const isDisabled = loading || isExpired || attempts >= maxAttempts;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Verificación de Email</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de 6 dígitos a:
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Código de verificación</Text>
          <TextInput
            ref={(ref) => {
              if (ref) inputRefs.current[0] = ref;
            }}
            style={[
              styles.otpInput,
              isExpired && styles.otpInputExpired,
              attempts > 0 && styles.otpInputError
            ]}
            value={otpCode}
            onChangeText={handleOTPChange}
            placeholder="000000"
            keyboardType="numeric"
            maxLength={6}
            editable={!isDisabled}
            autoFocus
            selectTextOnFocus
          />
        </View>

        <View style={styles.timerContainer}>
          <Text style={[
            styles.timerText,
            isExpired && styles.timerExpired
          ]}>
            {isExpired ? 'Código expirado' : `Expira en: ${timeLeft}`}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Verificando...' : 'Verificar código'}
            onPress={handleVerifyOTP}
            disabled={isDisabled}
            style={[
              styles.verifyButton,
              isDisabled && styles.buttonDisabled
            ]}
          />

          {canResend && (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={loading}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>Reenviar código</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {attempts > 0 && (
          <View style={styles.attemptsContainer}>
            <Text style={styles.attemptsText}>
              Intentos: {attempts}/{maxAttempts}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: theme.COLORS.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.COLORS.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.primary,
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 2,
    borderColor: theme.COLORS.outline,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: theme.COLORS.surfaceVariant,
    color: theme.COLORS.text,
  },
  otpInputExpired: {
    borderColor: theme.COLORS.error,
    backgroundColor: theme.COLORS.errorContainer,
  },
  otpInputError: {
    borderColor: theme.COLORS.error,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: theme.COLORS.muted,
    fontWeight: '500',
  },
  timerExpired: {
    color: theme.COLORS.error,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  verifyButton: {
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: theme.COLORS.primary,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: theme.COLORS.muted,
  },
  attemptsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  attemptsText: {
    fontSize: 14,
    color: theme.COLORS.error,
    fontWeight: '500',
  },
});
