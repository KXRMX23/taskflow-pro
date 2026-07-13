import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function ArchivedTasks() {
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
fetchArchivedTasks();
}, []);

const fetchArchivedTasks = async () => {
try {
const response = await API.get("/tasks/archived");
setTasks(response.data);
} catch (err) {
console.log(err.response?.data || err.message);
} finally {
setLoading(false);
}
};

const restoreTask = async (id) => {
try {
await API.put(`/tasks/${id}/restore`);

setTasks(tasks.filter((task) => task.id !== id));

toast.success("Task restored successfully!");
} catch (err) {
console.log(err.response?.data || err.message);
toast.error("Unable to restore task.");
}
};


if (loading) {
return (
<div className="text-center mt-10 text-xl">
Loading archived tasks...
</div>
);
}

return (
<div className="max-w-7xl mx-auto p-6">

<h1 className="text-4xl font-bold mb-8">
📦 Archived Tasks
</h1>

{tasks.length === 0 ? (
<p className="text-gray-500">
No archived tasks yet.
</p>
) : (
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{tasks.map((task) => (

<div
key={task.id}
className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5"
>
<h2 className="text-xl font-bold">
{task.title}
</h2>

<p className="mt-2 text-gray-500">
{task.description}
</p>

<div className="mt-4 flex items-center gap-3">
<span className="px-3 py-1 rounded-full bg-gray-200">
Archived
</span>

<button
onClick={() => restoreTask(task.id)}
className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
>
♻️ Restore
</button>
</div>

</div>

))}

</div>
)}

</div>
);
}

export default ArchivedTasks;
