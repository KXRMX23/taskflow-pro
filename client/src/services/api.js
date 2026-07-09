import axios from "axios";

const API = axios.create({
  baseURL: 
  import.meta.env.VITE_API_URL + "/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const uploadProfileImage = (formData) => {
  return API.put("/users/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default API;