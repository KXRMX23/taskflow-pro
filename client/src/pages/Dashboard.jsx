import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {

    const testAPI = async () => {
      try {
        const res = await API.get("/tasks");
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
    <div>
      <h1>Dashboard</h1>

      <form onSubmit={handleSubmit}>
    <input
        type="text"
        name="title"
        placeholder="Task Title"
        value={newTask.title}
        onChange={handleChange}
    />

    <br /><br />

    <textarea
        name="description"
        placeholder="Task Description"
        value={newTask.description}
        onChange={handleChange}
    />

    <br /><br />

    <button type="submit">
        {editingTaskId ? "Update Task" : "Create Task"}  
    </button>

    <hr />
</form>

     <div>
    {tasks.map((task) => (
        <div
            key={task.id}
            style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
            }}
        >
            <h3>{task.title}</h3>

            <p>{task.description}</p>

            <strong>Status:</strong> {task.status}

            <button onClick={() => handleEditChange(task)}>
                Edit Task
            </button>

            <button onClick={() => deleteTask(task.id)}>
                Delete Task
            </button>
        </div>
        
    ))}
</div> 
    </div>
  );
}


export default Dashboard;