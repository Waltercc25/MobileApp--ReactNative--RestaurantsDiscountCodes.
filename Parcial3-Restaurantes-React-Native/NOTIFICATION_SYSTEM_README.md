# Sistema de Notificaciones - Restaurant App

## Descripción

Este sistema de notificaciones permite a los usuarios recibir notificaciones locales y por email cuando se realizan acciones importantes en la aplicación, como marcar un código como canjeado.

## Características

### 1. Notificaciones Locales
- **Icono desplegable** en la pantalla principal (ExploreScreen)
- **Badge de contador** que muestra el número de notificaciones no leídas
- **Lista desplegable** con todas las notificaciones
- **Marcar como leído** individual o todas a la vez
- **Auto-eliminación** de notificaciones de éxito después de 30 segundos

### 2. Notificaciones por Email
- **Email automático** cuando se marca un código como canjeado
- **Diseño HTML** profesional con detalles del canje
- **Información completa**: restaurante, código, descuento, personas, fecha
- **Rate limiting** para evitar spam (20 emails por IP cada 15 minutos)

## Componentes

### NotificationIcon
- **Ubicación**: `components/NotificationIcon.tsx`
- **Props**:
  - `notifications`: Array de notificaciones
  - `onMarkAsRead`: Función para marcar como leído
  - `onClearAll`: Función para limpiar todas

### useNotifications Hook
- **Ubicación**: `hooks/useNotifications.tsx`
- **Funciones**:
  - `addNotification()`: Agregar nueva notificación
  - `markAsRead()`: Marcar como leído
  - `markAllAsRead()`: Marcar todas como leídas
  - `clearAll()`: Limpiar todas
  - `removeNotification()`: Eliminar específica
  - `getUnreadCount()`: Obtener contador

### NotificationService
- **Ubicación**: `services/notificationService.ts`
- **Métodos**:
  - `sendCodeRedeemedEmail()`: Email de código canjeado
  - `sendCodeGeneratedEmail()`: Email de código generado
  - `checkServiceHealth()`: Verificar estado del servicio

## Backend

### Rutas de Notificaciones
- **Ubicación**: `backend/routes/notifications.js`
- **Endpoints**:
  - `POST /api/notifications/email/code-redeemed`: Notificar código canjeado
  - `POST /api/notifications/email/code-generated`: Notificar código generado
  - `GET /api/notifications/health`: Estado del servicio

### Configuración
- **Rate limiting**: 20 notificaciones por IP cada 15 minutos
- **Validación**: Email, restaurante, código, descuento, personas
- **Templates HTML**: Diseño profesional con gradientes y estilos

## Uso

### 1. Configurar el Provider
```tsx
import { NotificationProvider } from './hooks/useNotifications';

export default function App() {
  return (
    <NotificationProvider>
      {/* Tu aplicación */}
    </NotificationProvider>
  );
}
```

### 2. Usar en Componentes
```tsx
import { useNotifications } from './hooks/useNotifications';

function MyComponent() {
  const { addNotification, notifications } = useNotifications();
  
  const handleAction = () => {
    addNotification({
      title: '¡Éxito!',
      message: 'Acción completada correctamente',
      type: 'success'
    });
  };
}
```

### 3. Agregar Icono de Notificaciones
```tsx
import NotificationIcon from './components/NotificationIcon';

function Header() {
  const { notifications, markAsRead, clearAll } = useNotifications();
  
  return (
    <NotificationIcon 
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onClearAll={clearAll}
    />
  );
}
```

## Tipos de Notificaciones

### Success
- **Color**: Verde
- **Icono**: checkmark-circle
- **Auto-eliminación**: 30 segundos

### Error
- **Color**: Rojo
- **Icono**: close-circle
- **Persistencia**: Hasta marcar como leído

### Warning
- **Color**: Naranja
- **Icono**: warning
- **Persistencia**: Hasta marcar como leído

### Info
- **Color**: Azul
- **Icono**: information-circle
- **Persistencia**: Hasta marcar como leído

## Configuración del Backend

### Variables de Entorno
```env
# Email configuration
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-app-password
```

### Instalación
```bash
cd backend
npm install
npm start
```

### Verificación
```bash
curl http://localhost:3001/api/notifications/health
```

## Flujo de Notificaciones

1. **Usuario marca código como canjeado**
2. **Sistema actualiza estado en Firestore**
3. **Se agrega notificación local** (inmediata)
4. **Se envía email** (asíncrono)
5. **Usuario ve notificación** en el icono
6. **Usuario puede marcar como leído**

## Personalización

### Estilos
- Modificar `components/NotificationIcon.tsx` para cambiar apariencia
- Ajustar colores en `lib/theme.ts`

### Templates de Email
- Editar `backend/routes/notifications.js`
- Modificar HTML y CSS inline

### Rate Limiting
- Ajustar en `backend/routes/notifications.js`
- Cambiar `windowMs` y `max` según necesidades

## Troubleshooting

### Notificaciones no aparecen
1. Verificar que `NotificationProvider` esté configurado
2. Revisar consola para errores
3. Verificar que el hook esté siendo usado correctamente

### Emails no se envían
1. Verificar configuración de Gmail
2. Revisar logs del backend
3. Verificar conectividad de red
4. Comprobar rate limiting

### Errores de TypeScript
1. Verificar imports correctos
2. Revisar tipos en `types/index.ts`
3. Ejecutar `npx tsc --noEmit`

## Próximas Mejoras

- [ ] Notificaciones push para móviles
- [ ] Configuración de preferencias de usuario
- [ ] Historial de notificaciones persistente
- [ ] Templates de email personalizables
- [ ] Notificaciones por SMS
- [ ] Dashboard de estadísticas de notificaciones
