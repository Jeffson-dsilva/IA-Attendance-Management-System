import { useEffect, useState } from "react";

const ManageAttendance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [editingStatus, setEditingStatus] = useState({});

  const fetchAttendance = async () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5000/api/attendance?date=${selectedDate}`;
      console.log("🔍 Fetching attendance for:", selectedDate);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch attendance data");

      const data = await response.json();
      setStudents(data.records || []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recordId, status) => {
    setEditingStatus((prev) => ({
      ...prev,
      [recordId]: status,
    }));
  };

  const handleSave = async (recordId) => {
    try {
      const updatedStatus = editingStatus[recordId];

      const response = await fetch("http://localhost:5000/api/update-attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId, status: updatedStatus }),
      });

      if (!response.ok) throw new Error("Failed to update attendance");
      alert("Attendance updated successfully!");

      // Refresh attendance records
      fetchAttendance();
      setEditingStatus({});
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage Attendance</h2>

      {/* Date Picker with View Button */}
      <div className="flex space-x-4 mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={fetchAttendance} className="bg-blue-600 text-white px-4 py-2 rounded">
          View Attendance
        </button>
      </div>

      {loading ? (
        <div className="text-center mt-6">Loading...</div>
      ) : students.length === 0 ? (
        <p className="text-gray-600">No attendance records found for this date.</p>
      ) : (
        <table className="min-w-full bg-gray-100 shadow-md rounded">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">USN</th>
              <th className="p-2">Student Name</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Date</th>
              <th className="p-2">Hour</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((record, index) => (
              <tr key={record._id} className="border-t text-center">
                <td className="p-2">{record.usn}</td>
                <td className="p-2">{record.uname || "Unknown Student"}</td>
                <td className="p-2">{record.subject}</td>
                <td className="p-2">{record.date}</td>
                <td className="p-2">{record.hour}</td>
                <td className="p-2">
                  {editingStatus[record._id] !== undefined ? (
                    <select
                      value={editingStatus[record._id]}
                      onChange={(e) => handleEdit(record._id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  ) : (
                    <span className={`font-bold ${record.status === "present" ? "text-green-600" : "text-red-600"}`}>
                      {record.status}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {editingStatus[record._id] !== undefined ? (
                    <button onClick={() => handleSave(record._id)} className="bg-green-600 text-white px-2 py-1 rounded">
                      Save
                    </button>
                  ) : (
                    <button onClick={() => handleEdit(record._id, record.status)} className="bg-blue-600 text-white px-2 py-1 rounded">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageAttendance;
