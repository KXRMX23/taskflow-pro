import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    duration: 3000,
    style: {
      background: "#1f2937",
      color: "#fff",
      borderRadius: "12px",
    },
    success: {
      iconTheme: {
        primary: "#10b981",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    },
  }}
/>
    <App />
  </BrowserRouter>
);