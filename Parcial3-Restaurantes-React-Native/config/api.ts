// Configuración de la API del backend

export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'http://192.168.1.19:3001/api',
  //BASE_URL: 'http://localhost:3001/api',
  //BASE_URL: 'http://192.168.1.20:3001/api'

  // URLs específicas
  ENDPOINTS: {
    SEND_OTP: '/otp/send',
    VERIFY_OTP: '/otp/verify',
    OTP_STATUS: '/otp/status',
    OTP_STATS: '/otp/stats',
    HEALTH: '/health',
    INFO: '/info'
  },
  
  // Configuración de timeout
  TIMEOUT: 10000, // 10 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Función para construir URL completa
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para verificar si el backend está disponible
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://192.168.1.20:3001/health', {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('Backend no disponible:', error);
    return false;
  }
};

// Configuración de desarrollo vs producción
export const getApiConfig = () => {
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    return {
      ...API_CONFIG,
      BASE_URL: 'http://192.168.1.19:3001/api'
    };
  } else {
    // En producción, usar la URL del servidor desplegado
    return {
      ...API_CONFIG,
      BASE_URL: 'https://tu-servidor.com/api'
    };
  }
};

export default API_CONFIG;
