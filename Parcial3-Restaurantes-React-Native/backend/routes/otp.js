const express = require('express');
const router = express.Router();
const OTPModel = require('../models/OTP');
const { sendOTPEmail } = require('../config/nodemailer');
const rateLimit = require('express-rate-limit');

// Rate limiting para prevenir spam
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos. Intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para verificación de OTP
const verifyRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 intentos por IP cada 5 minutos
  message: {
    success: false,
    error: 'Demasiados intentos de verificación. Intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para validar email
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Email inválido'
    });
  }
  
  next();
};

// POST /api/otp/send - Enviar código OTP
router.post('/send', otpRateLimit, validateEmail, async (req, res) => {
  try {
    const { email, type = 'login' } = req.body;
    
    console.log(`📧 Solicitando OTP para ${email} (tipo: ${type})`);

    // Crear código OTP
    const otpResult = await OTPModel.createOTP(email, type);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        error: otpResult.error
      });
    }

    // Enviar email
    const emailResult = await sendOTPEmail(email, otpResult.otpCode, type === 'registration');
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Error al enviar email'
      });
    }

    res.json({
      success: true,
      message: 'Código OTP enviado correctamente',
      otpId: otpResult.otpId,
      expiresAt: otpResult.expiresAt,
      // No devolver el código OTP por seguridad
    });

  } catch (error) {
    console.error('❌ Error en endpoint send OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/otp/verify - Verificar código OTP
router.post('/verify', verifyRateLimit, async (req, res) => {
  try {
    const { email, otpCode, otpId } = req.body;
    
    if (!email || !otpCode || !otpId) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos'
      });
    }

    console.log(`🔍 Verificando OTP para ${email}`);

    // Verificar código OTP
    const verifyResult = await OTPModel.verifyOTP(email, otpCode, otpId);
    
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        error: verifyResult.error,
        remainingAttempts: verifyResult.remainingAttempts
      });
    }

    res.json({
      success: true,
      message: 'Código OTP verificado correctamente'
    });

  } catch (error) {
    console.error('❌ Error en endpoint verify OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/otp/status/:email - Obtener estado del OTP
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    const statusResult = await OTPModel.getActiveOTP(email);
    
    if (!statusResult.success) {
      return res.status(404).json({
        success: false,
        error: statusResult.error
      });
    }

    res.json({
      success: true,
      otpId: statusResult.otpId,
      otpData: statusResult.otpData
    });

  } catch (error) {
    console.error('❌ Error en endpoint status OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/otp/stats/:email - Obtener estadísticas de OTP
router.get('/stats/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    const statsResult = await OTPModel.getOTPStats(email);
    
    if (!statsResult.success) {
      return res.status(500).json({
        success: false,
        error: statsResult.error
      });
    }

    res.json({
      success: true,
      stats: statsResult.stats
    });

  } catch (error) {
    console.error('❌ Error en endpoint stats OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/otp/cleanup - Limpiar códigos OTP expirados
router.post('/cleanup', async (req, res) => {
  try {
    const cleanupResult = await OTPModel.cleanupExpiredOTPs();
    
    if (!cleanupResult.success) {
      return res.status(500).json({
        success: false,
        error: cleanupResult.error
      });
    }

    res.json({
      success: true,
      message: `Se limpiaron ${cleanupResult.cleaned} códigos OTP expirados`
    });

  } catch (error) {
    console.error('❌ Error en endpoint cleanup OTP:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
