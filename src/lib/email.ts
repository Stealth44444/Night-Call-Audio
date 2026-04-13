import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendDownloadEmail(options: {
  to: string
  orderNumber: string
  downloadUrl: string
  expiresAt: Date
}) {
  const { to, orderNumber, downloadUrl, expiresAt } = options

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Order #${orderNumber} - Download Link`,
    html: `
      <h2>Order Complete!</h2>
      <p>Order Number: <strong>#${orderNumber}</strong></p>
      <p>Thank you! You can download your files using the link below.</p>

      <p style="margin: 30px 0;">
        <a href="${downloadUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">Download File</a>
      </p>

      <p style="color: #666; font-size: 12px;">
        This download link is valid until ${expiresAt.toLocaleString()}.
      </p>
    `,
  })
}
