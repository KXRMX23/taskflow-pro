import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
const navigate = useNavigate();
const [countdown, setCountdown] = useState(5);

useEffect(() => {
const countdownInterval = setInterval(() => {
setCountdown((prev) => prev - 1);
}, 1000);

const redirectTimer = setTimeout(() => {
navigate("/login");
}, 5000);

return () => {
clearInterval(countdownInterval);
clearTimeout(redirectTimer);
};
}, [navigate]);



return (
<div
style={{
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background: "linear-gradient(to right, #4f46e5, #7c3aed)",
}}
>
<div
style={{
background: "#fff",
padding: "40px",
borderRadius: "12px",
textAlign: "center",
width: "400px",
boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
}}
>
<h1 style={{ color: "#16a34a", fontSize: "48px" }}>✅</h1>

<h2>Email Verified Successfully!</h2>

<p>
Your account has been verified.
<br />
You can now log in to TaskFlow Pro.
</p>

<button
onClick={() => navigate("/login")}
style={{
marginTop: "20px",
padding: "12px 24px",
border: "none",
borderRadius: "8px",
background: "#4f46e5",
color: "white",
cursor: "pointer",
fontSize: "16px",
}}
>
Go to Login
</button>

<p style={{ marginTop: "20px", color: "#666" }}>
Redirecting to Login in <strong>{countdown}</strong> second{countdown !== 1 ? "s" : ""}...
</p>
</div>
</div>
);
};

export default EmailVerified;
