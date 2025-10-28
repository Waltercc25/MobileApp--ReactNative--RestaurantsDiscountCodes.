require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { verifyConnection } = require('./config/nodemailer');
const OTPModel = require('./models/OTP');

// Importar rutas
const otpRoutes = require('./routes/otp');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://localhost:19000',
    'http://localhost:8081',
    'http://192.168.1.19:3000',
    'http://192.168.1.19:19006',
    'http://192.168.1.19:19000',
    'http://192.168.1.19:8081',
    'exp://192.168.1.19:8081',
    'exp://192.168.1.19:19000',
    'http://192.168.1.20:3000',
    'http://192.168.1.20:19006',
    'http://192.168.1.20:19000',
    'exp://192.168.1.20:19000',
    'http://192.168.1.21:3000',
    'http://192.168.1.21:19006',
    'http://192.168.1.21:19000',
    'exp://192.168.1.21:19000',
    'exp://192.168.1.100:19000',
    'exp://192.168.1.101:19000',
    'exp://192.168.1.102:19000',
    'exp://192.168.1.103:19000',
    'exp://192.168.1.104:19000',
    'exp://192.168.1.105:19000',
    'exp://192.168.1.106:19000',
    'exp://192.168.1.107:19000',
    'exp://192.168.1.108:19000',
    'exp://192.168.1.109:19000',
    'exp://192.168.1.110:19000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting general
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP cada 15 minutos
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intenta más tarde.'
  }
});

app.use(generalRateLimit);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Rutas
app.use('/api/otp', otpRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta de información
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    service: 'Restaurant App Backend',
    version: '1.0.0',
    features: [
      'OTP Email Verification',
      'Firebase Integration',
      'Rate Limiting',
      'Security Headers',
      'Email Notifications'
    ],
    endpoints: {
      'POST /api/otp/send': 'Enviar código OTP',
      'POST /api/otp/verify': 'Verificar código OTP',
      'GET /api/otp/status/:email': 'Estado del OTP',
      'GET /api/otp/stats/:email': 'Estadísticas de OTP',
      'POST /api/otp/cleanup': 'Limpiar OTPs expirados',
      'POST /api/notifications/email/code-redeemed': 'Notificar código canjeado',
      'POST /api/notifications/email/code-generated': 'Notificar código generado',
      'GET /api/notifications/health': 'Estado del servicio de notificaciones',
      'GET /health': 'Estado del servidor'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Verificar conexión con Gmail
    console.log('🔧 Verificando conexión con Gmail...');
    const gmailConnected = await verifyConnection();
    
    if (!gmailConnected) {
      console.error('❌ No se pudo conectar con Gmail. Verifica las credenciales.');
      process.exit(1);
    }

    // Limpiar OTPs expirados al iniciar
    console.log('🧹 Limpiando códigos OTP expirados...');
    await OTPModel.cleanupExpiredOTPs();

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Servidor iniciado correctamente');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 URL Local: http://localhost:${PORT}`);
      console.log(`🌐 URL Red: http://192.168.1.21:${PORT}`);
      console.log(`📊 Health Check: http://192.168.1.21:${PORT}/health`);
      console.log(`📋 API Info: http://192.168.1.21:${PORT}/api/info`);
      console.log('✅ Servidor listo para recibir solicitudes desde cualquier IP');
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida. Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
