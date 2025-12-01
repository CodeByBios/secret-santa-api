
import { env } from '../env';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(env.SENDGRID_API_KEY);

export async function sendEmail(toEmail: string, toName: string, recipientName: string, recipientGiftIdea: string) {
  try {
    const subject = `🎄 Secret Santa`;
    const text = `Bonjour ${toName},

    Ton Secret Santa est: ${recipientName}
    Idée cadeau: ${recipientGiftIdea}

    Joyeuses fêtes !`;

    const html = `<p>Bonjour <strong>${toName}</strong>,</p>
    <p>Ton Secret Santa est: <strong>${recipientName}</strong></p>
    <p>Idée cadeau: <em>${recipientGiftIdea}</em></p>
    <p>Joyeuses fêtes ! 🎄</p>`;

    const msg = {
      to: toEmail,
      from: env.SMTP_FROM,
      subject,
      text,
      html
    };

    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent', msg)
      })
      .catch((error: any) => {
        console.error(error, msg)
      })
  } catch (error) {
    console.error('Erreur envoi email:', error);
  }
}
