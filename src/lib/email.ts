import nodemailer from 'nodemailer'

const LOGO_URL = `${process.env.FRONTEND_URL}/nca_logo.png`

// ─── Color System ────────────────────────────────────────────────────────────
// Light Mode (Default)
const L_BG = '#ffffff'
const L_CARD = '#f7f7f7'
const L_LINE = '#eeeeee'
const L_TEXT = '#111111'
const L_MUTED = '#666666'

// Dark Mode
const D_BG = '#0a0a0a'
const D_CARD = '#141414'
const D_LINE = '#252525'
const D_TEXT = '#f0f0f0'
const D_MUTED = '#888888'

const ACCENT = '#c8962e'

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
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Shared layout wrapper
 * Gmail Dark Mode Compatibility:
 * 1. Gmail ignores <style> and @media on mobile, but does automatic color inversion.
 * 2. To control this, we provide explicit bgcolor handles for every table, tr, and td.
 * 3. We use !important inline styles for clients that support them.
 * 4. Default state is Light Mode (natural fallback for most clients).
 */
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap" rel="stylesheet" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap');
    .syne { font-family: 'Syne', Arial, sans-serif !important; }

    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: ${D_BG} !important; color: ${D_TEXT} !important; }
      .email-card { background-color: ${D_CARD} !important; border-color: ${D_LINE} !important; }
      .email-line { background-color: ${D_LINE} !important; }
      .text-primary { color: ${D_TEXT} !important; }
      .text-secondary { color: ${D_MUTED} !important; }
      .text-muted { color: #444444 !important; }
      .divider-td { background-color: ${D_LINE} !important; }
      .logo-text { color: ${ACCENT} !important; }
      .logo-img { filter: invert(0) !important; }
    }

    /* Target specific clients that support data-ogsc/data-ogsb for dark mode */
    [data-ogsc] .text-primary { color: ${D_TEXT} !important; }
    [data-ogsc] .logo-text { color: ${ACCENT} !important; }
    [data-ogsb] .email-bg { background-color: ${D_BG} !important; }
    [data-ogsb] .email-card { background-color: ${D_CARD} !important; }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:${L_BG};color:${L_TEXT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_BG}" class="email-bg" style="background-color:${L_BG};">
    <tr bgcolor="${L_BG}" class="email-bg">
      <td align="center" bgcolor="${L_BG}" class="email-bg" style="padding:40px 16px;background-color:${L_BG};">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_BG}" class="email-bg" style="max-width:560px;width:100%;background-color:${L_BG};">

          <!-- Header -->
          <tr bgcolor="${L_BG}" class="email-bg">
            <td bgcolor="${L_BG}" class="email-bg" style="padding-bottom:32px;background-color:${L_BG};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_BG}" class="email-bg" style="background-color:${L_BG};">
                <tr bgcolor="${L_BG}" class="email-bg">
                  <td bgcolor="${L_BG}" class="email-bg" valign="middle" style="background-color:${L_BG};">
                    <img src="${LOGO_URL}" alt="Night Call Audio" width="36" height="36" class="logo-img"
                      style="display:inline-block;vertical-align:middle;margin-right:10px;filter:invert(1);" />
                    <span class="syne logo-text" style="font-family:'Syne',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#000000;vertical-align:middle;">
                      NIGHT CALL AUDIO
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card Wrapper -->
          <tr bgcolor="${L_BG}" class="email-bg">
            <td bgcolor="${L_CARD}" class="email-card" style="border-radius:16px;border:1px solid ${L_LINE};background-color:${L_CARD};overflow:hidden;">

              <!-- Accent top line -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${ACCENT}" style="background-color:${ACCENT};">
                <tr bgcolor="${ACCENT}">
                  <td height="3" bgcolor="${ACCENT}" style="font-size:0;line-height:0;background-color:${ACCENT};">&nbsp;</td>
                </tr>
              </table>

              <!-- Main Content Area -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_CARD}" class="email-card" style="background-color:${L_CARD};">
                <tr bgcolor="${L_CARD}" class="email-card">
                  <td bgcolor="${L_CARD}" class="email-card" style="padding:36px 40px;background-color:${L_CARD};">
                    ${content}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr bgcolor="${L_BG}" class="email-bg">
            <td bgcolor="${L_BG}" class="email-bg" style="padding-top:28px;padding-bottom:8px;background-color:${L_BG};">
              <p class="text-muted" style="margin:0 0 6px;font-size:11px;color:#999999;text-align:center;letter-spacing:0.05em;">
                © Night Call Audio · All rights reserved
              </p>
              <p class="text-muted" style="margin:0;font-size:11px;color:#888888;text-align:center;letter-spacing:0.05em;">
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

