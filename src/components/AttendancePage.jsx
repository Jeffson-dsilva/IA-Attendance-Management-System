import { useState, useEffect } from "react";
import {
  ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip} from "recharts";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [detailedRecords, setDetailedRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) return;

    const userData = JSON.parse(storedUser);
    setUser(userData);

    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student-attendance?email=${userData.email}`);
        if (!response.ok) throw new Error("Failed to fetch attendance data");

        const data = await response.json();
        console.log("📌 Attendance Data:", data);

        const formattedData = data.subjectAttendance.map((item, index) => ({
          subject: item.subject,
          percentage: item.percentage,
          fill: ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"][index % 4],
        }));

        setAttendanceData(formattedData);
        setDetailedRecords(data.attendanceRecords || []);
      } catch (error) {
        console.error("❌ Error fetching attendance data:", error);
      }
      setLoading(false);
    };

    fetchAttendance();
  }, []);

  // ✅ Filter records by subject & date
  const filteredRecords = detailedRecords.filter((record) =>
    (selectedSubject === "All" || record.subject === selectedSubject) &&
    (!dateRange.start || record.date >= dateRange.start) &&
    (!dateRange.end || record.date <= dateRange.end)
  );

  if (loading) return <div className="text-center mt-6">Loading...</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Attendance Details</h2>

      {/* Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="font-semibold">Filter by Subject:</label>
          <select
            className="border p-2 rounded ml-2"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All</option>
            {attendanceData.map((item, index) => (
              <option key={index} value={item.subject}>
                {item.subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold">Filter by Date Range:</label>
          <input
            type="date"
            className="border p-2 rounded ml-2"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            className="border p-2 rounded ml-2"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Attendance Summary & Chart */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <table className="min-w-full bg-gray-100 shadow-md rounded">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-2">Subject</th>
                <th className="p-2">Attendance (%)</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((item, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="p-2">{item.subject}</td>
                  <td className="p-2">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center">
          <ResponsiveContainer width={400} height={300}>
            <RadialBarChart innerRadius="40%" outerRadius="90%" barSize={10} data={attendanceData}>
              <RadialBar minAngle={15} background clockWise dataKey="percentage" />
              <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.subject]} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Attendance Records */}
      <div className="mt-6 p-4 bg-gray-100 shadow-md rounded">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Detailed Attendance Records</h3>
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="p-2">Date</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Faculty</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="p-2">{record.date}</td>
                  <td className="p-2">{record.subject}</td>
                  <td className="p-2">{record.facultyName}</td>
                  <td className={`p-2 ${record.status === "Present" ? "text-green-600" : "text-red-600"}`}>
                    {record.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-600">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
