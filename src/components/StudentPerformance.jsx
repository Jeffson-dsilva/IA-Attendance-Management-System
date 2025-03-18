import { useEffect, useState } from "react";

const StudentPerformance = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/student-performance");
      const data = await response.json();
      if (data.success) {
        setPerformanceData(data);
      } else {
        console.error("Error fetching student performance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching student performance:", error);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center mt-6">Loading...</div>;

  return (
    <div className="p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Student Performance Analysis</h2>

      {/* Performance Summary */}
      <div className="mb-6 p-4 bg-gray-100 rounded shadow">
        <p className="text-lg font-semibold">Attendance & IA Marks Summary</p>
        <p>📌 <strong>{performanceData.above85Attendance}%</strong> students have attendance above 85%</p>
        <p>📌 <strong>{performanceData.above25Marks}%</strong> students have marks greater than 25</p>
      </div>

      {/* Students with Low Attendance */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-red-600">⚠️ Students with Attendance Below 85%</h3>
        {performanceData.lowAttendanceStudents.length === 0 ? (
          <p className="text-gray-600">✅ No students with low attendance</p>
        ) : (
          <table className="min-w-full bg-gray-100 shadow-md rounded">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="p-2">USN</th>
                <th className="p-2">Name</th>
                <th className="p-2">Attendance (%)</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.lowAttendanceStudents.map((student, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="p-2">{student.usn}</td>
                  <td className="p-2">{student.name}</td>
                  <td className="p-2">{student.attendancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Students with Low IA Marks */}
      <div>
        <h3 className="text-lg font-semibold text-red-600">⚠️ Students with IA1 or IA2 Below 25</h3>
        {performanceData.lowMarksStudents.length === 0 ? (
          <p className="text-gray-600">✅ No students with low marks</p>
        ) : (
          <table className="min-w-full bg-gray-100 shadow-md rounded">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="p-2">USN</th>
                <th className="p-2">Name</th>
                <th className="p-2">IA1</th>
                <th className="p-2">IA2</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.lowMarksStudents.map((student, index) => (
                <tr key={index} className="border-t text-center">
                  <td className="p-2">{student.usn}</td>
                  <td className="p-2">{student.name}</td>
                  <td className="p-2">{student.IA1}</td>
                  <td className="p-2">{student.IA2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentPerformance;
