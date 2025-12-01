
import nodemailer from 'nodemailer';
import { env } from '../env';

export function createTransport() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new Error('SMTP non configuré');
  }
  const transport = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 30000
  };
  console.log('SMTP config:', transport);
  return nodemailer.createTransport(transport);
}

export async function sendAssignmentEmail(toEmail: string, toName: string, recipientName: string, recipientGiftIdea: string) {
  const transporter = createTransport();
  transporter.verify().then(console.log).catch(console.error);
  const subject = `🎄 Secret Santa`;
  const text = `Bonjour ${toName},

Ton Secret Santa est: ${recipientName}
Idée cadeau: ${recipientGiftIdea}

Joyeuses fêtes !`;
  const html = `<p>Bonjour <strong>${toName}</strong>,</p>
<p>Ton Secret Santa est: <strong>${recipientName}</strong></p>
<p>Idée cadeau: <em>${recipientGiftIdea}</em></p>
<p>Joyeuses fêtes ! 🎄</p>`;

  await transporter.sendMail({ from: env.SMTP_FROM, to: toEmail, subject, text, html });
}
