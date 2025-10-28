# Flujo del Sistema de Notificaciones

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE NOTIFICACIONES                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USUARIO       │    │   FRONTEND      │    │   BACKEND       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ 1. Marca código │    │ 2. useCodes     │    │ 3. Firestore    │
│    como canjeado│───▶│    redeemCode() │───▶│    Actualiza    │
│                 │    │                 │    │    estado       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ 4. Notificación │
                       │    Local        │
                       │ addNotification │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ 5. NotificationIcon│
                       │    Muestra      │
                       │    notificación │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ 6. Email        │───▶│ 7. Gmail        │
                       │    Service      │    │    Envía        │
                       │    sendEmail()  │    │    notificación │
                       └─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENTES PRINCIPALES                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ NotificationIcon│    │ useNotifications│    │ NotificationService│
│                 │    │                 │    │                 │
│ • Icono con     │    │ • Estado global │    │ • Envío emails  │
│   badge         │    │ • addNotification│   │ • Rate limiting │
│ • Dropdown      │    │ • markAsRead    │    │ • Templates     │
│ • Animaciones   │    │ • clearAll      │    │ • Validación    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TIPOS DE NOTIFICACIONES                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   SUCCESS   │  │    ERROR    │  │   WARNING   │  │     INFO    │
│             │  │             │  │             │  │             │
│ 🟢 Verde    │  │ 🔴 Rojo     │  │ 🟠 Naranja  │  │ 🔵 Azul     │
│ ✅ Check    │  │ ❌ Close     │  │ ⚠️ Warning   │  │ ℹ️ Info      │
│ Auto-remove │  │ Persistente │  │ Persistente │  │ Persistente │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND ROUTES                          │
└─────────────────────────────────────────────────────────────────┘

POST /api/notifications/email/code-redeemed
├── Valida datos (email, restaurante, código, etc.)
├── Genera template HTML profesional
├── Envía email vía Gmail
└── Retorna confirmación

POST /api/notifications/email/code-generated
├── Valida datos del código generado
├── Genera template HTML informativo
├── Envía email vía Gmail
└── Retorna confirmación

GET /api/notifications/health
└── Verifica estado del servicio

┌─────────────────────────────────────────────────────────────────┐
│                      CONFIGURACIÓN REQUERIDA                   │
└─────────────────────────────────────────────────────────────────┘

1. Variables de entorno (.env):
   GMAIL_USER=tu-email@gmail.com
   GMAIL_APP_PASSWORD=tu-app-password

2. Dependencias backend:
   npm install nodemailer express-rate-limit

3. Provider en App.tsx:
   <NotificationProvider>
     <CodesProvider>
       <App />
     </CodesProvider>
   </NotificationProvider>

4. Hook en componentes:
   const { addNotification, notifications } = useNotifications();

┌─────────────────────────────────────────────────────────────────┐
│                         RATE LIMITING                          │
└─────────────────────────────────────────────────────────────────┘

• 20 notificaciones por IP cada 15 minutos
• Prevención de spam y abuso
• Configurable en backend/routes/notifications.js
• Aplicado a endpoints de email únicamente

┌─────────────────────────────────────────────────────────────────┐
│                        TROUBLESHOOTING                         │
└─────────────────────────────────────────────────────────────────┘

Problema: Notificaciones no aparecen
Solución: Verificar NotificationProvider y imports

Problema: Emails no se envían
Solución: Verificar Gmail credentials y conectividad

Problema: Errores TypeScript
Solución: Verificar tipos y imports correctos
