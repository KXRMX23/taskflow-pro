const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
},
});

const sendVerificationEmail = async (email, token) => {
const verificationLink = `http://localhost:5000/api/auth/verify-email/${token}`;

await transporter.sendMail({
from: process.env.EMAIL_USER,
to: email,
subject: "Verify your TaskFlow Pro account",
html: `
<h2>Welcome to TaskFlow Pro!</h2>

<p>Please verify your email by clicking the button below.</p>

<a href="${verificationLink}"
style="
background:#4f46e5;
color:white;
padding:12px 24px;
text-decoration:none;
border-radius:8px;
display:inline-block;
">
Verify Email
</a>

<p>If you didn't create this account, you can ignore this email.</p>
`,
});
};

const sendPasswordResetEmail = async (email, token) => {
const resetLink = `http://localhost:5173/reset-password/${token}`;

await transporter.sendMail({
from: process.env.EMAIL_USER,
to: email,
subject: "Reset your TaskFlow Pro password",
html: `
<h2>Password Reset Request</h2>

<p>We received a request to reset your password.</p>

<a href="${resetLink}"
style="
background:#ef4444;
color:white;
padding:12px 24px;
text-decoration:none;
border-radius:8px;
display:inline-block;">
Reset Password
</a>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this, you can safely ignore this email.</p>
`,
});
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, };
