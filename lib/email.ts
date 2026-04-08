import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "5point1nexus@gmail.com",
    pass: "zbcjgxzbbpsinnzx",
  },
})

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@nexuspod.com"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { error: "Failed to send email" }
  }
}

const emailTemplate = (title: string, message: string, actionText: string | null, actionUrl: string | null, userName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      padding: 40px 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .message {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .highlight {
      background-color: #f3f4f6;
      border-left: 4px solid #8b5cf6;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .highlight-text {
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .button:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px 40px;
      text-align: center;
    }
    .footer p {
      color: #9ca3af;
      font-size: 14px;
      margin: 0;
    }
    .footer .brand {
      color: #8b5cf6;
      font-weight: 700;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p class="greeting">Hey ${userName},</p>
      <div class="message">
        ${message}
      </div>
      ${actionUrl ? `<a href="${actionUrl}" class="button">${actionText || 'View Details'}</a>` : ''}
      <div class="divider"></div>
      <p class="message" style="font-size: 14px; color: #9ca3af;">
        You're receiving this because you're a member of this project on Nexus Pod. 
        To manage your notification preferences, visit your profile settings.
      </p>
    </div>
    <div class="footer">
      <p>Powered by <span class="brand">Nexus Pod</span></p>
      <p style="margin-top: 8px; font-size: 12px;">© 2026 Nexus Pod. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

export async function sendNotificationEmail({
  to,
  userName,
  type,
  title,
  message,
  actionUrl,
}: {
  to: string
  userName: string
  type: string
  title: string
  message: string
  actionUrl?: string
}) {
  const actionText = "View in Nexus Pod"
  
  const html = emailTemplate(title, message, actionText, actionUrl || null, userName)
  
  return sendEmail({
    to,
    subject: `[Nexus Pod] ${title}`,
    html,
  })
}
