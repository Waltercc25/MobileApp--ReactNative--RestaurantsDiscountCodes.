# Configuración de Reglas de Firestore

## Problema
Error: `Missing or insufficient permissions` al intentar leer códigos de reserva.

## Solución
Necesitas configurar las reglas de Firestore en la consola de Firebase.

### Pasos:

1. **Ve a la Consola de Firebase**:
   - Abre https://console.firebase.google.com
   - Selecciona tu proyecto: `reactnative-miapp`

2. **Navega a Firestore Database**:
   - En el menú lateral, haz clic en "Firestore Database"
   - Ve a la pestaña "Rules"

3. **Reemplaza las reglas existentes** con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para códigos de reserva
    match /reservationCodes/{document} {
      // Permitir lectura y escritura solo a usuarios autenticados
      // y solo para sus propios códigos
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      
      // Permitir creación de nuevos códigos para usuarios autenticados
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Reglas para restaurantes (lectura pública)
    match /restaurants/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Reglas para usuarios
    match /users/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.id;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.id;
    }
  }
}
```

4. **Haz clic en "Publish"** para aplicar las reglas.

### Alternativa Temporal (Solo para desarrollo):
Si quieres una solución rápida para pruebas, puedes usar estas reglas menos restrictivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // PERMISIVO - Solo para desarrollo
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ADVERTENCIA**: Las reglas permisivas solo deben usarse en desarrollo, nunca en producción.

### Verificación:
Después de aplicar las reglas, la aplicación debería poder:
- Crear códigos de reserva
- Leer códigos del usuario autenticado
- Mostrar la lista de códigos sin errores de permisos
