import nodemailer from 'nodemailer'

const LOGO_URL = `${process.env.FRONTEND_URL}/nca_logo.png`

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,       // port 587 uses STARTTLS, not SSL
  requireTLS: true,    // force STARTTLS upgrade
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Night Call Audio</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" rel="stylesheet" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
    .syne { font-family: 'Syne', Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0a0a0a">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="${LOGO_URL}" alt="Night Call Audio" width="36" height="36"
                      style="display:inline-block;vertical-align:middle;margin-right:10px;" />
                    <span class="syne" style="font-family:'Syne',Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:#c8962e;vertical-align:middle;">
                      NIGHT CALL AUDIO
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td bgcolor="#141414" style="border-radius:16px;border:1px solid #252525;overflow:hidden;">
              <!-- Accent top line -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td height="1" bgcolor="#c8962e" style="font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;padding-bottom:8px;">
              <p style="margin:0 0 6px;font-size:11px;color:#444444;text-align:center;letter-spacing:0.05em;">
                © Night Call Audio · All rights reserved
              </p>
              <p style="margin:0;font-size:11px;color:#333333;text-align:center;letter-spacing:0.05em;">
                문의: ${escapeHtml(process.env.SMTP_FROM ?? '')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Divider ──────────────────────────────────────────────────────────────────
const divider = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr><td height="1" bgcolor="#252525" style="font-size:0;line-height:0;">&nbsp;</td></tr>
</table>`

// ─── Row in info table ────────────────────────────────────────────────────────
function infoRow(label: string, value: string, accent = false): string {
  return `
<tr>
  <td style="padding:10px 0;border-bottom:1px solid #1e1e1e;width:110px;vertical-align:top;">
    <span style="font-size:10px;color:#555555;letter-spacing:0.12em;text-transform:uppercase;">${label}</span>
  </td>
  <td style="padding:10px 0 10px 16px;border-bottom:1px solid #1e1e1e;vertical-align:top;">
    <span style="font-size:13px;font-weight:600;color:${accent ? '#c8962e' : '#e8e8e8'};">${value}</span>
  </td>
</tr>`
}

// ─── Notice row ───────────────────────────────────────────────────────────────
function noticeRow(text: string): string {
  return `
<tr>
  <td style="padding:6px 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="width:14px;vertical-align:top;padding-top:1px;">
          <span style="font-size:11px;color:#444444;">—</span>
        </td>
        <td style="padding-left:6px;">
          <span style="font-size:11px;color:#555555;line-height:1.6;">${text}</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function ctaButton(href: string, label: string): string {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
  <tr>
    <td bgcolor="#c8962e" style="border-radius:10px;">
      <a href="${href}" target="_blank"
        style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:700;color:#0a0a0a;text-decoration:none;letter-spacing:0.12em;text-transform:uppercase;">
        ${label}
      </a>
    </td>
  </tr>
</table>`
}

// ─── sendDownloadEmail ────────────────────────────────────────────────────────
export async function sendDownloadEmail(options: {
  to: string
  orderNumber: string
  productName?: string
  downloadUrl: string
  expiresAt: Date
}) {
  const { to, orderNumber, productName, downloadUrl, expiresAt } = options

  const expiresStr = expiresAt.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#555555;">
      Download Ready
    </p>
    <h1 class="syne" style="font-family:'Syne',Arial,sans-serif;margin:0 0 10px;font-size:26px;font-weight:800;color:#f0f0f0;letter-spacing:-0.02em;line-height:1.2;">
      파일이 준비됐습니다
    </h1>
    <p style="margin:0 0 4px;font-size:13px;color:#888888;line-height:1.6;">
      구매해 주셔서 진심으로 감사드립니다.<br/>
      Night Call Audio와 함께하는 당신의 음악 여정을 응원합니다.
    </p>

    ${divider}

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${productName ? infoRow('상품', escapeHtml(productName)) : ''}
      ${infoRow('주문 번호', escapeHtml(orderNumber.slice(0, 8).toUpperCase()))}
      ${infoRow('다운로드 만료', expiresStr, true)}
    </table>

    ${divider}

    <p style="margin:0 0 20px;font-size:13px;color:#999999;line-height:1.75;">
      아래 버튼을 눌러 <strong style="color:#e8e8e8;">PC 또는 노트북</strong>에서 파일을 다운로드하세요.<br/>
      링크는 <strong style="color:#c8962e;">${expiresStr}</strong>까지 유효합니다.
    </p>

    ${ctaButton(escapeHtml(downloadUrl), '파일 다운로드')}

    <p style="margin:20px 0 0;font-size:11px;color:#444444;line-height:1.6;">
      버튼이 작동하지 않으면 아래 URL을 브라우저에 직접 붙여넣으세요.<br/>
      <span style="color:#555555;word-break:break-all;">${escapeHtml(downloadUrl)}</span>
    </p>

    ${divider}

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-bottom:10px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#444444;">구매 안내</span>
        </td>
      </tr>
      ${noticeRow('다운로드 링크는 구매일로부터 <strong style="color:#888888;">7일간 유효</strong>하며, 기간 내 횟수 제한 없이 다운로드 가능합니다.')}
      ${noticeRow('디지털 파일 특성상 <strong style="color:#888888;">다운로드 완료 후 환불이 불가</strong>합니다.')}
      ${noticeRow('구매한 파일은 개인 창작물에만 사용 가능하며, 재배포·재판매는 금지됩니다.')}
      ${noticeRow('링크 만료 후 재발급이 필요하시면 이 이메일로 회신해 주세요.')}
    </table>
  `

  return transporter.sendMail({
    from: `Night Call Audio <${process.env.SMTP_FROM}>`,
    to,
    subject: `다운로드 파일이 준비됐습니다${productName ? ` — ${productName}` : ''} | Night Call Audio`,
    html: emailWrapper(content),
  })
}

// ─── sendAdminNotificationEmail ───────────────────────────────────────────────
export async function sendAdminNotificationEmail(options: {
  adminEmail: string
  customerEmail: string
  products: string[]
  totalPrice: number
  paymentMethod: 'bank_transfer' | 'kakao_pay' | 'toss'
  orderedAt: string
}) {
  const { adminEmail, customerEmail, products, totalPrice, paymentMethod, orderedAt } = options

  const methodLabel =
    paymentMethod === 'bank_transfer' ? '무통장입금' :
    paymentMethod === 'kakao_pay' ? '카카오페이' : '토스'

  const orderedAtStr = new Date(orderedAt).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const productList = products
    .map(p => `<li style="margin:4px 0;font-size:13px;color:#cccccc;">${escapeHtml(p)}</li>`)
    .join('')

  const approveUrl = `${process.env.FRONTEND_URL}/admin/orders`

  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#555555;">
      New Order
    </p>
    <h1 class="syne" style="font-family:'Syne',Arial,sans-serif;margin:0 0 24px;font-size:26px;font-weight:800;color:#f0f0f0;letter-spacing:-0.02em;line-height:1.2;">
      새 주문이 접수됐습니다
    </h1>

    ${divider}

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${infoRow('고객 이메일', escapeHtml(customerEmail))}
      ${infoRow('결제 수단', escapeHtml(methodLabel))}
      ${infoRow('주문 시각', orderedAtStr)}
      ${infoRow('결제 금액', `₩${totalPrice.toLocaleString('ko-KR')}`, true)}
    </table>

    ${divider}

    <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
      주문 상품
    </p>
    <ul style="margin:0;padding:0 0 0 16px;">
      ${productList}
    </ul>

    ${ctaButton(approveUrl, '주문 승인하러 가기')}
  `

  return transporter.sendMail({
    from: `Night Call Audio <${process.env.SMTP_FROM}>`,
    to: adminEmail,
    subject: `[NCA] 새 주문 — ${customerEmail} / ₩${totalPrice.toLocaleString('ko-KR')}`,
    html: emailWrapper(content),
  })
}
