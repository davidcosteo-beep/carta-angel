const nodemailer = require('nodemailer');

const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || process.env.SMTP_USER
});

const isMailConfigured = () => {
  const config = getSmtpConfig();

  return Boolean(
    config.host &&
    config.user &&
    config.pass &&
    config.from
  );
};

const createTransporter = () => {
  const config = getSmtpConfig();

  if (!isMailConfigured()) {
    throw new Error('SMTP no configurado.');
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
};

const sendEmailConfirmationCode = async ({
  to,
  code,
  expiresInMinutes
}) => {
  const transporter = createTransporter();
  const config = getSmtpConfig();

  await transporter.sendMail({
    from: config.from,
    to,
    subject: 'Kabala Pro - Código de confirmación de correo',
    text: [
      'Hola.',
      'Tu usuario en Kabala Pro fue creado correctamente.',
      'Para activar el acceso, confirma tu correo con este código:',
      '',
      code,
      '',
      `Este código vence en ${expiresInMinutes} minutos.`,
      'Si no solicitaste este usuario, puedes ignorar este mensaje.',
      '',
      'Kabala Pro'
    ].join('\n'),
    html: `
      <div style="font-family: Georgia, serif; color: #3a1f12;">
        <h2>Kabala Pro</h2>
        <p>Tu usuario fue creado correctamente.</p>
        <p>Para activar el acceso, confirma tu correo con este código:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
          ${code}
        </p>
        <p>Este código vence en ${expiresInMinutes} minutos.</p>
        <p>Si no solicitaste este usuario, puedes ignorar este mensaje.</p>
      </div>
    `
  });
};

module.exports = {
  isMailConfigured,
  sendEmailConfirmationCode
};
