function StatCards({
  pendingCount,
  inProgressCount,
  completedCount,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

      <div className="group bg-yellow-100 rounded-xl shadow-lg p-6 hover:scale-105 transition">
        <h2 className="text-xl font-bold text-yellow-700">
          Pending
        </h2>

        <p className="text-5xl font-extrabold mt-2">
          {pendingCount}
        </p>

        <p className="text-sm text-gray-600 mt-2">
          Tasks waiting to be started
        </p>
      </div>

      <div className="group bg-blue-100 rounded-xl shadow-lg p-6 hover:scale-105 transition">
        <h2 className="text-xl font-bold text-blue-700">
          In Progress
        </h2>

        <p className="text-5xl font-extrabold mt-2">
          {inProgressCount}
        </p>

        <p className="text-sm text-gray-600 mt-2">
          Tasks currently being worked on
        </p>
      </div>

      <div className="group bg-green-100 rounded-xl shadow-lg p-6 hover:scale-105 transition">
        <h2 className="text-xl font-bold text-green-700">
          Completed
        </h2>

        <p className="text-5xl font-extrabold mt-2">
          {completedCount}
        </p>

        <p className="text-sm text-gray-600 mt-2">
          Finished tasks
        </p>
      </div>

    </div>
  );
}

export default StatCards;