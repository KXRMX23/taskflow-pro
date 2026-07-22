import axios from "axios";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

function ResetPassword() {
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);

const { token } = useParams();
const navigate = useNavigate();
console.log(token);

const handleSubmit = async (e) => {
e.preventDefault();

try {
if (password !== confirmPassword) {
toast.error("Passwords do not match");
return;
}

const response = await axios.post(
`http://localhost:5000/api/auth/reset-password/${token}`,
{
password,
}
);

toast.success(response.data.message);

setTimeout(() => {
navigate("/login");
}, 1500);

} catch (error) {
console.log(error);

toast.error(
error.response?.data?.message || "Something went wrong"
);
}
};



return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
<div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

<h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
Reset Password
</h2>

<p className="text-center text-gray-500 mb-8">
Enter your new password
</p>

<form onSubmit={handleSubmit} className="space-y-4">

<div className="relative">
<input
type={showPassword ? "text" : "password"}
placeholder="New Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full p-4 pr-12 border rounded-xl border-gray-300 focus:ring-4 focus:ring-red-300"
/>

<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
>
{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
</button>
</div>

<div className="relative">
<input
type={showPassword ? "text" : "password"}
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
className="w-full p-4 pr-12 border rounded-xl border-gray-300 focus:ring-4 focus:ring-red-300"
/>

<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
>
{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
</button>
</div>

<div className="flex items-center gap-2">
<input
type="checkbox"
checked={showPassword}
onChange={() => setShowPassword(!showPassword)}
/>

<label className="text-sm text-gray-600 cursor-pointer">
Show Password
</label>
</div>


<button
className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold p-4 rounded-xl transition"
>
Reset Password
</button>

</form>

</div>
</div>
);
}

export default ResetPassword;
