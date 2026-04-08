import { NextResponse } from "next/server"
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

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; }
    .content { padding: 40px; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nexus Pod</h1>
    </div>
    <div class="content">
      <p>Hey ${name || "there"},</p>
      <p>This is a test email from Nexus Pod!</p>
      <p>If you're receiving this, the email system is working correctly.</p>
    </div>
  </div>
</body>
</html>
    `

    const info = await transporter.sendMail({
      from: "5point1nexus@gmail.com",
      to: email,
      subject: "Test Email - Nexus Pod",
      html: htmlContent,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Email sent",
      messageId: info.messageId 
    })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to send" 
    }, { status: 500 })
  }
}
