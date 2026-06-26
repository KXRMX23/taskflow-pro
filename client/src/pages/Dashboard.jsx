import { useEffect } from "react";
import API from "../services/api";

function Dashboard() {

  useEffect(() => {

    const testAPI = async () => {
      try {
        const res = await API.get("/tasks");
        console.log(res.data);
      } catch (err) {
        console.log(err.response?.data || err.message);
      }
    };

    testAPI();

  }, []);

  return (
    <h1>Dashboard Page</h1>
  );
}

export default Dashboard;