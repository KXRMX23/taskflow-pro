import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import EmptyState from "../assets/empty-state.svg";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";



import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import {

  Moon,
  Sun,
  ClipboardList,
  Plus,
  LogOut,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
 } from "recharts";
 
 




function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "Medium",
    tags: "",
    due_date: "",
   });
 
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [user, setUser] = useState(null);

  const hour = new Date().getHours();

  let greeting = "Good Evening";
  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const userName = user?.name || "User";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const totalTasks = tasks.length;

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  const highPriorityCount = tasks.filter((task) => task.priority === "High").length;

  const todaysTasks = tasks.filter((task) => {
    const todayStr = new Date().toDateString();
    return new Date(task.created_at).toDateString() === todayStr;
  }).length;

  console.log(tasks);
  console.log({ pendingCount, inProgressCount, completedCount});
  const chartData = [
    { name: "Pending", value: pendingCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Completed", value: completedCount },
  ];

  const barChartData = [
    { name: "Pending", tasks: pendingCount },
    { name: "In Progress", tasks: inProgressCount },
    { name: "Completed", tasks: completedCount },
  ];

  const COLORS = ["#FACC15", "#3B82F6", "#22C55E"];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    console.log("priorityFilter:", priorityFilter);

    console.log({
      title: task.title, 
      status: task.status,
      priority: task.priority,
      matchesSearch,
      matchesStatus,
      matchesPriority
    });

    return matchesSearch && matchesStatus && matchesPriority;
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

  const selectedDateStr = selectedDate.toDateString();

const pendingTasks = sortedTasks.filter(
(task) =>
task.status === "pending" &&
(!task.due_date ||
new Date(task.due_date).toDateString() === selectedDateStr)
);

const inProgressTasks = sortedTasks.filter(
(task) =>
task.status === "in-progress" &&
(!task.due_date ||
new Date(task.due_date).toDateString() === selectedDateStr)
);

const completedTasks = sortedTasks.filter(
(task) =>
task.status === "completed" &&
(!task.due_date ||
new Date(task.due_date).toDateString() === selectedDateStr)
);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get("/tasks");

        console.log("Response:", res.data);
        console.log("Is Array:", Array.isArray(res.data));
        setTasks(res.data);

        const userRes = await API.get("/users/me");
        setUser(userRes.data);
        setLoading(false);
      } catch (err) {
        console.log(err.response?.data || err.message);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);
 
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
   }, [darkMode]);
 
  const handleChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

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
        setTasks(tasks.map((task) => (task.id === editingTaskId ? response.data.task : task)));
        toast.success("Task updated successfully!");
        setEditingTaskId(null);
      } else {
        const response = await API.post("/tasks", newTask);
        setTasks([...tasks, response.data.task]);
        toast.success("Task created successfully!");
      }
      setNewTask({ title: "", description: "", status: "pending", priority: "Medium", tags: "", due_date: "", });
      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
      toast.error("Something went wrong. Please try again.");
      console.log(err.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this task?");
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
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId;
    try {
      await API.put(`/tasks/${draggableId}`, {
        ...tasks.find((task) => task.id === Number(draggableId)),
        status: newStatus,
      });
      setTasks((prev) =>
        prev.map((task) => (task.id === Number(draggableId) ? { ...task, status: newStatus } : task))
      );
      toast.success("Task moved successfully!");
    } catch (err) {
      toast.error("Failed to move task");
    }
  };

  // Reusable card — used by all three kanban columns below
  const TaskCard = ({ task, index }) => {

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
    return (
     
     <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] p-6 mb-8 border transition-all duration-300 ease-out ${
            isOverdue
              ? "bg-white border-2 border-red-500"
              : darkMode
                ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                : "bg-white border-gray-200 hover:border-blue-400"
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

          <h3
            className={`text-3xl font-bold tracking-tight mb-3 transition-all duration-300 group-hover:translate-x-1 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>

          

           <div className={`mb-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
{task.description.includes("\n") ? (
<ul className="list-disc list-inside space-y-2">
{task.description
.split("\n")
.filter((item) => item.trim())
.map((item, index) => (
<li key={index}>{item}</li>
))}
</ul>
) : (
<p className="leading-7">{task.description}</p>
)}
</div>

          <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            📅 Created: {new Date(task.created_at).toLocaleDateString()}
          </p>

          {task.due_date && (
            <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              🕒 Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}

          <p className="mb-4">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
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

          {task.tags && (
<p className="mb-4">
<span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700">
🏷️ {task.tags}
</span>
</p>
)}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => handleEditChange(task)}
              className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              disabled={deletingTaskId === task.id}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              {deletingTaskId === task.id ? "🗑 Deleting..." : "🗑 Delete"}
            </button>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
};


  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition-all duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Loading your tasks...</h2>
        <p className="text-gray-500 dark:text-gray-400">Please wait while we prepare your dashboard.</p>
      </div>
    );
  }

  const dueDates = tasks
  .filter(task => task.due_date)
  .map(task => new Date(task.due_date).toDateString());

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen transition-all duration-300 ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:pt-10 pb-10">
           {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10">
            <div>
              <h1 className="text-5xl font-extrabold">
                {greeting}, {userName} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{today}</p>
            </div>

            <div className="flex items-center gap-4 self-start lg:self-auto">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
{user?.profile_image ? (
<img
src={user.profile_image}
alt="Profile"
className="w-full h-full rounded-full object-cover"
/>
) : (
userName.charAt(0).toUpperCase()
)}
</div>


              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 rounded-xl border px-6 py-3 shadow-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-300"
              }`}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`rounded-xl border px-4 py-3 shadow-sm transition ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-300"
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
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`rounded-xl border px-4 py-3 shadow-sm transition ${
                darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0 }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <p className="text-sm text-gray-500">📋 Total Tasks</p>
              <h2 className="text-3xl font-bold mt-2">{totalTasks}</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <p className="text-sm text-gray-500">✅ Completion Rate</p>
              <h2 className="text-3xl font-bold mt-2">{completionRate}%</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <p className="text-sm text-gray-500">🔥 High Priority</p>
              <h2 className="text-3xl font-bold mt-2">{highPriorityCount}</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <p className="text-sm text-gray-500">📅 Today's Tasks</p>
              <h2 className="text-3xl font-bold mt-2">{todaysTasks}</h2>
            </motion.div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="group bg-yellow-100 rounded-xl shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-yellow-200 cursor-pointer p-6"
            >
              <h2 className="text-xl font-bold text-yellow-700 flex items-center gap-2">🟡 Pending</h2>
              <p className="text-5xl font-extrabold mt-3">{pendingCount}</p>
              <p className="text-sm text-gray-600 mt-2">Tasks waiting to be started</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="group bg-blue-100 rounded-xl shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-blue-200 cursor-pointer p-6"
            >
              <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">🔵 In Progress</h2>
              <p className="text-5xl font-extrabold mt-3">{inProgressCount}</p>
              <p className="text-sm text-gray-600 mt-2">Tasks currently being worked on</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="group bg-green-100 rounded-xl shadow-lg hover:shadow-2xl hover:ring-2 hover:ring-green-200 cursor-pointer p-6"
            >
              <h2 className="text-xl font-bold text-green-700 flex items-center gap-2">🟢 Completed</h2>
              <p className="text-5xl font-extrabold mt-3">{completedCount}</p>
              <p className="text-sm text-gray-600 mt-2">Tasks that have been finished</p>
            </motion.div>
          </div>

          {/* Task Analytics */}
          <div className={`p-6 rounded-2xl shadow-lg mb-10 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <h2 className="text-2xl font-bold mb-6">📈 Task Analytics</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                  isAnimationActive={true}
                  animationDuration={1200}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className={`rounded-2xl shadow-xl p-6 mt-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <h2 className="text-2xl font-bold mb-6">📊 Task Overview</h2>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barChartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="5 5" stroke="#E5E7EB" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                  <Bar dataKey="tasks" radius={[10, 10, 0, 0]} animationDuration={1200}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Pending"
                            ? "#FACC15"
                            : entry.name === "In Progress"
                            ? "#3B82F6"
                            : "#22C55E"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          <div
className={`rounded-2xl shadow-lg p-6 mt-6 ${
darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
}`}
>
<h2 className="text-2xl font-bold mb-6">
📅 Calendar
</h2>

<Calendar
onChange={setSelectedDate}
value={selectedDate}
tileClassName={({ date, view }) => {
if (view !== "month") return null;

const classes = [];

if (date.toDateString() === new Date().toDateString()) {
classes.push("today-tile");
}

if (dueDates.includes(date.toDateString())) {
classes.push("has-due-date");
}

return classes.join(" ");
}}
/>
</div> 
          </div>

          {/* Task manager heading + create button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Task Manager</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Plus size={20} />
              {showForm ? "Hide Form" : "Create Task"}
            </button>
          </div>

          {/* Create / edit task form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit}
                className={`w-full p-6 rounded-2xl shadow-lg mb-10 transition-all duration-300 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 ${
                    darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                  }`}
                />

                <textarea
                  name="description"
                  placeholder="Task Description (Press Enter for each task)"
                  value={newTask.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 resize-none ${
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
                    darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
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
                    darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"
                  }`}
                >
                  <option value="Low">🟢 Low Priority</option>
                  <option value="Medium">🟡 Medium Priority</option>
                  <option value="High">🔴 High Priority</option>
                </select>

                <input
type="text"
name="tags"
placeholder="Tags (Work, Study, Personal)"
value={newTask.tags}
onChange={handleChange}
className={`w-full border rounded-lg p-3 mb-4 transition-all duration-300 ${
darkMode
? "bg-gray-700 text-white border-gray-600"
: "bg-white text-black border-gray-300"
}`}
/>

<input
type="date"
name="due_date"
value={newTask.due_date}
onChange={handleChange}
className={`w-full border rounded-lg p-3 mb-4 transition
${
darkMode
? "bg-gray-700 text-white border-gray-600"
: "bg-white text-black border-gray-300"
}`}
/>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : editingTaskId ? "Update Task" : "Save Task"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Task lists */}
          <div>
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`rounded-xl shadow-lg p-10 text-center mt-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <img src={EmptyState} alt="No Tasks" className="w-72 mx-auto mb-6" />
                <h2 className={`text-2xl font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                  🔍 No Tasks Found
                </h2>
                <p className={`mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Try another keyword or create a new task to get started!
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-yellow-500">Pending</h2>
                  <Droppable droppableId="pending">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {pendingTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
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
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {inProgressTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
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
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {completedTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
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
      </motion.div>
    </DragDropContext>
  );
}
 
export default Dashboard;
