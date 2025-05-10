const nodemailer = require("nodemailer");

const sendPasswordResetEmail = async (to, resetLink) => {
  try {
    if (!to || !resetLink) {
      console.error("❌ Missing email or reset link for sending email.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables for your email account
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"LocalArtisans" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🔒 Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #4CAF50;">Password Reset Request</h2>
          <p>We received a request to reset your password. If you did not request this, please ignore this email.</p>
          <p>To reset your password, click the link below:</p>
          <p><a href="${resetLink}" target="_blank" style="color: #007bff;">Reset Password</a></p>
          <p>The link will expire in 1 hour.</p>
          <p>Warm Regards, <br> LocalArtisans Team 🎨</p>
        </div>
      `,
    };

    console.log("📨 Sending password reset email to:", to);
    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);
  }
};

module.exports = sendPasswordResetEmail;
