# Backend - Sistema de OTP para App de Restaurantes

Este backend maneja el envío y verificación de códigos OTP por email para la aplicación de restaurantes.

## 🚀 Características

- **Envío de OTP por email** usando Nodemailer con Gmail
- **Almacenamiento seguro** de códigos OTP en Firestore
- **Expiración automática** de códigos (5 minutos)
- **Rate limiting** para prevenir spam
- **Validación robusta** de códigos OTP
- **Limpieza automática** de códigos expirados
- **Estadísticas** de uso de OTP

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **Cuenta de Gmail** con contraseña de aplicación
3. **Proyecto Firebase** con Firestore habilitado
4. **Credenciales de Firebase Admin SDK**

## 🔧 Instalación

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copia `config.env` a `.env`
   - Actualiza las credenciales de Firebase Admin SDK
   - Verifica las credenciales de Gmail

3. **Obtener credenciales de Firebase Admin SDK:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Selecciona tu proyecto `reactnative-miapp`
   - Ve a "Configuración del proyecto" > "Cuentas de servicio"
   - Genera una nueva clave privada
   - Actualiza las variables en `.env`

4. **Iniciar servidor:**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📡 Endpoints de la API

### 1. Enviar Código OTP
```http
POST /api/otp/send
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "type": "login" // o "registration"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Código OTP enviado correctamente",
  "otpId": "abc123def456",
  "expiresAt": "2024-01-01T12:05:00.000Z"
}
```

### 2. Verificar Código OTP
```http
POST /api/otp/verify
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "otpCode": "123456",
  "otpId": "abc123def456"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Código OTP verificado correctamente"
}
```

### 3. Estado del OTP
```http
GET /api/otp/status/usuario@ejemplo.com
```

**Respuesta:**
```json
{
  "success": true,
  "otpId": "abc123def456",
  "otpData": {
    "type": "login",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "expiresAt": "2024-01-01T12:05:00.000Z",
    "attempts": 0,
    "maxAttempts": 3
  }
}
```

### 4. Estadísticas de OTP
```http
GET /api/otp/stats/usuario@ejemplo.com
```

### 5. Limpiar OTPs Expirados
```http
POST /api/otp/cleanup
```

### 6. Health Check
```http
GET /health
```

## 🔒 Seguridad

### Rate Limiting
- **Envío de OTP**: 5 intentos por IP cada 15 minutos
- **Verificación**: 10 intentos por IP cada 5 minutos
- **General**: 100 requests por IP cada 15 minutos

### Validaciones
- **Email válido** con regex
- **Códigos OTP** de 6 dígitos
- **Expiración** automática en 5 minutos
- **Intentos limitados** (3 máximo por código)
- **Hash seguro** de códigos OTP

### Headers de Seguridad
- **Helmet.js** para headers de seguridad
- **CORS** configurado para dominios específicos
- **Validación** de entrada de datos

## 📊 Estructura de Datos

### Colección: `otp_codes`
```json
{
  "email": "usuario@ejemplo.com",
  "hashedOTP": "sha256_hash_del_codigo",
  "type": "login",
  "isUsed": false,
  "createdAt": "timestamp",
  "expiresAt": "timestamp",
  "attempts": 0,
  "maxAttempts": 3,
  "usedAt": "timestamp" // solo si se usa
}
```

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

## 🔧 Configuración de Gmail

1. **Habilitar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a "Seguridad" > "Contraseñas de aplicaciones"
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Ingresa "App Restaurantes"
   - Copia la contraseña generada
3. **Actualizar `.env`** con la contraseña de aplicación

## 📱 Integración con Frontend

El frontend debe hacer las siguientes llamadas:

1. **Después del registro/login** → `POST /api/otp/send`
2. **Mostrar pantalla de OTP** → Capturar código del usuario
3. **Verificar código** → `POST /api/otp/verify`
4. **Si es válido** → Continuar con el flujo normal

## 🐛 Solución de Problemas

### Error: "No se pudo conectar con Gmail"
- Verificar credenciales en `.env`
- Asegurar que la verificación en 2 pasos esté habilitada
- Usar contraseña de aplicación, no la contraseña normal

### Error: "Firebase Admin SDK"
- Verificar que las credenciales estén correctas
- Asegurar que el proyecto Firebase esté configurado
- Verificar que Firestore esté habilitado

### Error: "Rate limit exceeded"
- Esperar el tiempo de ventana especificado
- Verificar que no haya múltiples intentos desde la misma IP

## 📈 Monitoreo

- **Logs detallados** en consola
- **Health check** en `/health`
- **Estadísticas** de OTP por usuario
- **Limpieza automática** de códigos expirados

¡El backend está listo para manejar la verificación OTP de tu aplicación! 🎉
