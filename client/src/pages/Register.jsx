import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Eye, EyeOff } from "lucide-react";


function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
  const password = formData.password;

  if (password.length < 6)
    return {
      text: "Weak",
      color: "text-red-500",
    };

  if (password.length < 10)
    return {
      text: "Medium",
      color: "text-yellow-500",
    };

  return {
    text: "Strong",
    color: "text-green-600",
  };
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.email || !formData.password) {
    setError("Please fill in all fields.");
    return;
  }

  if (formData.password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setError("");
  setLoading(true);

  try {
    await API.post("/auth/register", formData);

    alert("🎉 Registration Successful! Please login.");

    navigate("/login");
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 p-6">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">

      <h1 className="text-5xl font-bold text-center mb-3">
        Create Account
      </h1>

      <p className="text-center text-gray-500 mb-8">
        Join TaskFlow Pro today
      </p>

      {error && (
        <p className="text-red-500 text-center mb-4">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

      <input
  type="text"
  name="name"
  placeholder="Full Name"
  value={formData.name}
  onChange={handleChange}
  className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none transition"
/>

<input
  type="email"
  name="email"
  placeholder="Email Address"
  value={formData.email}
  onChange={handleChange}
  className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none transition"
/>

<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
    className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none transition pr-12"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

{formData.password && (
  <p
    className={`text-sm font-semibold ${getPasswordStrength().color}`}
  >
    Password Strength: {getPasswordStrength().text}
  </p>
)}


<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 outline-none transition pr-12"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

<button
  type="submit"
  disabled={loading}
  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 rounded-xl shadow-lg transition duration-300"
>
  {loading ? "Creating Account..." : "Create Account"}
</button>

<p className="text-center text-sm text-gray-600 mt-4">
  Already have an account?{" "}
  <span
    onClick={() => navigate("/login")}
    className="text-blue-600 font-semibold cursor-pointer hover:underline"
  >
    Login
  </span>
</p>

      </form>

    </div>
  </div>
);
}

export default Register;