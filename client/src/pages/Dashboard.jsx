import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import EmptyState from "../assets/empty-state.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";


import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import {
  Search,
  Moon,
  Sun,
  ClipboardList,
  Plus,
  LogOut,
} from "lucide-react"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"


function Dashboard() {
  const [tasks, setTasks] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);



  // FIX #2: was checking for "true" but we store "dark"/"light"
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // FIX #3: priority now capitalized to match <option value="..."> casing
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "Medium"
  });



  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const hour = new Date().getHours();

let greeting = "Good Evening";

if (hour < 12) {
  greeting = "Good Morning";
} else if (hour < 18) {
  greeting = "Good Afternoon";
}

const userName = localStorage.getItem("name") || "User";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length; 
 
  const chartData = [
  { name: "Pending", value: pendingCount },
  { name: "In Progress", value: inProgressCount },
  { name: "Completed", value: completedCount },
];

const COLORS = ["#FACC15", "#3B82F6", "#22C55E"];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
        case "oldest":
            return new Date(a.created_at) - new Date(b.created_at);

        case "az":
            return a.title.localeCompare(b.title);

        case "za":
            return b.title.localeCompare(a.title);

        case "newest":
        default:
            return new Date(b.created_at) - new Date(a.created_at);
    }
});

const pendingTasks = sortedTasks.filter((task) => task.status === "pending");
const inProgressTasks = sortedTasks.filter((task) => task.status === "in-progress");
const completedTasks = sortedTasks.filter((task) => task.status === "completed");

  useEffect(() => {

    const testAPI = async () => {
      try {
        const res = await API.get("/tasks");
        console.log(res.data);
        setTasks(res.data);
        setLoading(false);
      } catch (err) {
        console.log(err.response?.data || err.message);
        setLoading(false);
      }
    };

    testAPI();

  }, []);


  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    
  }, [darkMode]);
    
    const handleChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
  }

    const handleEditChange = (task) => {
      setEditingTaskId(task.id);

      setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
};

const toggleTheme = () => {
  setDarkMode((prev) => !prev);
};

    const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
        if (editingTaskId) {
    const response = await API.put(`/tasks/${editingTaskId}`, newTask);
    console.log(response.data);
    setTasks(
        tasks.map((task) =>
            task.id === editingTaskId ? response.data.task : task
        )
    );

    toast.success("Task updated successfully!");

    setEditingTaskId(null);
} else {
    const response = await API.post("/tasks", newTask);

    setTasks([...tasks, response.data.task]);
    toast.success("Task created successfully!");
}

setNewTask({
    title: "",
    description: "",
    status: "pending",
    priority: "Medium"
});

setSubmitting(false);

    } catch (err) {
        setSubmitting(false);
        toast.error("Something went wrong. Please try again.");
        console.log(err.response?.data || err.message);
    }
};   

  const deleteTask = async (id) => {
    try {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        setDeletingTaskId(id);

        await API.delete(`/tasks/${id}`);

        setTasks(tasks.filter((task) => task.id !== id));

        setDeletingTaskId(null);
    } catch (err) {
        setDeletingTaskId(null);
        console.log(err.response?.data || err.message);
    }
};

const onDragEnd = async (result) => {
  if (!result.destination) return;

  const { source, destination, draggableId } = result;

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  const newStatus = destination.droppableId;

  try {
    await API.put(`/tasks/${draggableId}`, {
      ...tasks.find(task => task.id === Number(draggableId)),
      status: newStatus,
    });

    setTasks(prev =>
      prev.map(task =>
        task.id === Number(draggableId)
          ? { ...task, status: newStatus }
          : task
      )
    );

    toast.success("Task moved successfully!");
  } catch (err) {
    toast.error("Failed to move task");
  }
};

if (loading) {
    return (
        <div
            className={`min-h-screen flex flex-col items-center justify-center transition-all duration-300 ${
                darkMode
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-900"
            }`}
        >
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>

            <h2 className="text-2xl font-bold mb-2">
                Loading your tasks...
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
                Please wait while we prepare your dashboard.
            </p>
        </div>
    );
}

