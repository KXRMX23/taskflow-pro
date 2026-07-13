import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ArchivedTasks from "./pages/ArchivedTasks";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    <Toaster position="top-right" />

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/archived" element={<ArchivedTasks />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    </>
  );
}

export default App;