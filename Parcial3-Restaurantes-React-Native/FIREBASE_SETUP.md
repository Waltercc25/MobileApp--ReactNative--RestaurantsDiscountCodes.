# Configuración de Firebase

Este proyecto está configurado para usar Firebase con React Native. Aquí están los detalles de la configuración:

## Archivos de configuración creados

### 1. `config/firebaseConfig.ts`
- Configuración principal de Firebase para React Native
- Incluye inicialización de Auth, Firestore y Storage
- Configurado con persistencia usando AsyncStorage

### 2. `config/firebase.ts`
- Configuración alternativa para web (si es necesario)
- Versión simplificada para desarrollo web

### 3. `lib/firebaseUtils.ts`
- Utilidades para interactuar con Firestore
- Funciones para restaurantes y códigos de reserva
- Manejo de errores incluido

## Dependencias instaladas

```bash
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-async-storage/async-storage
```

## Configuración del proyecto

### 1. Archivos de configuración nativos
- `android/app/google-services.json` - Configuración para Android
- `ios/GoogleService-Info.plist` - Configuración para iOS
- `firebase.json` - Configuración general de Firebase

### 2. app.json actualizado
- Incluye el plugin `@react-native-firebase/app`
- Configurado para funcionar con Expo

## Uso en la aplicación

### Autenticación
El hook `useAuth` ahora está integrado con Firebase Auth:

```typescript
const { user, login, register, logout } = useAuth();

// Login
await login('email@example.com', 'password');

// Registro
await register('email@example.com', 'password');

// Logout
await logout();
```

### Firestore
Usa las utilidades de `lib/firebaseUtils.ts`:

```typescript
import { getRestaurants, createReservationCode } from '../lib/firebaseUtils';

// Obtener restaurantes
const restaurants = await getRestaurants();

// Crear código de reserva
const codeId = await createReservationCode({
  restaurantId: 'restaurant-id',
  restaurantName: 'Restaurant Name',
  userId: 'user-id',
  people: 4,
  discountPercent: 20,
  code: 'DISCOUNT20'
});
```

## Configuración de Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `reactnative-miapp`
3. Habilita Authentication con Email/Password
4. Habilita Firestore Database
5. Configura las reglas de seguridad según tus necesidades

## Reglas de Firestore (ejemplo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restaurantes - lectura pública
    match /restaurants/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Códigos de reserva - solo para usuarios autenticados
    match /reservationCodes/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## Próximos pasos

1. Ejecuta `expo start` para probar la aplicación
2. Verifica que la autenticación funcione correctamente
3. Prueba las funciones de Firestore
4. Configura las reglas de seguridad en Firebase Console
5. Añade datos de prueba en Firestore

## Notas importantes

- La configuración actual usa las credenciales proporcionadas
- Asegúrate de que Firebase esté configurado correctamente en la consola
- Las reglas de seguridad deben configurarse según tus necesidades
- Para producción, considera usar variables de entorno para las credenciales
