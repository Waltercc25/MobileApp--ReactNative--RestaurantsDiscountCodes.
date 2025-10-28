# 🚀 Inicio Rápido - Sistema OTP

## Configuración en 5 Pasos

### 1. 📧 Configurar Gmail
```bash
# 1. Ve a tu cuenta de Gmail
# 2. Seguridad > Verificación en 2 pasos (habilitar)
# 3. Seguridad > Contraseñas de aplicaciones
# 4. Generar nueva contraseña para "App Restaurantes"
# 5. Copiar la contraseña generada
```

### 2. 🔥 Configurar Firebase
```bash
# 1. Ve a Firebase Console (https://console.firebase.google.com/)
# 2. Selecciona proyecto "reactnative-miapp"
# 3. Configuración del proyecto > Cuentas de servicio
# 4. Generar nueva clave privada
# 5. Descargar el archivo JSON
```

### 3. ⚙️ Configurar Variables de Entorno
```bash
# Editar backend/.env
GMAIL_USER=ufgpruebaprueba@gmail.com
GMAIL_PASS=tu_contraseña_de_aplicacion_aqui

# Copiar datos del JSON de Firebase a .env
FIREBASE_PROJECT_ID=reactnative-miapp
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@reactnative-miapp.iam.gserviceaccount.com
# ... otros campos del JSON
```

### 4. 🚀 Iniciar Backend
```bash
cd backend
npm run dev
# Debería mostrar: "Servidor iniciado correctamente en puerto 3001"
```

### 5. 📱 Iniciar Frontend
```bash
# En otra terminal
npm start
# Escanea el QR con Expo Go
```

## ✅ Verificar que Funciona

1. **Backend funcionando**: http://localhost:3001/health
2. **Crear cuenta** en la app
3. **Verificar email** con código OTP
4. **Iniciar sesión** con verificación OTP

## 🐛 Problemas Comunes

### "No se pudo conectar con Gmail"
- ✅ Verificar que la verificación en 2 pasos esté habilitada
- ✅ Usar contraseña de aplicación, no la contraseña normal
- ✅ Verificar que GMAIL_USER y GMAIL_PASS estén correctos

### "Firebase Admin SDK error"
- ✅ Verificar que las credenciales estén en backend/.env
- ✅ Asegurar que el proyecto Firebase esté configurado
- ✅ Verificar que Firestore esté habilitado

### "Backend no disponible"
- ✅ Verificar que el servidor esté ejecutándose en puerto 3001
- ✅ Comprobar que no haya errores en la consola del backend
- ✅ Verificar la configuración de CORS

## 📞 Soporte

Si tienes problemas:
1. Revisar logs del backend
2. Verificar configuración de Firebase
3. Comprobar credenciales de Gmail
4. Revisar la documentación completa en `OTP_SYSTEM_README.md`

¡Listo para usar! 🎉
