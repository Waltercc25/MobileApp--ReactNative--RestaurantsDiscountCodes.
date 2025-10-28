# 🍽️ Restaurant Reservations App

Una aplicación móvil de React Native (Expo) para gestionar reservas en restaurantes con sistema de códigos de descuento y autenticación por OTP.

## 🎯 Descripción

Esta aplicación permite a los usuarios:
- **Explorar restaurantes** cercanos con su información detallada
- **Generar códigos de descuento** personalizados para cada reserva
- **Gestionar sus códigos** y marcar cómo canjeados
- **Autenticación segura** mediante OTP (One-Time Password) enviado al correo
- **Notificaciones en tiempo real** para eventos importantes

## 🚀 Características

### Frontend (React Native + Expo)
- 🔐 Autenticación con OTP vía email
- 🎨 Interfaz moderna con Material Design
- 📱 Navegación con React Navigation
- 🔔 Sistema de notificaciones locales y por email
- 💾 Persistencia de datos con Firebase Firestore

### Backend (Node.js + Express)
- 📧 Servidor OTP con envío automático de códigos
- 🔔 Notificaciones por email con templates HTML
- 🛡️ Rate limiting para prevenir abuso
- 🔥 Integración con Firebase Admin SDK

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI
- Firebase project configurado

### Frontend
```bash
# Instalar dependencias
npm install

# Iniciar la aplicación
npx expo start
```

### Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp config.env .env
# Editar .env con tus credenciales

# Iniciar servidor
npm start
```

## 🔧 Configuración

1. **Firebase**: Configura tus credenciales en `config/firebaseConfig.ts`
2. **Backend API**: Configura la URL en `config/api.ts`
3. **Gmail SMTP**: Configura las credenciales en `backend/.env`

## 📱 Tecnologías Utilizadas

### Frontend
- React Native
- Expo
- React Navigation
- Firebase Auth
- Firestore
- TypeScript

### Backend
- Node.js
- Express
- Nodemailer
- Firebase Admin SDK
- Express Rate Limit

## 📚 Documentación

- [Guía de Autenticación](./AUTHENTICATION_GUIDE.md)
- [Configuración Firebase](./FIREBASE_SETUP.md)
- [Sistema de Notificaciones](./NOTIFICATION_SYSTEM_README.md)
- [Sistema OTP](./OTP_SYSTEM_README.md)
- [Inicio Rápido](./QUICK_START.md)

## 🗂️ Estructura del Proyecto

```
├── components/          # Componentes reutilizables
├── screens/            # Pantallas de la aplicación
├── hooks/              # Hooks personalizados
├── services/           # Servicios de integración
├── config/             # Configuración
├── lib/                # Utilidades y helpers
├── types/              # Definiciones TypeScript
└── backend/            # Servidor Node.js
```

## 🎨 Características de UI

- Diseño responsive y adaptable
- Tema de colores consistente
- Animaciones suaves
- Badge de notificaciones
- Iconografía con Ionicons

## 📄 Licencia

MIT

## 👨‍💻 Autor

Tu Nombre - [tu-email@example.com]
