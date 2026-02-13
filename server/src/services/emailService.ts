import nodemailer from "nodemailer";

// Configure for Mailpit (Standard Ports)
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025, // Mailpit SMTP port
  secure: false, // TLS requires secureConnection to be false
  auth: undefined, // Mailpit doesn't require auth by default
});

export const sendInviteEmail = async (email: string, inviteLink: string, freelancerName: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"ClientBridge" <no-reply@clientbridge.com>',
      to: email,
      subject: `You've been invited to join ClientBridge by ${freelancerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5;">Welcome to ClientBridge!</h2>
          <p><strong>${freelancerName}</strong> has invited you to collaborate on a project.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Accept Invitation</a>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">If you did not expect this invite, please ignore this email.</p>
        </div>
      `,
    });

    console.log("📧 Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

// 2. 👇 ADD THIS NEW FUNCTION (For Existing Users)
export const sendExistingUserNotification = async (email: string, freelancerName: string) => {
  try {
    await transporter.sendMail({
      from: '"ClientBridge" <no-reply@clientbridge.com>',
      to: email,
      subject: `New Connection: ${freelancerName} added you on ClientBridge`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4F46E5;">You have a new connection!</h2>
          <p><strong>${freelancerName}</strong> has added you to their client list.</p>
          <p>You can now log in to view any projects they assign to you.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Log In to Dashboard</a>
        </div>
      `,
    });
    console.log("📧 Notification email sent to existing user");
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};