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

module.exports = { sendVerificationEmail };
