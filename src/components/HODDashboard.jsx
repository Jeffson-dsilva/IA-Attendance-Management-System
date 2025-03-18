import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars, FaTimes, FaUserTie, FaChalkboardTeacher, FaUserGraduate,
  FaClipboardList, FaTable, FaFileDownload, FaSignOutAlt, FaMoon, FaSun
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import ManageFaculty from "./ManageFaculty";
import ManageStudents from "./ManageStudents";
import ManageTimetable from "./ManageTimetable";

const COLORS = ["#0088FE", "#FFBB28"]; // Colors for Pie Charts

const HODDashboard = () => {
  const [hod, setHOD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("23MCA301");
  const [analytics, setAnalytics] = useState(null);

  const navigate = useNavigate();

  // ✅ Fetch HOD Data
  useEffect(() => {
    const fetchHODData = async () => {
      const storedUser = sessionStorage.getItem("user");
      if (!storedUser) {
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        const response = await fetch(`http://localhost:5000/api/users/${user.email}`);
        if (!response.ok) throw new Error("Failed to fetch HOD data");

        const data = await response.json();
        setHOD(data.user);
      } catch (error) {
        console.error("❌ Error fetching HOD data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHODData();
  }, [navigate]);

  // ✅ Fetch Analytics (IA Marks & Attendance)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/analytics?subject=${selectedSubject}`);
        if (!response.ok) throw new Error("Failed to fetch analytics");

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("❌ Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [selectedSubject]);

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // ✅ Clear session
    navigate("/login");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100"} flex h-screen`}>
      {/* Sidebar */}
      <div className={`bg-blue-700 text-white p-5 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        <button className="mb-4 self-end text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <nav className="flex flex-col space-y-4">
          <button className={`flex items-center p-2 rounded ${activeTab === "dashboard" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <FaUserTie /> {sidebarOpen && <span className="ml-2">Dashboard</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "manage-faculty" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("manage-faculty")}>
            <FaChalkboardTeacher /> {sidebarOpen && <span className="ml-2">Manage Faculty</span>}
          </button>
          <button className={`flex items-center p-2 rounded ${activeTab === "manage-students" ? "bg-blue-500" : ""}`} onClick={() => setActiveTab("manage-students")}>
            <FaUserGraduate /> {sidebarOpen && <span className="ml-2">Manage Students</span>}
          </button>
          <button className="flex items-center p-2 rounded bg-red-500" onClick={handleLogout}>
            <FaSignOutAlt /> {sidebarOpen && <span className="ml-2">Logout</span>}
          </button>
          {/* Dark Mode Toggle */}
          <button className="flex items-center p-2 rounded bg-gray-700 mt-4" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />} {sidebarOpen && <span className="ml-2">{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 transition-all duration-300">
        <div className={`bg-blue-700 shadow-md p-4 flex items-center justify-between w-full rounded-lg ${darkMode ? "text-white" : "text-gray-100"}`}>
          <img src="/collegelogo.png" alt="College Logo" className="h-12" />
          <p>{hod?.uname} (Department: {hod?.department})</p>
        </div>

        <div className="mt-6">
          {activeTab === "dashboard" && (
            <div className="p-4 bg-white shadow-md rounded">
              <h2 className="text-xl font-semibold text-blue-700">Welcome, {hod?.uname}!</h2>

              {/* Subject Selection */}
              <div className="mb-4">
                <label className="font-semibold">Select Subject:</label>
                <select className="border p-2 w-full rounded mt-2" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="23MCA301">23MCA301</option>
                  <option value="23MCA302">23MCA302</option>
                  <option value="23MCA303">23MCA303</option>
                  <option value="23MCA304">23MCA304</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {/* IA Marks Overview */}
                <div className="p-4 bg-gray-100 shadow-md rounded">
                  <h3 className="text-lg font-semibold text-center">IA Marks Overview</h3>
                  <PieChart width={300} height={300}>
                    <Pie dataKey="value" data={[
                      { name: "Above 25", value: analytics?.iaDistribution.above25 || 0 },
                      { name: "Below 25", value: analytics?.iaDistribution.below25 || 0 }
                    ]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                      {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>

                {/* Attendance Overview */}
                <div className="p-4 bg-gray-100 shadow-md rounded">
                  <h3 className="text-lg font-semibold text-center">Attendance Overview</h3>
                  <PieChart width={300} height={300}>
                    <Pie dataKey="value" data={[
                      { name: "Above 85%", value: analytics?.attendanceDistribution.above85 || 0 },
                      { name: "Below 85%", value: analytics?.attendanceDistribution.below85 || 0 }
                    ]} cx="50%" cy="50%" outerRadius={80} fill="#4CAF50" label>
                      {COLORS.map((color, index) => <Cell key={index} fill={color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>
          )}

          {activeTab === "manage-faculty" && <ManageFaculty />}
          {activeTab === "manage-students" && <ManageStudents />}
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;
