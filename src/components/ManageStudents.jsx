import { useEffect, useState } from "react";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    usn: "",
    class: "",
    attendanceAbove: "",
    iaAbove: "",
    subject: "", // ✅ New Subject Filter
  });

  // ✅ Available Subjects (Modify based on actual subjects)
  const availableSubjects = ["23MCA301", "23MCA302", "23MCA303", "23MCA304"];

  // ✅ Fetch students from backend
  const fetchStudents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.subject) queryParams.append("subject", filters.subject); // ✅ Send subject as query param

      const response = await fetch(`http://localhost:5000/api/students?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch students data");

      const data = await response.json();
      setStudents(data.records || []);
      setFilteredStudents(data.records || []);
    } catch (error) {
      console.error("❌ Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filters.subject]); // ✅ Re-fetch on subject change

  // ✅ Apply Filters
  const applyFilters = () => {
    let filtered = [...students];

    if (filters.usn) {
      filtered = filtered.filter((student) => student.usn.includes(filters.usn));
    }
    if (filters.class) {
      filtered = filtered.filter((student) => student.assignedClass === filters.class);
    }
    if (filters.attendanceAbove) {
      filtered = filtered.filter((student) => parseFloat(student.attendancePercentage) >= Number(filters.attendanceAbove));
    }
    if (filters.iaAbove) {
      filtered = filtered.filter(
        (student) => student.IA1 >= Number(filters.iaAbove) || student.IA2 >= Number(filters.iaAbove)
      );
    }

    setFilteredStudents(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  if (loading) return <div className="text-center mt-6">Loading students data...</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage Students & Performance</h2>

      {/* 🔍 Filters Section */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by USN"
          className="border p-2 rounded"
          value={filters.usn}
          onChange={(e) => setFilters({ ...filters, usn: e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={filters.class}
          onChange={(e) => setFilters({ ...filters, class: e.target.value })}
        >
          <option value="">All Classes</option>
          <option value="A">Class A</option>
          <option value="B">Class B</option>
        </select>
        <input
          type="number"
          placeholder="Attendance Above (%)"
          className="border p-2 rounded"
          value={filters.attendanceAbove}
          onChange={(e) => setFilters({ ...filters, attendanceAbove: e.target.value })}
        />
        <input
          type="number"
          placeholder="IA Marks Above"
          className="border p-2 rounded"
          value={filters.iaAbove}
          onChange={(e) => setFilters({ ...filters, iaAbove: e.target.value })}
        />

        {/* ✅ Subject Filter */}
        <select
          className="border p-2 rounded"
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
        >
          <option value="">All Subjects</option>
          {availableSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Students Table */}
      <table className="w-full bg-gray-100 shadow-md rounded">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="p-2">USN</th>
            <th className="p-2">Name</th>
            <th className="p-2">Class</th>
            <th className="p-2">IA1 Marks</th>
            <th className="p-2">IA2 Marks</th>
            <th className="p-2">Attendance (%)</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-600">
                No students found.
              </td>
            </tr>
          ) : (
            filteredStudents.map((student) => (
              <tr key={student.usn} className="border-t text-center">
                <td className="p-2">{student.usn}</td>
                <td className="p-2">{student.uname}</td>
                <td className="p-2">{student.assignedClass || "Not Assigned"}</td>
                <td className="p-2">{student.IA1 || 0}</td>
                <td className="p-2">{student.IA2 || 0}</td>
                <td className="p-2">{student.attendancePercentage}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageStudents;
