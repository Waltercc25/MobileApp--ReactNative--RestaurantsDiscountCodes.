import { getApiConfig } from '../config/api';

const API_CONFIG = getApiConfig();

export interface EmailNotificationData {
  email: string;
  restaurantName: string;
  code: string;
  discountPercent: number;
  people: number;
  redeemedAt: string;
}

export interface EmailNotificationResponse {
  success: boolean;
  message: string;
  error?: string;
}

class NotificationService {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
  }

  // Enviar notificación por email cuando se canjea un código
  async sendCodeRedeemedEmail(data: EmailNotificationData): Promise<EmailNotificationResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    try {
      const url = `${this.baseURL}/notifications/email/code-redeemed`;
      console.log('📧 Enviando notificación a:', url);
      console.log('📧 Datos:', { email: data.email, restaurant: data.restaurantName, code: data.code });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Respuesta del servidor no OK:', result);
        throw new Error(result.error || result.message || 'Error al enviar notificación por email');
      }

      console.log('✅ Notificación enviada exitosamente:', result);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      let errorMessage = 'Error de conexión';
      if (error.name === 'AbortError') {
        errorMessage = 'El servidor no respondió a tiempo. Verifica que esté corriendo.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('❌ Error al enviar email de notificación:', error);
      return {
        success: false,
        message: '',
        error: errorMessage
      };
    }
  }

  // Enviar notificación por email cuando se genera un código
  async sendCodeGeneratedEmail(data: Omit<EmailNotificationData, 'redeemedAt'>): Promise<EmailNotificationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/notifications/email/code-generated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar notificación por email');
      }

      return result;
    } catch (error: any) {
      console.error('Error al enviar email de notificación:', error);
      return {
        success: false,
        message: '',
        error: error.message || 'Error de conexión'
      };
    }
  }

  // Verificar si el servicio de notificaciones está disponible
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/notifications/health`, {
        method: 'GET',
        timeout: 5000,
      });

      return response.ok;
    } catch (error) {
      console.error('Servicio de notificaciones no disponible:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
export const notificationService = new NotificationService();

// Función de utilidad para formatear el mensaje de email
export const formatEmailMessage = (data: EmailNotificationData): string => {
  return `
¡Código canjeado exitosamente!

Restaurante: ${data.restaurantName}
Código: ${data.code}
Descuento: ${data.discountPercent}%
Personas: ${data.people}
Fecha de canje: ${new Date(data.redeemedAt).toLocaleString('es-ES')}

¡Gracias por usar nuestra aplicación!
  `.trim();
};

export default notificationService;
