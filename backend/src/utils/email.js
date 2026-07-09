// backend/src/utils/email.js
const nodemailer = require('nodemailer');

const FROM = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const BRAND_NAME   = process.env.EMAIL_BRAND_NAME   || 'CuppaPlace';
const BRAND_COLOR  = process.env.EMAIL_BRAND_COLOR  || '#2b210a';  // primary (sesuaikan brand-mu)
const BRAND_ACCENT = process.env.EMAIL_BRAND_ACCENT || '#f5efe2';  // aksen lembut
const LOGO_URL     = process.env.EMAIL_LOGO_URL     || '';         // https://... (opsional)
const APP_URL      = process.env.APP_URL            || '';         // https://... (opsional)
const SUPPORT_EMAIL= process.env.SUPPORT_EMAIL      || FROM;

function buildTransport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[email] EMAIL_USER / EMAIL_PASS not set — email disabled (mock mode)');
    return null; 
  }

  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined;
  const secure = String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true';

  if (host && port) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      connectionTimeout: 10_000,
      socketTimeout: 10_000,
    });
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    pool: true,
    connectionTimeout: 10_000,
    socketTimeout: 10_000,
  });
}

async function sendMail({ to, subject, html, text }) {
  const tx = buildTransport();
  if (!tx) {
    console.log('[email:mock]', { to, subject, text, html: '[...html omitted...]' });
    return { mocked: true };
  }

  const info = await tx.sendMail({
    from: FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
    priority: 'high',
  });
  return info;
}

function baseTemplate({ preheader = '', title = '', bodyHtml = '' }) {
  const safePreheader = (preheader || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = (title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
    /* Beberapa klien (Gmail web) dukung dark mode prefers-color-scheme */
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background: #0b0e14 !important; }
      .card { background: #11151c !important; color: #e0e6ef !important; }
      .muted { color: #98a2b3 !important; }
      .code { background: #1b2230 !important; color: #e0e6ef !important; border-color: #2a3346 !important; }
      .btn { background: ${BRAND_COLOR} !important; color: #fff !important; }
    }
    /* Mobile tweaks */
    @media screen and (max-width: 640px) {
      .container { width: 100% !important; }
      .px { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f7fb" class="email-bg">
  <!-- Preheader (hidden) -->
  <div style="display:none;opacity:0;visibility:hidden;mso-hide:all;overflow:hidden;height:0;max-height:0;">
    ${safePreheader}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f7fb;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" class="container" style="width:640px;max-width:100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 12px 12px 8px;">
              ${LOGO_URL ? `
                <img src="${LOGO_URL}" alt="${BRAND_NAME}" width="56" height="56" style="display:block;border:0;outline:none;text-decoration:none;border-radius:12px;">
              ` : `
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:${BRAND_COLOR};letter-spacing:0.2px;">
                  ${BRAND_NAME}
                </div>
              `}
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="padding: 8px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" class="card" style="background:#ffffff;border-radius:14px;border:1px solid #e6e8ee;box-shadow:0 6px 24px rgba(16,24,40,0.06);">
                <tr>
                  <td class="px" style="padding:28px 32px 24px;">
                    <div style="font-family:Arial,Helvetica,sans-serif;">
                      <h1 style="margin:0 0 6px;font-size:20px;line-height:28px;color:#111827;font-weight:700;">
                        ${safeTitle}
                      </h1>
                      <p class="muted" style="margin:0 0 18px;font-size:14px;line-height:22px;color:#667085;">
                        Demi keamanan akun Anda, jangan pernah membagikan kode ini kepada siapa pun.
                      </p>

                      ${bodyHtml}

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:20px;">
                        <tr>
                          <td class="muted" style="font-size:12px;line-height:20px;color:#98a2b3;">
                            Email ini dikirim otomatis. Bila Anda tidak meminta kode, abaikan email ini.
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 14px 8px 0;">
              <div class="muted" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#98a2b3;">
                © ${new Date().getFullYear()} ${BRAND_NAME}${APP_URL ? ` • <a href="${APP_URL}" style="color:#98a2b3;text-decoration:none;">${APP_URL.replace(/^https?:\/\//,'')}</a>` : ''}${SUPPORT_EMAIL ? ` • <a href="mailto:${SUPPORT_EMAIL}" style="color:#98a2b3;text-decoration:none;">Bantuan</a>` : ''}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
function otpTemplate(code) {
  const preheader = `Kode OTP Anda adalah ${code}. Berlaku 10 menit.`;
  const title = 'Kode Verifikasi Anda';

  const bodyHtml = `
    <!-- Badge / Label -->
    <div style="display:inline-block;padding:6px 10px;background:${BRAND_ACCENT};color:${BRAND_COLOR};border-radius:999px;font-weight:600;font-size:12px;margin-bottom:12px;">
      Verifikasi Akun
    </div>

    <!-- Kode -->
    <div class="code"
         style="margin:12px 0 8px;padding:16px 18px;border:1px solid #e6e8ee;border-radius:12px;background:#fafbff;letter-spacing:6px;font-size:28px;line-height:36px;font-weight:800;text-align:center;color:#111827;">
      ${String(code).replace(/[^0-9]/g,'').padEnd(6,'•')}
    </div>

    <div class="muted" style="margin:4px 0 14px;font-size:13px;line-height:20px;color:#667085;">
      Masukkan kode di atas pada halaman verifikasi. Kode berlaku selama <b>10 menit</b>.
    </div>

    ${APP_URL ? `
      <!-- CTA -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 12px 0 0;">
        <tr>
          <td align="center">
            <a class="btn"
               href="${APP_URL}"
               style="display:inline-block;background:${BRAND_COLOR};color:#ffffff !important;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700;font-family:Arial,Helvetica,sans-serif;font-size:14px;">
              Buka ${BRAND_NAME}
            </a>
          </td>
        </tr>
      </table>
    ` : ''}

    <!-- Tips -->
    <ul style="margin:16px 0 0;padding-left:18px;font-size:12.5px;line-height:20px;color:#667085;">
      <li>Jangan bagikan kode ini ke siapa pun, termasuk pihak yang mengaku dari ${BRAND_NAME}.</li>
      <li>Bila kode sudah kedaluwarsa, Anda dapat meminta kode baru dari aplikasi.</li>
      ${SUPPORT_EMAIL ? `<li>Butuh bantuan? Hubungi <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};text-decoration:none;">${SUPPORT_EMAIL}</a></li>` : ''}
    </ul>
  `;

  const html = baseTemplate({ preheader, title, bodyHtml });
  const text =
    `Kode Verifikasi ${BRAND_NAME}\n\n` +
    `Kode OTP Anda: ${code}\n` +
    `Berlaku 10 menit. Jangan bagikan kepada siapa pun.\n` +
    (APP_URL ? `Buka ${BRAND_NAME}: ${APP_URL}\n` : '') +
    (SUPPORT_EMAIL ? `Bantuan: ${SUPPORT_EMAIL}\n` : '');

  return { subject: `Kode Verifikasi (OTP) ${BRAND_NAME}`, text, html };
}

module.exports = { sendMail, otpTemplate };
