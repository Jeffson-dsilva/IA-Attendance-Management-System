import { useEffect, useState } from "react";

const ManageFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [selectedClass, setSelectedClass] = useState({});
  const [loading, setLoading] = useState(true);

  // List of subjects HOD can assign
  const availableSubjects = ["23MCA301", "23MCA302", "23MCA303", "23MCA304"];

  // ✅ Fetch faculty data
  const fetchFaculty = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/faculty");
      if (!response.ok) throw new Error("Failed to fetch faculty data");

      const data = await response.json();
      setFaculty(data.records || []);
    } catch (error) {
      console.error("❌ Error fetching faculty:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // ✅ Assign subjects & class to faculty
  const handleAssignSubjects = async (facultyId) => {
    const subjects = selectedSubjects[facultyId] || [];
    const assignedClass = selectedClass[facultyId];

    if (subjects.length === 0 || !assignedClass) {
      alert("Please select at least one subject and a class.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/faculty/assign-subject", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, subjects, assignedClass }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to assign subjects");

      alert("Subjects and Class assigned successfully!");
      fetchFaculty(); // Refresh list
    } catch (error) {
      console.error("❌ Error assigning subjects:", error);
    }
  };

  // ✅ Remove Faculty
  const handleRemoveFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to remove this faculty?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/faculty/remove/${facultyId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to remove faculty");

      alert("Faculty removed successfully!");
      fetchFaculty(); // Refresh list
    } catch (error) {
      console.error("❌ Error removing faculty:", error);
    }
  };

  if (loading) return <div className="text-center mt-6">Loading faculty data...</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage Faculty & Assign Subjects</h2>

      {/* Faculty Table */}
      <table className="w-full bg-gray-100 shadow-md rounded">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Department</th>
            <th className="p-2">Class</th>
            <th className="p-2">Assigned Subjects</th>
            <th className="p-2">Assign Subjects & Class</th>
            <th className="p-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          {faculty.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-600">
                No faculty records found.
              </td>
            </tr>
          ) : (
            faculty.map((fac) => (
              <tr key={fac._id} className="border-t text-center">
                <td className="p-2">{fac.uname}</td>
                <td className="p-2">{fac.email}</td>
                <td className="p-2">{fac.department}</td>
                <td className="p-2">{fac.assignedClass ? `Class ${fac.assignedClass}` : "Not Assigned"}</td>
                <td className="p-2">
                  {fac.assignedSubjects && fac.assignedSubjects.length > 0
                    ? fac.assignedSubjects.join(", ")
                    : "No subjects assigned"}
                </td>
                <td className="p-2">
                  {/* Class Selection */}
                  <select
                    className="border p-2 rounded mb-2"
                    value={selectedClass[fac._id] || ""}
                    onChange={(e) =>
                      setSelectedClass({
                        ...selectedClass,
                        [fac._id]: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Class</option>
                    <option value="A">Class A </option>
                    <option value="B">Class B</option>
                  </select>

                  {/* Subject Selection */}
                  <select
                    multiple
                    className="border p-2 rounded"
                    onChange={(e) =>
                      setSelectedSubjects({
                        ...selectedSubjects,
                        [fac._id]: Array.from(e.target.selectedOptions, (opt) => opt.value),
                      })
                    }
                  >
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>

                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded ml-2 mt-2"
                    onClick={() => handleAssignSubjects(fac._id)}
                  >
                    Assign
                  </button>
                </td>
                <td className="p-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleRemoveFaculty(fac._id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageFaculty;
