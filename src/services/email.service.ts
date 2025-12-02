
import { env } from '../env';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(env.SENDGRID_API_KEY);

export async function sendEmail(toEmail: string, toName: string, recipientName: string, recipientGiftIdea: string) {
  try {
    const subject = `🎄 Secret Santa - Joyeuses fêtes !`;
    const text = `
    Bonjour ${toName},

    Ton Secret Santa est : ${recipientName}
    Idée cadeau : ${recipientGiftIdea}

    🎁 Découvrez plus d'idées sur ce site : https://www.amazon.fr

    Merci de participer à notre Secret Santa !
    L'équipe Secret Santa
    `;

    const html = `
    <div style="font-family: Arial, sans-serif; color:#333;">
      <h2 style="color:#2c3e50;">🎄 Joyeux Secret Santa !</h2>
      <p>Bonjour <strong>${toName}</strong>,</p>
      <p>Ton Secret Santa est : <strong>${recipientName}</strong></p>
      <p>Idée cadeau : <em>${recipientGiftIdea}</em></p>
      <p style="margin-top:15px;">
        🎁 <a href="https://www.amazon.fr">
          Découvre plus d'idées cadeaux ici
        </a>
      </p>
      <hr style="margin:20px 0;">
      <p style="font-size:12px; color:#777;">
        Merci de participer à notre Secret Santa.<br>
        Secret Santa Réveillon 31/12/2025 chez Boris et Dolores.<br>
        © copyright Konoha
      </p>
    </div>
    `;

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
