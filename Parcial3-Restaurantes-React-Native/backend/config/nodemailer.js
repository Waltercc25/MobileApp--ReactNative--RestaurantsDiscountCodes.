const nodemailer = require('nodemailer');

// Configuración del transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Función para verificar la conexión
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Conexión con Gmail establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Gmail:', error);
    return false;
  }
};

// Función para enviar email con OTP
const sendOTPEmail = async (email, otpCode, isRegistration = false) => {
  try {
    const subject = isRegistration 
      ? 'Verifica tu cuenta - Código OTP' 
      : 'Código de verificación - Inicio de sesión';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">
            ${isRegistration ? '¡Bienvenido!' : 'Verificación de Seguridad'}
          </h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            ${isRegistration 
              ? 'Gracias por registrarte en nuestra aplicación de restaurantes. Para completar tu registro, por favor verifica tu email con el siguiente código:'
              : 'Has solicitado iniciar sesión en tu cuenta. Para continuar, ingresa el siguiente código de verificación:'
            }
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea;">
            <h2 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: 'Courier New', monospace;">
              ${otpCode}
            </h2>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            <strong>⏰ Este código expira en 5 minutos</strong>
          </p>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            Si no solicitaste este código, por favor ignora este email.
          </p>
          
          <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: {
        name: 'App Restaurantes',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP enviado a ${email}:`, result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error al enviar email OTP:', error);
    return { success: false, error: error.message };
  }
};

// Función para enviar email genérico (para notificaciones)
const sendEmail = async (email, subject, textContent, htmlContent) => {
  try {
    console.log(`📧 Intentando enviar email a: ${email}`);
    console.log(`📧 Subject: ${subject}`);
    
    const mailOptions = {
      from: {
        name: 'App Restaurantes',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    console.log('📧 MailOptions:', { to: mailOptions.to, subject: mailOptions.subject });
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado exitosamente a ${email}:`, result.messageId);
    console.log(`✅ Response from transporter:`, result.response);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error completo al enviar email:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error command:', error.command);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  verifyConnection,
  sendOTPEmail,
  sendEmail
};
