const express = require('express');
const rateLimit = require('express-rate-limit');
const { sendEmail } = require('../config/nodemailer');

const router = express.Router();

// Rate limiting específico para notificaciones
const notificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 notificaciones por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiadas notificaciones. Intenta más tarde.'
  }
});

// Middleware para validar datos de notificación
const validateNotificationData = (req, res, next) => {
  const { email, restaurantName, code, discountPercent, people } = req.body;
  
  if (!email || !restaurantName || !code || !discountPercent || !people) {
    return res.status(400).json({
      success: false,
      error: 'Faltan datos requeridos: email, restaurantName, code, discountPercent, people'
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Formato de email inválido'
    });
  }

  next();
};

// Enviar notificación cuando se canjea un código
router.post('/email/code-redeemed', notificationRateLimit, validateNotificationData, async (req, res) => {
  try {
    const { email, restaurantName, code, discountPercent, people, redeemedAt } = req.body;
    
    console.log('📧 Solicitud de notificación recibida:', { 
      email, 
      restaurant: restaurantName, 
      code, 
      discount: discountPercent,
      people 
    });

    const subject = '¡Código canjeado exitosamente! 🎉';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">¡Código Canjeado! 🎉</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu descuento ha sido aplicado exitosamente</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; font-size: 22px;">Detalles del Canje</h2>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Restaurante:</strong>
              <span style="color: #6c757d;">${restaurantName}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Código:</strong>
              <span style="color: #007bff; font-weight: bold; font-size: 18px;">${code}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Descuento:</strong>
              <span style="color: #28a745; font-weight: bold; font-size: 18px;">${discountPercent}%</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Personas:</strong>
              <span style="color: #6c757d;">${people}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Fecha de Canje:</strong>
              <span style="color: #6c757d;">${new Date(redeemedAt).toLocaleString('es-ES')}</span>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724; font-size: 16px; font-weight: 500;">
              ¡Gracias por usar nuestra aplicación! Esperamos que hayas disfrutado tu experiencia.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
            <p>Este es un mensaje automático. No respondas a este email.</p>
            <p>© 2024 Restaurant App. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
¡Código canjeado exitosamente!

Restaurante: ${restaurantName}
Código: ${code}
Descuento: ${discountPercent}%
Personas: ${people}
Fecha de canje: ${new Date(redeemedAt).toLocaleString('es-ES')}

¡Gracias por usar nuestra aplicación!
    `.trim();

    console.log('📧 Preparando envío de email...');
    const emailResult = await sendEmail(email, subject, textContent, htmlContent);
    
    if (!emailResult.success) {
      console.error('❌ Error en resultado de sendEmail:', emailResult);
      throw new Error(emailResult.error || 'Error al enviar email');
    }

    console.log(`✅ Email de notificación enviado exitosamente a: ${email} - Código: ${code} - MessageId: ${emailResult.messageId}`);

    res.json({
      success: true,
      message: 'Notificación por email enviada correctamente'
    });

  } catch (error) {
    console.error('❌ Error completo al enviar notificación por email:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación por email',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// Enviar notificación cuando se genera un código
router.post('/email/code-generated', notificationRateLimit, validateNotificationData, async (req, res) => {
  try {
    const { email, restaurantName, code, discountPercent, people } = req.body;

    const subject = '¡Nuevo código de descuento generado! 🎫';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">¡Nuevo Código Generado! 🎫</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu código de descuento está listo para usar</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0; font-size: 22px;">Detalles del Código</h2>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Restaurante:</strong>
              <span style="color: #6c757d;">${restaurantName}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Código:</strong>
              <span style="color: #007bff; font-weight: bold; font-size: 18px;">${code}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Descuento:</strong>
              <span style="color: #28a745; font-weight: bold; font-size: 18px;">${discountPercent}%</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Personas:</strong>
              <span style="color: #6c757d;">${people}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong style="color: #495057;">Fecha de Generación:</strong>
              <span style="color: #6c757d;">${new Date().toLocaleString('es-ES')}</span>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 16px; font-weight: 500;">
              💡 Recuerda mostrar este código al personal del restaurante para obtener tu descuento.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px;">
            <p>Este es un mensaje automático. No respondas a este email.</p>
            <p>© 2024 Restaurant App. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    `;

    const textContent = `
¡Nuevo código de descuento generado!

Restaurante: ${restaurantName}
Código: ${code}
Descuento: ${discountPercent}%
Personas: ${people}
Fecha de generación: ${new Date().toLocaleString('es-ES')}

Recuerda mostrar este código al personal del restaurante para obtener tu descuento.

¡Gracias por usar nuestra aplicación!
    `.trim();

    const emailResult = await sendEmail(email, subject, textContent, htmlContent);
    
    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Error al enviar email');
    }

    console.log(`✅ Email de código generado enviado a: ${email} - Código: ${code}`);

    res.json({
      success: true,
      message: 'Notificación por email enviada correctamente'
    });

  } catch (error) {
    console.error('❌ Error al enviar notificación por email:', error);
    res.status(500).json({
      success: false,
      error: 'Error al enviar notificación por email',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// Health check para notificaciones
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servicio de notificaciones funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
