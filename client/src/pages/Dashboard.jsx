import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

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

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await API.post("/tasks", newTask);

        setTasks([...tasks, response.data.task]);

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
        Create Task
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