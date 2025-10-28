const crypto = require('crypto');

// Generar código OTP de 6 dígitos
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

// Generar código OTP con caracteres alfanuméricos
const generateAlphaNumericOTP = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += characters[crypto.randomInt(0, characters.length)];
  }
  
  return otp;
};

// Calcular tiempo de expiración
const getExpiryTime = (minutes = 5) => {
  const now = new Date();
  return new Date(now.getTime() + (minutes * 60 * 1000));
};

// Verificar si el código ha expirado
const isExpired = (expiryTime) => {
  return new Date() > new Date(expiryTime);
};

// Generar hash del código OTP para almacenamiento seguro
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Verificar código OTP
const verifyOTP = (inputOTP, hashedOTP) => {
  const inputHash = hashOTP(inputOTP);
  return inputHash === hashedOTP;
};

module.exports = {
  generateOTP,
  generateAlphaNumericOTP,
  getExpiryTime,
  isExpired,
  hashOTP,
  verifyOTP
};
