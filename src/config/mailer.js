const nodemailer = require("nodemailer");

// nodemailer → creates connection to Gmail SMTP server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── SEND OTP EMAIL ─────────────────────────────────────────────
const sendOTPEmail = async (toEmail, otpCode, context = "login") => {
  // ← add context param

  const subject =
    context === "signup"
      ? "Verify Your Email — Dreamers Softtech Admin"
      : "Your Login OTP — Dreamers Softtech Admin"; // ← dynamic subject

  const heading = context === "signup" ? "Verify Your Email" : "Your Login OTP"; // ← dynamic heading

  const mailOptions = {
    from: `"Dreamers Softtech" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject, // ← use dynamic subject
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        
        <div style="margin-bottom: 24px;">
          <h2 style="color: #C89A3D; margin: 0; font-size: 22px;">Dreamers Softtech</h2>
          <p style="color: #888; font-size: 13px; margin: 4px 0 0;">${heading}</p>  
        </div>

        <p style="color: #333; font-size: 15px;">Your OTP code is:</p>

        <div style="background: #f9f5ee; border: 2px dashed #C89A3D; border-radius: 10px; padding: 24px; text-align: center; margin: 20px 0;">
          <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #C89A3D;">
            ${otpCode}
          </span>
        </div>

        <p style="color: #888; font-size: 13px;">⏱ This code expires in <strong>5 minutes</strong>.</p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, please ignore this email.</p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
          <p style="color: #ccc; font-size: 12px; margin: 0;">Sent from Dreamers Softtech Admin Panel</p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ── SEND APPROVAL EMAIL ────────────────────────────────────────
const sendApprovalEmail = async (toEmail, name) => {
  await transporter.sendMail({
    from: `"Dreamers Softtech" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "🎉 Admin Access Approved — Dreamers Softtech",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        
        <div style="margin-bottom: 24px;">
          <h2 style="color: #C89A3D; margin: 0; font-size: 22px;">Dreamers Softtech</h2>
          <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Admin Panel Access</p>
        </div>

        <p style="color: #333; font-size: 15px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #333; font-size: 15px;">
          Your admin access request has been <strong style="color: #16a34a;">approved ✅</strong>. 
          You can now log in to the Dreamers Softtech Admin Panel.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
          <p style="color: #ccc; font-size: 12px; margin: 0;">Sent from Dreamers Softtech Admin Panel</p>
        </div>

      </div>
    `,
  });
};

// ── SEND REJECTION EMAIL ───────────────────────────────────────
const sendRejectionEmail = async (toEmail, name) => {
  await transporter.sendMail({
    from: `"Dreamers Softtech" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Admin Access Request Update — Dreamers Softtech",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        
        <div style="margin-bottom: 24px;">
          <h2 style="color: #C89A3D; margin: 0; font-size: 22px;">Dreamers Softtech</h2>
          <p style="color: #888; font-size: 13px; margin: 4px 0 0;">Admin Panel Access</p>
        </div>

        <p style="color: #333; font-size: 15px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #333; font-size: 15px;">
          Unfortunately your admin access request has been <strong style="color: #dc2626;">rejected ❌</strong>. 
          Please contact the administrator if you think this is a mistake.
        </p>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
          <p style="color: #ccc; font-size: 12px; margin: 0;">Sent from Dreamers Softtech Admin Panel</p>
        </div>

      </div>
    `,
  });
};

// ── SEND QUOTE NOTIFICATION ────────────────────────────────────
const sendQuoteNotification = async (quoteData) => {
  const { name, email, phone, company, projectType, budgetRange, timeline, description } = quoteData;

  await transporter.sendMail({
    from: `"Dreamers Softtech" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER, // sends to self/admin
    subject: `🚀 New Quote Request: ${projectType}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        
        <div style="margin-bottom: 24px;">
          <h2 style="color: #C89A3D; margin: 0; font-size: 22px;">Dreamers Softtech</h2>
          <p style="color: #888; font-size: 13px; margin: 4px 0 0;">New Quote Request Notification</p>
        </div>

        <div style="background: #f9f5ee; padding: 20px; border-radius: 10px; border-left: 4px solid #C89A3D; margin-bottom: 24px;">
           <h3 style="margin: 0 0 10px; font-size: 18px; color: #333;">${projectType}</h3>
           <p style="margin: 0; color: #666; font-size: 14px;">From: <strong>${name}</strong> (${email})</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 140px;">Company:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;"><strong>${company || "N/A"}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Phone:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;"><strong>${phone || "N/A"}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Budget:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;"><strong>${budgetRange}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">Timeline:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;"><strong>${timeline}</strong></td>
          </tr>
        </table>

        <div style="margin-bottom: 24px;">
          <h4 style="margin: 0 0 10px; font-size: 14px; color: #888; text-transform: uppercase;">Description:</h4>
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${description}</p>
        </div>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee;">
          <p style="color: #ccc; font-size: 12px; margin: 0;">Sent from Dreamers Softtech Admin Panel</p>
        </div>

      </div>
    `,
  });
};

module.exports = { sendOTPEmail, sendApprovalEmail, sendRejectionEmail, sendQuoteNotification };
