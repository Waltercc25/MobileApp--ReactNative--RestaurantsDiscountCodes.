const { db, admin } = require('../config/firebase');
const { generateOTP, getExpiryTime, isExpired, hashOTP, verifyOTP } = require('../utils/otpGenerator');

class OTPModel {
  constructor() {
    this.collection = 'otp_codes';
  }

  // Crear un nuevo código OTP
  async createOTP(email, type = 'login') {
    try {
      const otpCode = generateOTP(6);
      const hashedOTP = hashOTP(otpCode);
      const expiryTime = getExpiryTime(5); // 5 minutos
      const createdAt = new Date();

      const otpData = {
        email: email.toLowerCase(),
        hashedOTP,
        type, // 'login' o 'registration'
        isUsed: false,
        createdAt: admin.firestore.Timestamp.fromDate(createdAt),
        expiresAt: admin.firestore.Timestamp.fromDate(expiryTime),
        attempts: 0,
        maxAttempts: 3
      };

      // Guardar en Firestore
      const docRef = await db.collection(this.collection).add(otpData);
      
      console.log(`✅ OTP creado para ${email}:`, docRef.id);
      
      return {
        success: true,
        otpId: docRef.id,
        otpCode, // Solo devolver el código en texto plano para envío
        expiresAt: expiryTime
      };
      
    } catch (error) {
      console.error('❌ Error al crear OTP:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar código OTP
  async verifyOTP(email, inputOTP, otpId) {
    try {
      const emailLower = email.toLowerCase();
      
      // Buscar el OTP por ID
      const otpDoc = await db.collection(this.collection).doc(otpId).get();
      
      if (!otpDoc.exists) {
        return { success: false, error: 'Código OTP no encontrado' };
      }

      const otpData = otpDoc.data();

      // Verificar que el email coincida
      if (otpData.email !== emailLower) {
        return { success: false, error: 'Email no coincide' };
      }

      // Verificar que no haya expirado
      if (isExpired(otpData.expiresAt.toDate())) {
        return { success: false, error: 'Código OTP expirado' };
      }

      // Verificar que no esté usado
      if (otpData.isUsed) {
        return { success: false, error: 'Código OTP ya utilizado' };
      }

      // Verificar intentos máximos
      if (otpData.attempts >= otpData.maxAttempts) {
        return { success: false, error: 'Demasiados intentos fallidos' };
      }

      // Verificar el código
      const isValid = verifyOTP(inputOTP, otpData.hashedOTP);

      if (isValid) {
        // Marcar como usado
        await db.collection(this.collection).doc(otpId).update({
          isUsed: true,
          usedAt: admin.firestore.Timestamp.fromDate(new Date())
        });

        return { success: true, message: 'Código OTP verificado correctamente' };
      } else {
        // Incrementar intentos
        await db.collection(this.collection).doc(otpId).update({
          attempts: admin.firestore.FieldValue.increment(1)
        });

        return { 
          success: false, 
          error: 'Código OTP incorrecto',
          remainingAttempts: otpData.maxAttempts - (otpData.attempts + 1)
        };
      }

    } catch (error) {
      console.error('❌ Error al verificar OTP:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener OTP por email (último no usado)
  async getActiveOTP(email) {
    try {
      const emailLower = email.toLowerCase();
      
      const snapshot = await db.collection(this.collection)
        .where('email', '==', emailLower)
        .where('isUsed', '==', false)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { success: false, error: 'No hay código OTP activo' };
      }

      const doc = snapshot.docs[0];
      const otpData = doc.data();

      // Verificar si ha expirado
      if (isExpired(otpData.expiresAt.toDate())) {
        return { success: false, error: 'Código OTP expirado' };
      }

      return {
        success: true,
        otpId: doc.id,
        otpData: {
          type: otpData.type,
          createdAt: otpData.createdAt.toDate(),
          expiresAt: otpData.expiresAt.toDate(),
          attempts: otpData.attempts,
          maxAttempts: otpData.maxAttempts
        }
      };

    } catch (error) {
      console.error('❌ Error al obtener OTP activo:', error);
      return { success: false, error: error.message };
    }
  }

  // Limpiar códigos OTP expirados
  async cleanupExpiredOTPs() {
    try {
      const now = admin.firestore.Timestamp.fromDate(new Date());
      
      const snapshot = await db.collection(this.collection)
        .where('expiresAt', '<', now)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      console.log(`✅ Limpiados ${snapshot.size} códigos OTP expirados`);
      return { success: true, cleaned: snapshot.size };

    } catch (error) {
      console.error('❌ Error al limpiar OTPs expirados:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de OTP
  async getOTPStats(email) {
    try {
      const emailLower = email.toLowerCase();
      
      const snapshot = await db.collection(this.collection)
        .where('email', '==', emailLower)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const stats = {
        total: snapshot.size,
        used: 0,
        expired: 0,
        active: 0,
        recent: []
      };

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const now = new Date();
        const isExpiredOTP = isExpired(data.expiresAt.toDate());

        if (data.isUsed) stats.used++;
        else if (isExpiredOTP) stats.expired++;
        else stats.active++;

        stats.recent.push({
          id: doc.id,
          type: data.type,
          createdAt: data.createdAt.toDate(),
          isUsed: data.isUsed,
          isExpired: isExpiredOTP
        });
      });

      return { success: true, stats };

    } catch (error) {
      console.error('❌ Error al obtener estadísticas OTP:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new OTPModel();
