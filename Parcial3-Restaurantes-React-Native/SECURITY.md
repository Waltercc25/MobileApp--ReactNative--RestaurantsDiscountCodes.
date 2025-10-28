# 🔐 Seguridad

## ⚠️ IMPORTANTE: Credenciales Comprometidas

**Las credenciales que fueron expuestas en el commit inicial (`451b2ce`) han sido comprometidas y deben ser revocadas inmediatamente.**

### Credenciales que necesitan ser revocadas:

#### 1. Firebase API Key
- **API Key**: `AIzaSyDtEPN68cD9qwaU766SsLhn8DuLyDIfTxY`
- **Revocar en**: Firebase Console > Configuración del proyecto > Configuración general > Tu app web

#### 2. Firebase Admin SDK
- **Private Key** y otras credenciales que fueron expuestas en `backend/config.env`
- **Revocar en**: Firebase Console > Configuración > Cuentas de servicio

#### 3. Gmail App Password
- **Email**: `ufgpruebaprueba@gmail.com`
- **App Password**: `nibf ghxa gzpr pixe`
- **Revocar en**: [Google Account > Security > App Passwords](https://myaccount.google.com/apppasswords)

## 🛡️ Pasos a seguir:

1. **Revocar TODAS las credenciales expuestas** usando los enlaces arriba
2. **Generar nuevas credenciales** para cada servicio
3. **Actualizar tus archivos `.env` locales** con las nuevas credenciales
4. **NUNCA subir archivos `.env` a Git** (ya están en `.gitignore`)

## 📋 Configuración Local

### Frontend
1. Copia `.env.example` a `.env`
2. Completa las variables de entorno con tus credenciales

### Backend
1. Copia `backend/config.env.example` a `backend/.env`
2. Completa las variables de entorno con tus credenciales

## ✅ Buenas Prácticas de Seguridad

- ✅ **NUNCA** subas archivos con credenciales reales
- ✅ Usa archivos `.example` como plantillas
- ✅ Mantén `.gitignore` actualizado
- ✅ Usa contraseñas de aplicación para Gmail
- ✅ Implementa rate limiting en tus APIs
- ✅ Usa HTTPS en producción

