import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

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

    setEditingTaskId(null);
} else {
    const response = await API.post("/tasks", newTask);

    setTasks([...tasks, response.data.task]);
}

setNewTask({
    title: "",
    description: "",
});

    } catch (err) {
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
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto px-6">
      <h1 className="text-5xl font-bold text-blue-700 mb-8">Dashboard</h1>

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

      <form onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-xl">
    <input
        type="text"
        name="title"
        placeholder="Task Title"
        value={newTask.title}
        onChange={handleChange}
        className="w-full border rounded-lg p-3 mb-4"
    />

    <br /><br />

    <textarea
        name="description"
        placeholder="Task Description"
        value={newTask.description}
        onChange={handleChange}
        className="w-full border rounded-lg p-3 mb-4"
    />
      
    <select
        name="status"
        value={newTask.status}
        onChange={handleChange}
        className="w-full border rounded-lg p-3 mb-4"
    >
      <option value="pending">Pending</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>

    <button type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
        {editingTaskId ? "Update Task" : "Create Task"}  
    </button>

    <hr />
</form>

     <div>
    {tasks.map((task) => (
        <div
            key={task.id}
            className="bg-white rounded-xl shadow-lg p-6 mb-6 border"
        >
            <h3 className="text-2xl font-bold mb-2">{task.title}</h3>

            <p className="text-gray-700 mb-3">{task.description}</p>

            <p className="mb-4">
            <strong className="text-gray-800">Status:</strong> {task.status}
            </p>

            <button onClick={() => handleEditChange(task)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg mr-3 transition">
                Edit Task
            </button>

            <button onClick={() => deleteTask(task.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                Delete Task
            </button>
        </div>
        
    ))}
</div> 
</div>
    </div>
  );
}


export default Dashboard;