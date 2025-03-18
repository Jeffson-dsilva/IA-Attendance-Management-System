import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaUserGraduate, 
  FaClipboardList, 
  FaSignOutAlt, 
  FaRegCalendarAlt,
  FaBookOpen,
} from "react-icons/fa";

import { RadialBarChart, RadialBar, Legend, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import AttendancePage from "./AttendancePage";
import IAMarksPage from "./IAMarksPage";
import TimetablePage from "./TimetablePage";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      const storedUser = sessionStorage.getItem("user");

      if (!storedUser) {
        console.warn("🔴 No student session found! Redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        console.log("✅ Fetched user from sessionStorage:", user);
        setStudent(user); // Directly set the user
      } catch (error) {
        console.error("❌ Error parsing student data:", error);
        sessionStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Sample Attendance Data (Can be replaced with API data)
  const attendanceData = [
    { subject: "23MCA301", percentage: 91, fill: "#FF6384" },
    { subject: "23MCA302", percentage: 93, fill: "#36A2EB" },
    { subject: "23MCA303", percentage: 85, fill: "#FFCE56" },
    { subject: "23MCL306", percentage: 70, fill: "#4CAF50" },
    { subject: "23MCL307", percentage: 80, fill: "#9966FF" }
  ];

  // Sample IA Marks Data (Can be replaced with API data)
  const marksData = [
    { subject: "23MCA301", IA1: 18, IA2: 22 },
    { subject: "23MCA302", IA1: 20, IA2: 18 },
    { subject: "23MCA303", IA1: 16, IA2: 19 },
    { subject: "23MCL306", IA1: 14, IA2: 16 },
    { subject: "23MCL307", IA1: 21, IA2: 24 }
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div className={`bg-blue-700 text-white p-5 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <button className="mb-4 self-end text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <nav className="flex flex-col space-y-4">
          <button className={`flex items-center p-2 rounded ${activeTab === "dashboard" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <FaUserGraduate /> {sidebarOpen && <span className="ml-2">Dashboard</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "attendance" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("attendance")}>
            <FaClipboardList /> {sidebarOpen && <span className="ml-2">Attendance</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "marks" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("marks")}>
            <FaBookOpen /> {sidebarOpen && <span className="ml-2">IA Marks</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "timetable" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("timetable")}>
            <FaRegCalendarAlt /> {sidebarOpen && <span className="ml-2">Time Table</span>}
          </button>
          <button className="flex items-center p-2 rounded bg-red-600" onClick={handleLogout}>
            <FaSignOutAlt /> {sidebarOpen && <span className="ml-2">Logout</span>}
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-6 transition-all duration-300">
        {/* Header with Student Info */}
        <div className="bg-blue-700 shadow-md p-4 flex items-center justify-between w-full rounded-lg">
          <img src="/collegelogo.png" alt="College Logo" className="h-15" />
          <p className="text-white text-lg font-semibold">{student?.uname} (USN: {student?.usn})</p>
        </div>

        {/* Dynamic Content */}
        <div className="mt-6">
          {activeTab === "dashboard" && (
            <div className="p-4 bg-white shadow-md rounded">
              <h2 className="text-xl font-semibold text-blue-700">Welcome, {student?.uname}!</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* Attendance Chart */}
                <div className="p-4 bg-gray-100 shadow-md rounded">
                  <h3 className="text-lg font-semibold text-center">Attendance</h3>
                  <RadialBarChart width={400} height={300} cx="40%" cy="50%" innerRadius="40%" outerRadius="90%" barSize={10} data={attendanceData}>
                    <RadialBar minAngle={15} background clockWise dataKey="percentage" />
                    <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.subject]} />
                    <Legend iconSize={10} layout="vertical" align="right" verticalAlign="middle" payload={attendanceData.map((item) => ({ value: item.subject, type: "circle", color: item.fill }))} />
                  </RadialBarChart>
                </div>

                {/* IA Marks Chart */}
                <div className="p-4 bg-gray-100 shadow-md rounded">
                  <h3 className="text-lg font-semibold text-center">IA Marks</h3>
                  <BarChart width={500} height={300} data={marksData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="IA1" fill="#8884d8" barSize={12} />
                    <Bar dataKey="IA2" fill="#82ca9d" barSize={12} />
                  </BarChart>
                </div>
              </div>
            </div>
          )}
          {activeTab === "attendance" && <AttendancePage />}
          {activeTab === "marks" && <IAMarksPage />}
          {activeTab === "timetable" && <TimetablePage />}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