// ─── Divider component ────────────────────────────────────────────────────────
const divider = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_CARD}" class="email-card" style="margin:24px 0;background-color:${L_CARD};">
  <tr bgcolor="${L_CARD}" class="email-card">
    <td height="1" bgcolor="${L_LINE}" class="email-line divider-td" style="font-size:0;line-height:0;background-color:${L_LINE};">&nbsp;</td>
  </tr>
</table>`

// ─── Info Row component ───────────────────────────────────────────────────────
function infoRow(label: string, value: string, accent = false): string {
  return `
<tr bgcolor="${L_CARD}" class="email-card">
  <td bgcolor="${L_CARD}" class="email-card" style="padding:10px 0;border-bottom:1px solid ${L_LINE};width:110px;vertical-align:top;background-color:${L_CARD};">
    <span class="text-secondary" style="font-size:10px;color:${L_MUTED};letter-spacing:0.12em;text-transform:uppercase;">${label}</span>
  </td>
  <td bgcolor="${L_CARD}" class="email-card" style="padding:10px 0 10px 16px;border-bottom:1px solid ${L_LINE};vertical-align:top;background-color:${L_CARD};">
    <span class="text-primary" style="font-size:13px;font-weight:600;color:${accent ? ACCENT : L_TEXT};">${value}</span>
  </td>
</tr>`
}

// ─── Notice Row component ─────────────────────────────────────────────────────
function noticeRow(text: string): string {
  return `
<tr bgcolor="${L_CARD}" class="email-card">
  <td bgcolor="${L_CARD}" class="email-card" style="padding:6px 0;background-color:${L_CARD};">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${L_CARD}" class="email-card" style="background-color:${L_CARD};">
      <tr bgcolor="${L_CARD}" class="email-card">
        <td bgcolor="${L_CARD}" class="email-card" style="width:14px;vertical-align:top;padding-top:1px;background-color:${L_CARD};">
          <span class="text-secondary" style="font-size:11px;color:${L_MUTED};">—</span>
        </td>
        <td bgcolor="${L_CARD}" class="email-card" style="padding-left:6px;background-color:${L_CARD};">
          <span class="text-secondary" style="font-size:11px;color:${L_MUTED};line-height:1.6;">${text}</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

