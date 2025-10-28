// Servicio para comunicación con el backend de OTP

import { getApiConfig } from '../config/api';

const API_CONFIG = getApiConfig();

export interface OTPSendRequest {
  email: string;
  type: 'login' | 'registration';
}

export interface OTPSendResponse {
  success: boolean;
  message: string;
  otpId: string;
  expiresAt: string;
  error?: string;
}

export interface OTPVerifyRequest {
  email: string;
  otpCode: string;
  otpId: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  message: string;
  error?: string;
  remainingAttempts?: number;
}

export interface OTPStatusResponse {
  success: boolean;
  otpId: string;
  otpData: {
    type: string;
    createdAt: string;
    expiresAt: string;
    attempts: number;
    maxAttempts: number;
  };
  error?: string;
}

class OTPService {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  // Enviar código OTP
  async sendOTP(email: string, type: 'login' | 'registration' = 'login'): Promise<OTPSendResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      console.log(`📧 Enviando OTP a: ${this.baseURL}${API_CONFIG.ENDPOINTS.SEND_OTP}`);
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.SEND_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar código OTP');
      }

      console.log('✅ OTP enviado exitosamente');
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('❌ Error en sendOTP:', error);
      
      let errorMessage = 'Error de conexión';
      if (error.name === 'AbortError') {
        errorMessage = 'El servidor no respondió a tiempo. Verifica que esté corriendo en http://192.168.1.19:3001';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: '',
        otpId: '',
        expiresAt: '',
        error: errorMessage
      };
    }
  }

  // Verificar código OTP
  async verifyOTP(email: string, otpCode: string, otpId: string): Promise<OTPVerifyResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      console.log(`🔍 Verificando OTP en: ${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_OTP}`);
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otpCode, otpId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar código OTP');
      }

      console.log('✅ OTP verificado exitosamente');
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('❌ Error en verifyOTP:', error);
      
      let errorMessage = 'Error de conexión';
      if (error.name === 'AbortError') {
        errorMessage = 'El servidor no respondió a tiempo. Intenta nuevamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: '',
        error: errorMessage
      };
    }
  }

  // Obtener estado del OTP
  async getOTPStatus(email: string): Promise<OTPStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.OTP_STATUS}/${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener estado del OTP');
      }

      return data;
    } catch (error: any) {
      console.error('Error en getOTPStatus:', error);
      return {
        success: false,
        otpId: '',
        otpData: {
          type: '',
          createdAt: '',
          expiresAt: '',
          attempts: 0,
          maxAttempts: 3
        },
        error: error.message || 'Error de conexión'
      };
    }
  }

  // Verificar si el servidor está disponible
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}${API_CONFIG.ENDPOINTS.HEALTH}`, {
        method: 'GET',
        timeout: 5000, // 5 segundos timeout
      });

      return response.ok;
    } catch (error) {
      console.error('Servidor no disponible:', error);
      return false;
    }
  }

  // Obtener información del servidor
  async getServerInfo() {
    try {
      const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.INFO}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener info del servidor:', error);
      return null;
    }
  }
}

// Instancia singleton del servicio
export const otpService = new OTPService();

// Función de utilidad para formatear tiempo de expiración
export const formatExpiryTime = (expiresAt: string): string => {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Expirado';
  }
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Función para validar formato de código OTP
export const validateOTPCode = (code: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(code);
};

export default otpService;
