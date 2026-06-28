import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "true";
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

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
      } catch (err) {
        console.log(err.response?.data || err.message);
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
    });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (editingTaskId) {
    const response = await API.put(`/tasks/${editingTaskId}`, newTask);
    
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
});

    } catch (err) {
        toast.error("Something went wrong. Please try again.");
        console.log(err.response?.data || err.message);
    }
};   

   const deleteTask = async (id) => {
  try {
    await API.delete(`/tasks/${id}`);

    setTasks(tasks.filter((task) => task.id !== id));
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};  

  return (
    <div className={`min-h-screen transition-all duration-300 ${
    darkMode
      ? "bg-gray-900 text-white"
      : "bg-gray-100 text-black"
  }`}
>
      
    <div className="flex justify-end p-6">
      <div className="max-w-4xl mx-auto px-6">
      <h1 className="text-5xl font-bold text-blue-700 mb-8">Dashboard</h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <div className="flex gap-4 mb-6">

    <input
  type="text"
  placeholder="🔍 Search tasks..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className={`flex-1 border rounded-lg px-4 py-3 transition-all duration-300 ${
    darkMode
      ? "bg-gray-700 text-white border-gray-600 placeholder-gray-300"
      : "bg-white text-black border-gray-300"
  }`}
/>

    <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className={`border rounded-lg px-4 py-2 transition-all duration-300 ${
  darkMode
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-black border-gray-300"
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
        className={`border rounded-lg px-4 py-2 transition-all duration-300 ${
  darkMode
    ? "bg-gray-700 text-white border-gray-600"
    : "bg-white text-black border-gray-300"
}`}
    >
    
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
    </select>

</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

  <div className="bg-yellow-100 rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-yellow-700">Pending</h2>
    <p className="text-4xl font-bold mt-2">{pendingCount}</p>
  </div>

  <div className="bg-blue-100 rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-blue-700">In Progress</h2>
    <p className="text-4xl font-bold mt-2">{inProgressCount}</p>
  </div>

  <div className="bg-green-100 rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-green-700">Completed</h2>
    <p className="text-4xl font-bold mt-2">{completedCount}</p>
  </div>

</div>

   <form
  onSubmit={handleSubmit}
  className={`p-6 rounded-xl shadow-lg mb-8 max-w-xl transition-all duration-300 ${
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

    <button type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
        {editingTaskId ? "Update Task" : "Create Task"}  
    </button>

    <hr/>

</form>

     <div>
       {filteredTasks.length === 0 ? (

        <div className="bg-white rounded-xl shadow-lg p-10 text-center mt-6">

            <h2 className="text-2xl font-bold text-gray-700">
                🔍 No Tasks Found
            </h2>

            <p className="text-gray-500 mt-3">
                Try another keyword or create a new task to get started!
            </p>

        </div>

    ) : (

    sortedTasks.map((task) => ( 
    
        <div
            key={task.id}
          className={`rounded-xl shadow-lg p-6 mb-6 border transition-all duration-300 ${
  darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200"
}`} 
        >
            <h3
  className={`text-2xl font-bold mb-2 ${
    darkMode ? "text-white" : "text-black"
  }`}
>
  {task.title}
</h3>

            <p
  className={`mb-3 ${
    darkMode ? "text-gray-300" : "text-gray-700"
  }`}
>
  {task.description}
</p>

            <p className="mb-4">
            <span
        className={`px-3 py-1 rounded-full text-sm font-semibold
        ${
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

            <button onClick={() => handleEditChange(task)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg mr-3 transition-all duration-300 hover:scale-105">
              ✏️ Edit 
            </button>

            <button onClick={() => deleteTask(task.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 hover:scale-105">
              🗑️ Delete 
            </button>
        </div>
    )  
    ))}
    
</div> 
</div>
    </div>
  </div> 
  );
}


export default Dashboard;