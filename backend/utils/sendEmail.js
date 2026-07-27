import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // If SMTP is not fully configured, log the email send to console instead of failing
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!isSmtpConfigured) {
    console.log('--- EMAIL SIMULATION (SMTP Not Configured) ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text}`);
    if (options.html) {
      console.log(`HTML Content Available (Size: ${options.html.length} chars)`);
    }
    console.log('----------------------------------------------');
    return { success: true, message: 'Email simulated successfully' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'BookMyHall Platform'}" <${process.env.FROM_EMAIL || 'bookings@bookmyhall.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments || [],
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
  return info;
};

export default sendEmail;
