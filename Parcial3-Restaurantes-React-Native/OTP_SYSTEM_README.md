# Sistema de Verificación OTP - App de Restaurantes

Este sistema implementa verificación de email mediante códigos OTP (One-Time Password) para la aplicación de restaurantes React Native.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Backend API   │    │   Firebase      │
│   Frontend      │◄──►│   Node.js       │◄──►│   Firestore     │
│                 │    │   Express       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Gmail SMTP    │
                       │   Nodemailer    │
                       └─────────────────┘
```

## 📁 Estructura del Proyecto

```
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuraciones
│   │   ├── firebase.js     # Firebase Admin SDK
│   │   └── nodemailer.js   # Configuración de email
│   ├── models/             # Modelos de datos
│   │   └── OTP.js          # Modelo de OTP
│   ├── routes/             # Rutas de la API
│   │   └── otp.js          # Endpoints de OTP
│   ├── utils/              # Utilidades
│   │   └── otpGenerator.js # Generación de códigos
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependencias
│   └── config.env          # Variables de entorno
│
├── services/               # Servicios del frontend
│   └── otpService.ts       # Comunicación con backend
│
├── components/             # Componentes React Native
│   └── OTPVerification.tsx # Pantalla de verificación
│
├── config/                 # Configuraciones del frontend
│   └── api.ts              # Configuración de API
│
└── screens/                # Pantallas
    └── LoginScreen.tsx     # Login con OTP integrado
```

## 🚀 Características Implementadas

### Backend (Node.js + Express)
- ✅ **Envío de OTP por email** usando Nodemailer con Gmail
- ✅ **Almacenamiento seguro** en Firestore con hash SHA-256
- ✅ **Expiración automática** de códigos (5 minutos)
- ✅ **Rate limiting** para prevenir spam
- ✅ **Validación robusta** de códigos OTP
- ✅ **Limpieza automática** de códigos expirados
- ✅ **Estadísticas** de uso de OTP
- ✅ **Headers de seguridad** con Helmet.js
- ✅ **CORS configurado** para React Native

### Frontend (React Native)
- ✅ **Pantalla de verificación OTP** con diseño moderno
- ✅ **Timer de expiración** en tiempo real
- ✅ **Validación de entrada** de código
- ✅ **Reenvío de códigos** con rate limiting
- ✅ **Manejo de errores** específicos
- ✅ **Animaciones** para feedback visual
- ✅ **Integración completa** con Firebase Auth

## 🔧 Configuración e Instalación

### 1. Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp config.env .env
# Editar .env con tus credenciales

# Iniciar servidor
npm run dev
```

### 2. Frontend

```bash
# En el directorio raíz del proyecto
npm install

# Iniciar aplicación
npm start
```

## 📧 Configuración de Gmail

1. **Habilitar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a "Seguridad" > "Contraseñas de aplicaciones"
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Ingresa "App Restaurantes"
   - Copia la contraseña generada
3. **Actualizar `.env`** con la contraseña de aplicación

## 🔐 Configuración de Firebase

1. **Obtener credenciales de Firebase Admin SDK**:
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto `reactnative-miapp`
   - Ve a "Configuración del proyecto" > "Cuentas de servicio"
   - Genera una nueva clave privada
   - Actualiza las variables en `backend/.env`

2. **Configurar reglas de Firestore**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /otp_codes/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔄 Flujo de Verificación OTP

### 1. Registro de Usuario
```
Usuario → Ingresa datos → Firebase Auth → Crea cuenta → Backend envía OTP → Email → Usuario verifica → Acceso
```

### 2. Login de Usuario
```
Usuario → Ingresa credenciales → Firebase Auth → Verifica → Backend envía OTP → Email → Usuario verifica → Acceso
```

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/otp/send` | Enviar código OTP |
| POST | `/api/otp/verify` | Verificar código OTP |
| GET | `/api/otp/status/:email` | Estado del OTP |
| GET | `/api/otp/stats/:email` | Estadísticas de OTP |
| POST | `/api/otp/cleanup` | Limpiar OTPs expirados |
| GET | `/health` | Estado del servidor |

## 🧪 Pruebas

### Prueba de Envío de OTP
```bash
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email": "test@ejemplo.com", "type": "login"}'
```

### Prueba de Verificación
```bash
curl -X POST http://localhost:3001/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@ejemplo.com", "otpCode": "123456", "otpId": "otp_id_aqui"}'
```

## 🔒 Seguridad

### Medidas Implementadas
- **Hash SHA-256** de códigos OTP
- **Expiración automática** en 5 minutos
- **Rate limiting** por IP
- **Validación de entrada** robusta
- **Headers de seguridad** con Helmet.js
- **CORS configurado** específicamente
- **Limpieza automática** de códigos expirados

### Rate Limiting
- **Envío de OTP**: 5 intentos por IP cada 15 minutos
- **Verificación**: 10 intentos por IP cada 5 minutos
- **General**: 100 requests por IP cada 15 minutos

## 📊 Monitoreo

- **Logs detallados** en consola del servidor
- **Health check** en `/health`
- **Estadísticas** de OTP por usuario
- **Limpieza automática** de códigos expirados
- **Métricas** de uso y errores

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con Gmail"
- Verificar credenciales en `backend/.env`
- Asegurar que la verificación en 2 pasos esté habilitada
- Usar contraseña de aplicación, no la contraseña normal

### Error: "Firebase Admin SDK"
- Verificar que las credenciales estén correctas
- Asegurar que el proyecto Firebase esté configurado
- Verificar que Firestore esté habilitado

### Error: "Rate limit exceeded"
- Esperar el tiempo de ventana especificado
- Verificar que no haya múltiples intentos desde la misma IP

### Error: "Backend no disponible"
- Verificar que el servidor esté ejecutándose
- Comprobar la URL en `config/api.ts`
- Verificar la configuración de CORS

## 🚀 Despliegue

### Backend
1. **Configurar variables de entorno** en el servidor
2. **Instalar dependencias**: `npm install --production`
3. **Iniciar servidor**: `npm start`
4. **Configurar proxy reverso** (Nginx/Apache)
5. **Configurar SSL** para HTTPS

### Frontend
1. **Actualizar URL del backend** en `config/api.ts`
2. **Configurar variables de entorno** para producción
3. **Build de la aplicación** con Expo/React Native
4. **Desplegar** en App Store/Google Play

## 📈 Próximas Mejoras

- [ ] **SMS OTP** como alternativa a email
- [ ] **Push notifications** para códigos OTP
- [ ] **Biometría** para verificación adicional
- [ ] **Dashboard** de administración
- [ ] **Métricas avanzadas** y analytics
- [ ] **Backup** de códigos OTP
- [ ] **Integración** con servicios de email alternativos

## 📞 Soporte

Para problemas o preguntas:
1. Revisar los logs del servidor
2. Verificar la configuración de Firebase
3. Comprobar las credenciales de Gmail
4. Revisar la documentación de la API

¡El sistema de verificación OTP está completamente implementado y listo para usar! 🎉
