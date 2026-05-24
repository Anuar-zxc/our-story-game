import nodemailer from "nodemailer";

type SendCodeResult = {
  sent: boolean;
  reason?: string;
};

function getMailConfig() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM ?? gmailUser ?? smtpUser;

  if (gmailUser && gmailPass) {
    return {
      from,
      transport: {
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      },
    };
  }

  if (smtpHost && smtpUser && smtpPass) {
    return {
      from,
      transport: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      },
    };
  }

  return null;
}

export async function sendVerificationCode(email: string, code: string, language = "ru"): Promise<SendCodeResult> {
  const config = getMailConfig();
  if (!config?.from) {
    console.info(`Email is not configured. Verification code for ${email}: ${code}`);
    return { sent: false, reason: "Email transport is not configured" };
  }

  const transporter = nodemailer.createTransport(config.transport);
  const ru = language === "ru";

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: ru ? "Код для Our Story" : "Your Our Story code",
    text: ru
      ? `Твой код подтверждения Our Story: ${code}\n\nОн действует 10 минут.`
      : `Your Our Story verification code: ${code}\n\nIt expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#2c2010">
        <h1 style="margin:0 0 12px">Our Story</h1>
        <p>${ru ? "Твой код подтверждения:" : "Your verification code:"}</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#fff1d4;border-radius:16px;padding:16px 20px;display:inline-block">${code}</div>
        <p style="color:#6f5136">${ru ? "Код действует 10 минут." : "The code expires in 10 minutes."}</p>
      </div>
    `,
  });

  return { sent: true };
}