// ─── CTA Button component ─────────────────────────────────────────────────────
function ctaButton(href: string, label: string): string {
  return `
<table cellpadding="0" cellspacing="0" border="0" bgcolor="${L_CARD}" class="email-card" style="margin-top:28px;background-color:${L_CARD};">
  <tr bgcolor="${L_CARD}" class="email-card">
    <td bgcolor="${ACCENT}" style="border-radius:10px;background-color:${ACCENT};">
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
    <p class="text-secondary" style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${L_MUTED};">
      Download Ready
    </p>
    <h1 class="syne text-primary" style="font-family:'Syne',Arial,sans-serif;margin:0 0 10px;font-size:26px;font-weight:800;color:${L_TEXT};letter-spacing:-0.02em;line-height:1.2;">
      파일이 준비됐습니다
    </h1>
    <p class="text-secondary" style="margin:0 0 4px;font-size:13px;color:${L_MUTED};line-height:1.6;">
      구매해 주셔서 진심으로 감사드립니다.<br/>
      Night Call Audio와 함께하는 당신의 음악 여정을 응원합니다.
    </p>

    ${divider}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_CARD}" class="email-card" style="background-color:${L_CARD};">
      ${productName ? infoRow('상품', escapeHtml(productName)) : ''}
      ${infoRow('주문 번호', escapeHtml(orderNumber.slice(0, 8).toUpperCase()))}
      ${infoRow('다운로드 만료', expiresStr, true)}
    </table>

    ${divider}

    <p class="text-secondary" style="margin:0 0 20px;font-size:13px;color:${L_MUTED};line-height:1.75;">
      아래 버튼을 눌러 <strong class="text-primary" style="color:${L_TEXT};">PC 또는 노트북</strong>에서 파일을 다운로드하세요.<br/>
      링크는 <strong style="color:${ACCENT};">${expiresStr}</strong>까지 유효합니다.
    </p>

    ${ctaButton(escapeHtml(downloadUrl), '파일 다운로드')}

    <p class="text-muted" style="margin:20px 0 0;font-size:11px;color:#999999;line-height:1.6;">
      버튼이 작동하지 않으면 아래 URL을 브라우저에 직접 붙여넣으세요.<br/>
      <span style="color:#888888;word-break:break-all;">${escapeHtml(downloadUrl)}</span>
    </p>

    ${divider}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_CARD}" class="email-card" style="background-color:${L_CARD};">
      <tr bgcolor="${L_CARD}" class="email-card">
        <td bgcolor="${L_CARD}" class="email-card" style="padding-bottom:10px;background-color:${L_CARD};">
          <span class="text-secondary" style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${L_MUTED};">구매 안내</span>
        </td>
      </tr>
      ${noticeRow(`다운로드 링크는 구매일로부터 <strong class="text-primary" style="color:${L_TEXT};">7일간 유효</strong>하며, 기간 내 횟수 제한 없이 다운로드 가능합니다.`)}
      ${noticeRow(`디지털 파일 특성상 <strong class="text-primary" style="color:${L_TEXT};">다운로드 완료 후 환불이 불가</strong>합니다.`)}
      ${noticeRow(`구매한 파일은 개인 창작물에만 사용 가능하며, 재배포·재판매는 금지됩니다.`)}
      ${noticeRow(`링크 만료 후 재발급이 필요하시면 이 이메일로 회신해 주세요.`)}
    </table>
  `

  return transporter.sendMail({
    from: `Night Call Audio <${process.env.SMTP_FROM}>`,
    to,
    subject: `[Night Call Audio] 구매하신 ${productName ? `'${productName}' ` : ''}상품의 다운로드 링크가 준비되었습니다`,
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
    .map(p => `<li class="text-primary" style="margin:4px 0;font-size:13px;color:${L_TEXT};">${escapeHtml(p)}</li>`)
    .join('')

  const approveUrl = `${process.env.FRONTEND_URL}/admin/orders`

  const content = `
    <p class="text-secondary" style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${L_MUTED};">
      New Order
    </p>
    <h1 class="syne text-primary" style="font-family:'Syne',Arial,sans-serif;margin:0 0 24px;font-size:26px;font-weight:800;color:${L_TEXT};letter-spacing:-0.02em;line-height:1.2;">
      새 주문이 접수됐습니다
    </h1>

    ${divider}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${L_CARD}" class="email-card" style="background-color:${L_CARD};">
      ${infoRow('고객 이메일', escapeHtml(customerEmail))}
      ${infoRow('결제 수단', escapeHtml(methodLabel))}
      ${infoRow('주문 시각', orderedAtStr)}
      ${infoRow('결제 금액', `₩${totalPrice.toLocaleString('ko-KR')}`, true)}
    </table>

    ${divider}

    <p class="text-secondary" style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${L_MUTED};">
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
    subject: `[NCA 관리자] 신규 주문 알림 — ${customerEmail} (₩${totalPrice.toLocaleString('ko-KR')})`,
    html: emailWrapper(content),
  })
}
