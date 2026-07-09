import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

   const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await API.post("/auth/login", formData);

    localStorage.setItem("token", response.data.token);

    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

    return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">

  <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
    Welcome Back
  </h2>

  <p className="text-center text-gray-500 mb-8">
    Sign in to continue to TaskFlow Pro
  </p>  

      {error && (
  <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-5 text-center">
    {error}
  </p>
)}

      <form onSubmit={handleSubmit} className="space-y-4">

      <input
  type="email"
  name="email"
  placeholder="Email Address"
  value={formData.email}
  onChange={handleChange}
  className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none transition"
/>

  <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
    className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none transition pr-12"
  />

  
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

<div className="flex items-center justify-between mt-4 mb-6">
  <label className="flex items-center gap-2 text-sm text-gray-600">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={() => setRememberMe(!rememberMe)}
      className="w-4 h-4 accent-blue-600"
    />
    Remember Me
  </label>
</div>



<button
  type="submit"
  disabled={loading}
  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
>
  {loading ? "Logging in..." : "Login"}
</button>

<p className="text-center text-sm mt-6 text-gray-600">
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/register")}
    className="text-blue-600 hover:underline cursor-pointer font-semibold"
  >
    Register
  </span>
</p>

      </form>
    </div>
    </div>
  );
}

export default Login;