return (
  <DragDropContext onDragEnd={onDragEnd}>
    <div className={`min-h-screen transition-all duration-300 ${
        darkMode
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-black"
    }`}>
      

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10">

   <div className="flex justify-between items-center mb-10">

  <div>
    <h1 className="text-5xl font-extrabold">
      {greeting}, {userName} 👋
    </h1>

    <p className="text-gray-500 dark:text-gray-400 mt-2">
      {today}
    </p>
  </div>

  <div className="flex items-center gap-4">

    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
      {userName.charAt(0).toUpperCase()}
    </div>

    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-300"
    >
      <LogOut size={20} />
      Logout
    </button>

  </div>

</div>
      
      <button
  onClick={toggleTheme}
  className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-300"
>
  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
  <span>
    {darkMode ? "Light Mode" : "Dark Mode"}
  </span>
</button>
        
    
     <div className="flex flex-col md:flex-row gap-4 mb-10">

    <input
  type="text"
  placeholder="🔍 Search tasks..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className={`flex-1 rounded-xl border px-6 py-3 shadow-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
    darkMode
      ? "bg-gray-800 text-white border-gray-700"
      : "bg-white border-gray-300"
  }`}
/>

    <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className={`rounded-xl border px-4 py-3 shadow-sm transition ${
  darkMode
    ? "bg-gray-800 text-white border-gray-700"
    : "bg-white border-gray-300"
}`}
        >
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="az">A-Z</option>
      <option value="za">Z-A</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className={`rounded-xl border px-4 py-3 shadow-sm transition ${
  darkMode
    ? "bg-gray-800 text-white border-gray-700"
    : "bg-white border-gray-300"
}`}
    >
    
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
    </select>

</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

  {/* FIX #4: "duration 300" -> "duration-300" (3 cards below) */}
    <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  
  whileHover={{
    y: -8,
    scale: 1.02,
  }}

  whileTap={{
    scale: 0.98,
  }}

  transition={{
    duration: 0.2,
  }}

  className="group bg-yellow-100 rounded-xl shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-yellow-200 cursor-pointer p-6"
  >
    <h2 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
        🟡 Pending
    </h2>

    <p className="text-5xl font-extrabold mt-3">
        {pendingCount}
    </p>

    <p className="text-sm text-gray-600 mt-2">
        Tasks waiting to be started
    </p>
</motion.div>

  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  
  whileHover={{
    y: -8,
    scale: 1.02,
  }}

  whileTap={{
    scale: 0.98,
  }}

  transition={{
    duration: 0.2,
  }}

  className="group bg-blue-100 rounded-xl shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-blue-200 cursor-pointer p-6"
>
    <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
        🔵 In Progress
    </h2>

    <p className="text-5xl font-extrabold mt-3">
        {inProgressCount}
    </p>

    <p className="text-sm text-gray-600 mt-2">
        Tasks currently being worked on
    </p>
</motion.div>

  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}

  whileHover={{
    y: -8,
    scale: 1.02,
  }}

  whileTap={{
    scale: 0.98,
  }}

  transition={{
    duration: 0.2,
  }}
  
  className="group bg-green-100 rounded-xl shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-green-200 cursor-pointer p-6"
>
    <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">
        🟢 Completed
    </h2>

    <p className="text-5xl font-extrabold mt-3">
        {completedCount}
    </p>

    <p className="text-sm text-gray-600 mt-2">
        Tasks that have been finished
    </p>
  </motion.div>

</div>

{/* Task Analytics */}
<div
  className={`p-6 rounded-2xl shadow-lg mb-10 ${
    darkMode ? "bg-gray-800" : "bg-white"
  }`}
>
  <h2 className="text-2xl font-bold mb-6">
    Task Analytics
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
        label
      >
        {chartData.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

<div className="flex justify-between items-center mb-6">
  <h2 className="text-3xl font-bold">
    Task Manager
  </h2>

  <button
    onClick={() => setShowForm(!showForm)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
  >
    <>
    <Plus size={20} />
    {showForm ? "Hide Form" : "Create Task"}
    </>
  </button>
</div>

<AnimatePresence>
  {showForm && (
   <motion.form
   initial={{ opacity: 0, y: 30 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5 }}
  onSubmit={handleSubmit}
  className={`w-full p-6 rounded-2xl shadow-lg mb-10 transition-all duration-300 ${
    darkMode
      ? "bg-gray-800"
      : "bg-white"
  }`}
>   

    <input
        type="text"
        name="title"
        placeholder="Task Title"
        value={newTask.title}
        onChange={handleChange}
        className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 ${
  darkMode
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-black border-gray-300"
}`}
    />

    <br /><br />

    <textarea
        name="description"
        placeholder="Task Description"
        value={newTask.description}
        onChange={handleChange}
        className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 ${
  darkMode
    ? "bg-gray-700 text-white border-gray-600 placeholder-gray-400"
    : "bg-white text-black border-gray-300"
}`}
    />
      
    <select
        name="status"
        value={newTask.status}
        onChange={handleChange}
        className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 ${
  darkMode
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-black border-gray-300"
}`}
    >
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>

    <select
  name="priority"
  value={newTask.priority}
  onChange={handleChange}
  className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600"
      : "bg-white text-black border-gray-300"
  }`}
>
  <option value="Low">🟢 Low Priority</option>
  <option value="Medium">🟡 Medium Priority</option>
  <option value="High">🔴 High Priority</option>
</select>

    <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
        {
    submitting
        ? "Saving..."
        : editingTaskId
            ? "Update Task"
            : "Save Task"}
            
    </motion.button>

    <hr/>

</motion.form>
  )}
</AnimatePresence>

     <div>
  {filteredTasks.length === 0 ? (
    /* FIX #6: empty state now respects dark mode */
    <div className={`rounded-xl shadow-lg p-10 text-center mt-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <img
        src={EmptyState}
        alt="No Tasks"
        className="w-72 mx-auto mb-6"
      />

      <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
        🔍 No Tasks Found
      </h2>

      <p className={`mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        Try another keyword or create a new task to get started!
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
      <h2 className="text-2xl font-bold mb-4 text-yellow-500">Pending</h2>
      <Droppable droppableId="pending">
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
    >

      {pendingTasks.map((task, index) => (
        <Draggable
        key={task.id}
  draggableId={task.id.toString()}
  index={index}
>
  {(provided) => (
    <motion.div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.08 }}
      
          className={`group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl ${
            darkMode
              ? "bg-gray-800 border-gray-700 hover:border-blue-500"
              : "bg-white border-gray-200 hover:border-blue-400"
          }`}
        >
          <h3
            className={`text-3xl font-bold tracking-tight mb-3 transition-all duration-300 group-hover:translate-x-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >

            <div
  className={`h-1.5 rounded-full mb-5 transition-all duration-500 ${
    task.status === "completed"
      ? "bg-green-500"
      : task.status === "in-progress"
      ? "bg-blue-500"
      : "bg-yellow-500"
  }`}
/>

            {task.title}
          </h3>

          <p
            className={`mb-5 leading-7 transition-all duration-300 group-hover:text-black ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {task.description}
          </p>

          <p
  className={`text-sm mb-4 ${
    darkMode ? "text-gray-400" : "text-gray-500"
  }`}
>
  📅 Created: {new Date(task.created_at).toLocaleDateString()}
</p>


          <p className="mb-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-110 shadow-sm ${
                task.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.status}
            </span>
          </p>

          <p className="mb-5">
  <span
    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
      task.priority === "High"
        ? "bg-red-100 text-red-700"
        : task.priority === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {task.priority === "High"
      ? "🔴 High Priority"
      : task.priority === "Medium"
      ? "🟡 Medium Priority"
      : "🟢 Low Priority"}
  </span>
</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => handleEditChange(task)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              disabled={deletingTaskId === task.id}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {deletingTaskId === task.id
                ? "🗑 Deleting..."
                : "🗑 Delete"}
            </button>
          </div>
        </motion.div>
            )}
          </Draggable>
      ))}

      {provided.placeholder}
    </div>
  )}
</Droppable>
</div>

<div>
  <h2 className="text-2xl font-bold mb-4 text-blue-500">In Progress</h2>

<Droppable droppableId="in-progress">
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
    >

      {inProgressTasks.map((task, index) => (
        <Draggable
        key={task.id}
  draggableId={task.id.toString()}
  index={index}
>
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      
          className={`group rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] p-6 mb-8 border transition-all duration-300 ease-out ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-3xl font-bold tracking-tight mb-3 transition-all duration-300 group-hover:translate-x-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >

            <div
  className={`h-1.5 rounded-full mb-5 transition-all duration-500 ${
    task.status === "completed"
      ? "bg-green-500"
      : task.status === "in-progress"
      ? "bg-blue-500"
      : "bg-yellow-500"
  }`}
/>

            {task.title}
          </h3>

          <p
            className={`mb-5 leading-7 transition-all duration-300 group-hover:text-black ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {task.description}
          </p>

          <p
  className={`text-sm mb-4 ${
    darkMode ? "text-gray-400" : "text-gray-500"
  }`}
>
  📅 Created: {new Date(task.created_at).toLocaleDateString()}
</p>


          <p className="mb-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-110 shadow-sm ${
                task.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.status}
            </span>
          </p>

          <p className="mb-5">
  <span
    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
      task.priority === "High"
        ? "bg-red-100 text-red-700"
        : task.priority === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {task.priority === "High"
      ? "🔴 High Priority"
      : task.priority === "Medium"
      ? "🟡 Medium Priority"
      : "🟢 Low Priority"}
  </span>
</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => handleEditChange(task)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              disabled={deletingTaskId === task.id}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {deletingTaskId === task.id
                ? "🗑 Deleting..."
                : "🗑 Delete"}
            </button>
          </div>
        </div>
            )}
          </Draggable>
      ))}

      {provided.placeholder}
    </div>
  )}
</Droppable>
</div>

<div>
  <h2 className="text-2xl font-bold mb-4 text-green-500">Completed</h2>

<Droppable droppableId="completed">
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
    >

      {completedTasks.map((task, index) => (
        <Draggable
        key={task.id}
  draggableId={task.id.toString()}
  index={index}
>
  {(provided) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      
          className={`group rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] p-6 mb-8 border transition-all duration-300 ease-out ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-3xl font-bold tracking-tight mb-3 transition-all duration-300 group-hover:translate-x-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >

            <div
  className={`h-1.5 rounded-full mb-5 transition-all duration-500 ${
    task.status === "completed"
      ? "bg-green-500"
      : task.status === "in-progress"
      ? "bg-blue-500"
      : "bg-yellow-500"
  }`}
/>

            {task.title}
          </h3>

          <p
            className={`mb-5 leading-7 transition-all duration-300 group-hover:text-black ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {task.description}
          </p>

          <p
  className={`text-sm mb-4 ${
    darkMode ? "text-gray-400" : "text-gray-500"
  }`}
>
  📅 Created: {new Date(task.created_at).toLocaleDateString()}
</p>


          <p className="mb-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-110 shadow-sm ${
                task.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : task.status === "in-progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.status}
            </span>
          </p>

          <p className="mb-5">
  <span
    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
      task.priority === "High"
        ? "bg-red-100 text-red-700"
        : task.priority === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {task.priority === "High"
      ? "🔴 High Priority"
      : task.priority === "Medium"
      ? "🟡 Medium Priority"
      : "🟢 Low Priority"}
  </span>
</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => handleEditChange(task)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              disabled={deletingTaskId === task.id}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {deletingTaskId === task.id
                ? "🗑 Deleting..."
                : "🗑 Delete"}
            </button>
          </div>
        </div>
            )}
          </Draggable>
      ))}

      {provided.placeholder}
    </div>
  )}
</Droppable>
</div>
    </div>
  )}
</div>



</div>
</div>
</DragDropContext>
);
}


export default Dashboard;
