import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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

  <input
  type="password"
  name="password"
  placeholder="Password"
  value={formData.password}
  onChange={handleChange}
  className="w-full p-4 border rounded-xl border-gray-300 focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none transition"
/>  


<button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition duration-300 shadow-lg hover:shadow-xl"
>
  Login
</button>

      </form>
    </div>
    </div>
  );
}

export default Login;