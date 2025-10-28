import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import OTPVerification from '../components/OTPVerification';
import { useAuth } from '../hooks/useAuth';
import theme from '../lib/theme';
import { otpService } from '../services/otpService';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Estados para OTP
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpData, setOtpData] = useState<{
    email: string;
    otpId: string;
    expiresAt: string;
    type: 'login' | 'registration';
    password?: string;
    confirmPassword?: string;
  } | null>(null);


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const doLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Por favor ingresa email y contraseña');
    }
    
    if (!validateEmail(email)) {
      return Alert.alert('Error', 'Por favor ingresa un email válido');
    }

    setLoading(true);
    try {
      // Enviar OTP directamente sin autenticar primero
      const otpResult = await otpService.sendOTP(email, 'login');
      
      if (otpResult.success) {
        setOtpData({
          email,
          otpId: otpResult.otpId,
          expiresAt: otpResult.expiresAt,
          type: 'login',
          password: password // Guardar la contraseña para usar después de verificar OTP
        });
        setShowOTPVerification(true);
      } else {
        const errorMsg = otpResult.error || 'No se pudo enviar el código de verificación';
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      console.error('Error al enviar OTP:', error);
      const errorMsg = error.message || 'No se pudo enviar el código de verificación. Verifica que el servidor esté corriendo.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const doRegister = async () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Error', 'Por favor completa todos los campos');
    }
    
    if (!validateEmail(email)) {
      return Alert.alert('Error', 'Por favor ingresa un email válido');
    }
    
    if (!validatePassword(password)) {
      return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    }
    
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    }

    setLoading(true);
    try {
      // Enviar OTP directamente sin crear cuenta primero
      const otpResult = await otpService.sendOTP(email, 'registration');
      
      if (otpResult.success) {
        setOtpData({
          email,
          otpId: otpResult.otpId,
          expiresAt: otpResult.expiresAt,
          type: 'registration',
          password: password,
          confirmPassword: confirmPassword
        });
        setShowOTPVerification(true);
      } else {
        const errorMsg = otpResult.error || 'No se pudo enviar el código de verificación';
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      console.error('Error al enviar OTP:', error);
      const errorMsg = error.message || 'No se pudo enviar el código de verificación. Verifica que el servidor esté corriendo.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Manejar verificación exitosa de OTP
  const handleOTPVerificationSuccess = async () => {
    if (!otpData) return;
    
    setLoading(true);
    try {
      if (otpData.type === 'registration') {
        // Crear cuenta en Firebase después de verificar OTP
        await register(otpData.email, otpData.password!);
        Alert.alert('Éxito', '¡Cuenta creada y verificada exitosamente!');
        setIsRegisterMode(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        // Autenticar con Firebase después de verificar OTP
        await login(otpData.email, otpData.password!);
        Alert.alert('Éxito', '¡Bienvenido! Has iniciado sesión correctamente');
      }
      
      setShowOTPVerification(false);
      setOtpData(null);
    } catch (error: any) {
      let errorMessage = 'Error al completar la autenticación';
      
      if (otpData.type === 'registration') {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Ya existe una cuenta con este email';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es muy débil';
        }
      } else {
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No existe una cuenta con este email';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar reenvío de OTP
  const handleResendOTP = async () => {
    if (!otpData) return;
    
    try {
      const result = await otpService.sendOTP(otpData.email, otpData.type);
      if (result.success) {
        setOtpData(prev => prev ? {
          ...prev,
          otpId: result.otpId,
          expiresAt: result.expiresAt
        } : null);
      }
    } catch (error) {
      console.error('Error al reenviar OTP:', error);
    }
  };

  // Manejar cancelación de OTP
  const handleCancelOTP = () => {
    setShowOTPVerification(false);
    setOtpData(null);
  };


  // Si está mostrando la verificación OTP
  if (showOTPVerification && otpData) {
    return (
      <OTPVerification
        email={otpData.email}
        otpId={otpData.otpId}
        expiresAt={otpData.expiresAt}
        type={otpData.type}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onResendOTP={handleResendOTP}
        onCancel={handleCancelOTP}
      />
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size={100} showText={true} />
        </View>
        <Text style={styles.title}>
          {isRegisterMode ? 'Crear Cuenta' : 'Bienvenido'}
        </Text>
        <Text style={styles.subtitle}>
          {isRegisterMode 
            ? 'Crea una cuenta para recibir recomendaciones de restaurantes cerca de ti'
            : 'Inicia sesión para recibir recomendaciones de restaurantes cerca de ti'
          }
        </Text>
        
        <View style={styles.form}>
          <Input 
            label="Correo electrónico" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            placeholder="ejemplo@correo.com"
          />
          
          <Input 
            label="Contraseña" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholder="Mínimo 6 caracteres"
          />
          
          {isRegisterMode && (
            <Input 
              label="Confirmar contraseña" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry 
              placeholder="Repite tu contraseña"
            />
          )}
          
          <Button 
            title={loading ? 'Procesando...' : (isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión')} 
            onPress={isRegisterMode ? doRegister : doLogin}
            disabled={loading}
          />
          
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isRegisterMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={loading}>
              <Text style={styles.toggleButton}>
                {isRegisterMode ? 'Iniciar sesión' : 'Crear cuenta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.COLORS.background 
  },
  content: { 
    padding: 20,
    flex: 1,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: theme.COLORS.text, 
    marginVertical: 12,
    textAlign: 'center'
  },
  subtitle: { 
    color: theme.COLORS.muted, 
    marginBottom: 32,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22
  },
  form: { 
    marginTop: 8 
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8
  },
  toggleText: {
    color: theme.COLORS.muted,
    fontSize: 16
  },
  toggleButton: {
    color: theme.COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});